import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12'

interface ScrapedItem {
  title: string;
  url: string;
  bids: number;
  timeRemaining: string;
  categories: string[];
  currentPrice: string;
  buyoutPrice: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    
    if (!url || !url.includes('zenmarket.jp')) {
      throw new Error('Invalid URL provided')
    }

    const items: ScrapedItem[] = []
    let currentPage = 1
    let hasNextPage = true

    while (hasNextPage) {
      const pageUrl = `${url}${url.includes('?') ? '&' : '?'}page=${currentPage}`
      const response = await fetch(pageUrl)
      const html = await response.text()
      const $ = cheerio.load(html)

      $('.col-md-7').each((_, element) => {
        const $el = $(element)
        const titleEl = $el.find('.translate a.auction-url')
        const bidsEl = $el.find('.label.label-default.auction-label')
        const timeEl = $el.find('.glyphicon-time').parent()
        
        // Amélioration du sélecteur pour les catégories
        const categoryContainer = $el.find('div:contains("Category:")')
        const categoryLinks = categoryContainer.find('a.auction-url')
        
        // Get the price information from the adjacent col-md-3
        const priceCol = $el.next('.col-md-3')
        const currentPriceEl = priceCol.find('.auction-price .amount')
        const buyoutPriceEl = priceCol.find('.auction-blitzprice .amount')

        const title = titleEl.text().trim()
        const url = 'https://zenmarket.jp/en/' + titleEl.attr('href')
        const bids = parseInt(bidsEl.text().replace('Bids: ', '')) || 0
        const timeRemaining = timeEl.text().replace('', '').trim()
        
        // Extraction correcte des catégories
        const categories = categoryLinks
          .map((_, link) => $(link).text().trim())
          .get()
          .filter(category => category !== title) // S'assurer que le titre n'est pas inclus

        // Get prices in user's currency (we'll use EUR as default)
        const currentPrice = currentPriceEl.attr('data-eur') || currentPriceEl.text()
        const buyoutPrice = buyoutPriceEl.attr('data-eur') || buyoutPriceEl.text()

        if (title && url) {
          items.push({
            title,
            url,
            bids,
            timeRemaining,
            categories,
            currentPrice: currentPrice.trim(),
            buyoutPrice: buyoutPrice ? buyoutPrice.trim() : null
          })
        }
      })

      hasNextPage = $('.pagination .next').length > 0
      currentPage++

      // Pause between requests to avoid overloading the server
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return new Response(
      JSON.stringify({ success: true, items }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})