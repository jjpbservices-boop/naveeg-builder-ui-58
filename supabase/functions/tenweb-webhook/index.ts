import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret'
};

serve(async (req) => {
  console.log(`[Webhook v1.2] ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Method not allowed'
      }), {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Get environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const WEBHOOK_SECRET = Deno.env.get('TENWEB_WEBHOOK_SECRET'); // Optional secret for verification

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables');
      return new Response(JSON.stringify({
        error: 'Server configuration error'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify webhook secret if configured
    if (WEBHOOK_SECRET) {
      const providedSecret = req.headers.get('X-Webhook-Secret');
      if (providedSecret !== WEBHOOK_SECRET) {
        console.error('Invalid webhook secret');
        return new Response(JSON.stringify({
          error: 'Unauthorized'
        }), {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
    }

    // Parse webhook payload
    const payload = await req.json();
    console.log('Received 10Web webhook:', JSON.stringify(payload, null, 2));

    // Handle 10Web validation requests
    if (payload.test === true) {
      console.log('10Web webhook validation test received');
      return new Response(JSON.stringify({
        success: true,
        message: 'Webhook validation successful'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Extract relevant information from the payload
    const { site_id, website_id, status, event_type, data } = payload;
    
    // Use website_id if available, fallback to site_id for compatibility
    const siteIdentifier = website_id || site_id;
    
    if (!siteIdentifier) {
      console.error('Missing site_id or website_id in webhook payload');
      return new Response(JSON.stringify({
        error: 'Missing site identifier'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Log the event first (this is safe and doesn't interfere)
    const { error: eventError } = await supabase.from('events').insert({
      site_id: siteIdentifier,
      website_id: siteIdentifier, // Store both for compatibility
      label: event_type || 'tenweb_webhook',
      data: payload,
      created_at: new Date().toISOString()
    });

    if (eventError) {
      console.error('Error logging event:', eventError);
      // Continue processing even if logging fails
    }

    // CRITICAL: Check if site is currently being generated before updating
    const { data: siteData, error: checkError } = await supabase
      .from('sites')
      .select('status, is_generating')
      .or(`id.eq.${siteIdentifier},website_id.eq.${siteIdentifier}`)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking site status:', checkError);
    }

    const isCurrentlyGenerating = siteData?.is_generating || siteData?.status === 'generating';

    // SAFE STATUS UPDATES: Only update certain statuses, avoid interfering with generation
    const safeStatusUpdates = ['published', 'ready', 'live', 'completed'];
    const dangerousStatusUpdates = ['generating', 'creating', 'processing'];

    if (status && !isCurrentlyGenerating && safeStatusUpdates.includes(status.toLowerCase())) {
      // Safe to update - site is not generating
      const updateData: any = {
        status: status,
        updated_at: new Date().toISOString()
      };

      // Only add URLs if they're provided
      if (data?.admin_url) updateData.admin_url = data.admin_url;
      if (data?.site_url) updateData.site_url = data.site_url;

      const { error: updateError } = await supabase
        .from('sites')
        .update(updateData)
        .or(`id.eq.${siteIdentifier},website_id.eq.${siteIdentifier}`);

      if (updateError) {
        console.error('Error updating site:', updateError);
        return new Response(JSON.stringify({
          error: 'Failed to update site'
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }

      console.log(`✅ Updated site ${siteIdentifier} with status: ${status}`);
      
    } else if (status && isCurrentlyGenerating) {
      console.log(`⚠️ Skipped status update for site ${siteIdentifier} - currently generating (${siteData?.status})`);
      
    } else if (status && dangerousStatusUpdates.includes(status.toLowerCase())) {
      console.log(`⚠️ Skipped dangerous status update: ${status} for site ${siteIdentifier}`);
    }

    // Handle specific event types
    switch (event_type) {
      case 'site_published':
      case 'site_ready':
        // Safe to update URLs and mark as complete
        if (data?.admin_url || data?.site_url) {
          const updateData: any = {
            updated_at: new Date().toISOString()
          };
          if (data.admin_url) updateData.admin_url = data.admin_url;
          if (data.site_url) updateData.site_url = data.site_url;
          if (!isCurrentlyGenerating) updateData.status = 'ready';

          await supabase
            .from('sites')
            .update(updateData)
            .or(`id.eq.${siteIdentifier},website_id.eq.${siteIdentifier}`);
        }
        break;
        
      case 'generation_started':
        // Only update if not already marked as generating
        if (!isCurrentlyGenerating) {
          await supabase
            .from('sites')
            .update({ 
              status: 'generating', 
              is_generating: true,
              updated_at: new Date().toISOString()
            })
            .or(`id.eq.${siteIdentifier},website_id.eq.${siteIdentifier}`);
        }
        break;
        
      case 'generation_completed':
        // Mark generation as complete
        await supabase
          .from('sites')
          .update({ 
            is_generating: false,
            status: 'ready',
            updated_at: new Date().toISOString()
          })
          .or(`id.eq.${siteIdentifier},website_id.eq.${siteIdentifier}`);
        break;
        
      case 'generation_failed':
        // Mark generation as failed
        await supabase
          .from('sites')
          .update({ 
            is_generating: false,
            status: 'error',
            updated_at: new Date().toISOString()
          })
          .or(`id.eq.${siteIdentifier},website_id.eq.${siteIdentifier}`);
        break;
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Webhook processed successfully',
      site_id: siteIdentifier,
      event_type: event_type,
      was_generating: isCurrentlyGenerating
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error in tenweb-webhook:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});