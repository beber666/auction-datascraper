import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { trackingNumber } = await req.json()
    console.log('Fetching tracking info for:', trackingNumber)

    const url = `https://parcelsapp.com/en/tracking/${trackingNumber}`
    const response = await fetch(url)
    const html = await response.text()
    
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    const events = []
    const eventElements = doc?.querySelectorAll('.event')
    
    eventElements?.forEach(event => {
      const timeElement = event.querySelector('.event-time')
      const contentElement = event.querySelector('.event-content')
      
      if (timeElement && contentElement) {
        const date = timeElement.querySelector('strong')?.textContent?.trim()
        const time = timeElement.querySelector('span')?.textContent?.trim()
        const status = contentElement.querySelector('strong')?.textContent?.trim()
        const location = contentElement.querySelector('.location')?.textContent?.trim()
        const carrier = contentElement.querySelector('.carrier')?.textContent?.trim()
        
        if (date && time && status) {
          events.push({
            date,
            time,
            status,
            location: location || '',
            carrier: carrier?.trim() || ''
          })
        }
      }
    })

    return new Response(
      JSON.stringify({
        success: true,
        trackingUrl: url,
        events
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