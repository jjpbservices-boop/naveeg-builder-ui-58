import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
}

// Helper function to create trial subscription for published site
async function createTrialSubscriptionForSite(supabase: any, siteId: string) {
  try {
    console.log(`Creating trial subscription for site ${siteId}`)
    
    // Get site information to find user_id
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('user_id')
      .eq('id', siteId)
      .single()

    if (siteError || !site?.user_id) {
      console.error('Error getting site user_id:', siteError)
      return
    }

    // Check if trial already exists for this user and site - enhanced duplicate check
    const { data: existingSubscriptions } = await supabase
      .from('subscriptions')
      .select('id, status, created_at')
      .eq('user_id', site.user_id)
      .eq('site_id', siteId)

    if (existingSubscriptions && existingSubscriptions.length > 0) {
      console.log(`Trial subscription already exists for site ${siteId} - found ${existingSubscriptions.length} existing subscriptions`)
      return
    }

    // Additional rate limiting - check for any recent trial creation (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data: recentTrials } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', site.user_id)
      .gte('created_at', fiveMinutesAgo)

    if (recentTrials && recentTrials.length > 0) {
      console.log(`Rate limiting: Recent trial created for user ${site.user_id} within last 5 minutes`)
      return
    }

    // Create trial subscription using the database function
    const { data: trialId, error: trialError } = await supabase
      .rpc('create_trial_subscription', {
        p_user_id: site.user_id,
        p_site_id: siteId
      })

    if (trialError) {
      console.error('Error creating trial subscription:', trialError)
      return
    }

    console.log(`Successfully created trial subscription ${trialId} for site ${siteId}`)
  } catch (error) {
    console.error('Error in createTrialSubscriptionForSite:', error)
  }
}

serve(async (req) => {
  console.log(`[Webhook v1.1] ${req.method} ${req.url}`);
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const WEBHOOK_SECRET = Deno.env.get('TENWEB_WEBHOOK_SECRET') // Optional secret for verification

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables')
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Verify webhook secret if configured
    if (WEBHOOK_SECRET) {
      const providedSecret = req.headers.get('X-Webhook-Secret')
      if (providedSecret !== WEBHOOK_SECRET) {
        console.error('Invalid webhook secret')
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // Parse webhook payload
    const payload = await req.json()
    console.log('Received 10Web webhook:', JSON.stringify(payload, null, 2))

    // Handle 10Web validation requests
    if (payload.test === true) {
      console.log('10Web webhook validation test received')
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Webhook validation successful' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Extract relevant information from the payload
    const { site_id, status, event_type, data } = payload

    if (!site_id) {
      console.error('Missing site_id in webhook payload')
      return new Response(JSON.stringify({ error: 'Missing site_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Log the event
    const { error: eventError } = await supabase
      .from('events')
      .insert({
        site_id: site_id,
        label: event_type || 'tenweb_webhook',
        data: payload,
      })

    if (eventError) {
      console.error('Error logging event:', eventError)
      // Continue processing even if logging fails
    }

    // Update site status if provided
    if (status) {
      const { error: updateError } = await supabase
        .from('sites')
        .update({ 
          status: status,
          ...(data?.admin_url && { admin_url: data.admin_url }),
          ...(data?.site_url && { site_url: data.site_url }),
        })
        .eq('id', site_id)

      if (updateError) {
        console.error('Error updating site:', updateError)
        return new Response(JSON.stringify({ error: 'Failed to update site' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      console.log(`Updated site ${site_id} with status: ${status}`)

      // Create trial subscription after successful site publication
      if (status === 'published' && data?.site_url) {
        await createTrialSubscriptionForSite(supabase, site_id)
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Webhook processed successfully',
      site_id: site_id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in tenweb-webhook:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})