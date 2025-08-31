import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface PSIRequest {
  url: string
  strategy?: 'mobile' | 'desktop'
  locale?: string
  categories?: string[]
}

Deno.serve(async (req) => {
  console.log(`PSI Proxy: ${req.method} ${req.url}`)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const PAGESPEED_API_KEY = Deno.env.get('PAGESPEED_API_KEY')
    if (!PAGESPEED_API_KEY) {
      console.error('PSI Proxy: PAGESPEED_API_KEY not found in environment')
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { url, strategy = 'mobile', locale = 'en', categories = ['performance', 'seo', 'best-practices', 'accessibility'] }: PSIRequest = await req.json()

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`PSI Proxy: Running PageSpeed for ${url} (${strategy})`)

    const psiUrl = new URL('https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed')
    psiUrl.searchParams.set('url', url)
    psiUrl.searchParams.set('strategy', strategy)
    psiUrl.searchParams.set('locale', locale)
    psiUrl.searchParams.set('key', PAGESPEED_API_KEY)
    
    // Add categories
    categories.forEach(category => {
      psiUrl.searchParams.append('category', category)
    })

    const response = await fetch(psiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('PSI API Error:', data)
      return new Response(
        JSON.stringify({ error: data.error || 'PageSpeed API request failed' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`PSI Proxy: Successfully retrieved data for ${url}`)
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('PSI Proxy Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})