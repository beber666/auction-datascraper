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
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { url, maxPages = 5 } = await req.json() // Add maxPages parameter with default of 5
    
    if (!url || !url.includes('zenmarket.jp')) {
      throw new Error('Invalid URL provided')
    }

    const items: ScrapedItem[] = []
    let currentPage = 1
    let hasNextPage = true

    // Limit the number of pages to prevent timeout
    while (hasNextPage && currentPage <= maxPages) {
      try {
        console.log(`Scraping page ${currentPage} of maximum ${maxPages} pages`)
        const pageUrl = currentPage === 1 ? url : `${url}&p=${currentPage}`
        
        const response = await fetch(pageUrl)
        if (!response.ok) {
          console.error(`Failed to fetch page ${currentPage}: ${response.status}`)
          break
        }
        
        const html = await response.text()
        const $ = cheerio.load(html)

        $('.col-md-7').each((_, element) => {
          const $el = $(element)
          const titleEl = $el.find('.translate a.auction-url')
          const bidsEl = $el.find('.label.label-default.auction-label')
          const timeEl = $el.find('.glyphicon-time').parent()
          
          const categoryContainer = $el.find('div:contains("Category:")')
          const categoryLinks = categoryContainer.find('a.auction-url')
          
          const priceCol = $el.next('.col-md-3')
          const currentPriceEl = priceCol.find('.auction-price .amount')
          const buyoutPriceEl = priceCol.find('.auction-blitzprice .amount')

          const title = titleEl.text().trim()
          const url = 'https://zenmarket.jp/en/' + titleEl.attr('href')
          const bids = parseInt(bidsEl.text().replace('Bids: ', '')) || 0
          const timeRemaining = timeEl.text().replace('', '').trim()
          
          const categories = categoryLinks
            .map((_, link) => $(link).text().trim())
            .get()

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

        // Check if there's a next page
        hasNextPage = $('#paging_nextPage').length > 0
        if (hasNextPage) {
          currentPage++
          // Increased delay between requests
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      } catch (error) {
        console.error(`Error scraping page ${currentPage}:`, error)
        break
      }
    }

    console.log(`Finished scraping. Total items found: ${items.length} across ${currentPage} pages`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        items,
        totalPages: currentPage,
        hasMorePages: hasNextPage && currentPage > maxPages 
      }),
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