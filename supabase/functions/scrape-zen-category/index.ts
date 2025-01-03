import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url, singlePage } = await req.json()
    
    if (!url || !url.includes('zenmarket.jp')) {
      throw new Error('Invalid URL')
    }

    console.log('Scraping URL:', url);
    const response = await fetch(url)
    const html = await response.text()
    
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    if (!doc) {
      throw new Error('Failed to parse HTML')
    }

    const items = Array.from(doc.querySelectorAll('.item-box')).map(item => {
      // Title and URL
      const titleElement = item.querySelector('.item-title a')
      const title = titleElement?.textContent?.trim() || ''
      const itemUrl = titleElement?.getAttribute('href') || ''

      // Price information
      const priceElement = item.querySelector('.item-price')
      const currentPrice = priceElement?.textContent?.trim() || ''
      const buyoutElement = item.querySelector('.buyout-price')
      const buyoutPrice = buyoutElement?.textContent?.trim() || null

      // Bids
      const bidsElement = item.querySelector('.item-bids')
      const bids = parseInt(bidsElement?.textContent?.trim() || '0')

      // Time remaining
      const timeElement = item.querySelector('.item-time')
      const timeRemaining = timeElement?.textContent?.trim() || ''

      // Categories
      const categoriesElements = item.querySelectorAll('.item-categories a')
      const categories = Array.from(categoriesElements).map(el => el.textContent?.trim() || '')

      // Image URL
      const imageElement = item.querySelector('.img-wrap img')
      const imageUrl = imageElement?.getAttribute('src') || null

      return {
        title,
        url: itemUrl,
        currentPrice,
        buyoutPrice,
        bids,
        timeRemaining,
        categories,
        imageUrl
      }
    })

    console.log(`Scraped ${items.length} items`);

    // Check for next page
    const nextPageLink = doc.querySelector('.pagination .next a')
    const nextPageUrl = nextPageLink?.getAttribute('href') || null
    const hasMorePages = Boolean(nextPageUrl)

    console.log('Next page URL:', nextPageUrl);

    return new Response(
      JSON.stringify({
        items,
        hasMorePages: singlePage ? false : hasMorePages,
        nextPageUrl: singlePage ? null : nextPageUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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