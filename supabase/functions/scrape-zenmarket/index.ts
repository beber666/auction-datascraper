import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    
    if (!url || !url.includes('zenmarket.jp')) {
      return new Response(
        JSON.stringify({ error: 'Invalid URL' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Scraping URL:', url);

    // Fetch the page
    const response = await fetch(url)
    const html = await response.text()
    
    // Parse HTML
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    if (!doc) {
      throw new Error('Failed to parse HTML')
    }

    // Extract data
    const productName = doc.querySelector('#itemTitle')?.textContent?.trim() || 'N/A'
    const priceText = doc.querySelector('#lblPriceY')?.textContent?.trim() || '0'
    const priceInJPY = parseInt(priceText.replace(/[^0-9]/g, ''))
    const numberOfBids = doc.querySelector('#bidNum')?.textContent?.trim() || '0'
    const timeRemaining = doc.querySelector('#lblTimeLeft')?.textContent?.trim() || 'N/A'
    
    // Extract image URL from the img tag
    let imageUrl = null;
    const imgElement = doc.querySelector('#imgPreview');
    if (imgElement) {
      imageUrl = imgElement.getAttribute('src');
      console.log('Found image URL:', imageUrl);
    } else {
      console.log('No image element found with id imgPreview');
    }

    console.log('Scraped data:', {
      productName,
      priceInJPY,
      numberOfBids,
      timeRemaining,
      imageUrl
    });

    const data = {
      url,
      productName,
      priceInJPY,
      currentPrice: `¥${priceInJPY.toLocaleString()}`,
      numberOfBids,
      timeRemaining,
      imageUrl,
      lastUpdated: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Scraping error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})