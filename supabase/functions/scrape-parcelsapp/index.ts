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
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      }
    })
    const html = await response.text()
    
    console.log('Raw HTML content:', html)
    console.log('HTML length:', html.length)
    
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    if (!doc) {
      throw new Error('Failed to parse HTML')
    }
    
    const events = []
    const eventElements = doc.querySelectorAll('.event')
    
    console.log('Found event elements:', eventElements?.length)
    
    eventElements?.forEach(event => {
      const timeElement = event.querySelector('.event-time')
      const contentElement = event.querySelector('.event-content')
      
      if (timeElement && contentElement) {
        const dateElement = timeElement.querySelector('strong')
        const timeSpan = timeElement.querySelector('span')
        const statusElement = contentElement.querySelector('strong')
        const locationElement = contentElement.querySelector('.location')
        const carrierElement = contentElement.querySelector('.carrier')
        
        if (dateElement && timeSpan && statusElement) {
          events.push({
            date: dateElement.textContent.trim(),
            time: timeSpan.textContent.trim(),
            status: statusElement.textContent.trim(),
            location: locationElement ? locationElement.textContent.trim() : '',
            carrier: carrierElement ? carrierElement.textContent.trim() : ''
          })
        }
      }
    })
    
    console.log('Parsed events:', events.length)

    return new Response(
      JSON.stringify({
        success: true,
        trackingUrl: url,
        events,
        rawHtml: html
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