import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { trackingNumber } = await req.json()
    console.log('Fetching tracking info for:', trackingNumber)

    const url = `https://parcelsapp.com/en/tracking/${trackingNumber}`
    console.log('Fetching URL:', url)

    const response = await fetch(url)
    const html = await response.text()
    
    console.log('HTML content length:', html.length)

    return new Response(
      JSON.stringify({
        success: true,
        html,
        trackingUrl: url
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})