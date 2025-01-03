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

    const response = await fetch(url)
    const html = await response.text()
    
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    if (!doc) {
      throw new Error('Failed to parse HTML')
    }

    const items = Array.from(doc.querySelectorAll('.item-box')).map(item => {
      const titleElement = item.querySelector('.item-title a')
      const priceElement = item.querySelector('.item-price')
      const buyoutElement = item.querySelector('.buyout-price')
      const bidsElement = item.querySelector('.item-bids')
      const timeElement = item.querySelector('.item-time')
      const categoriesElements = item.querySelectorAll('.item-categories a')
      const imageElement = item.querySelector('.img-wrap img')

      return {
        title: titleElement?.textContent?.trim() || '',
        url: titleElement?.getAttribute('href') || '',
        currentPrice: priceElement?.textContent?.trim() || '',
        buyoutPrice: buyoutElement?.textContent?.trim() || null,
        bids: parseInt(bidsElement?.textContent?.trim() || '0'),
        timeRemaining: timeElement?.textContent?.trim() || '',
        categories: Array.from(categoriesElements).map(el => el.textContent?.trim() || ''),
        imageUrl: imageElement?.getAttribute('src') || null
      }
    })

    const nextPageLink = doc.querySelector('.pagination .next a')
    const nextPageUrl = nextPageLink?.getAttribute('href') || null
    const hasMorePages = Boolean(nextPageUrl)

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