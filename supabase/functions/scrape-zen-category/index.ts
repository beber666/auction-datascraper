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
  imageUrl: string | null;
}

async function scrapePage(url: string): Promise<{ 
  items: ScrapedItem[], 
  nextPageUrl: string | null,
  hasMorePages: boolean 
}> {
  console.log('Scraping URL:', url);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status}`);
  }
  
  const html = await response.text();
  const $ = cheerio.load(html);
  const items: ScrapedItem[] = [];

  // Scrape items from the current page
  $('.col-md-7').each((_, element) => {
    try {
      const $el = $(element);
      
      // Get basic item info with better error handling
      const titleEl = $el.find('.translate a.auction-url');
      const title = titleEl.text().trim();
      const itemUrl = titleEl.attr('href');
      
      if (!title || !itemUrl) {
        console.log('Skipping item: Missing title or URL');
        return;
      }

      // Get image URL from the previous column
      const imageUrl = $el.prev('.col-md-2.img-wrap').find('img').attr('src') || null;

      // Get bids count with improved parsing
      const bidsEl = $el.find('.label.label-default.auction-label');
      const bidsText = bidsEl.text().trim();
      const bidsMatch = bidsText.match(/\d+/);
      const bids = bidsMatch ? parseInt(bidsMatch[0]) : 0;

      // Get time remaining with validation
      const timeEl = $el.find('.glyphicon-time').parent();
      const timeRemaining = timeEl.text().trim() || 'N/A';

      // Get categories with better handling
      const categoryContainer = $el.find('div:contains("Category:")');
      const categories = categoryContainer
        .find('a.auction-url')
        .map((_, link) => $(link).text().trim())
        .get()
        .filter(cat => cat.length > 0);

      if (categories.length === 0) {
        console.log('Warning: No categories found for item:', title);
      }

      // Get prices from the next column with improved error handling
      const priceCol = $el.next('.col-md-3');
      const currentPriceEl = priceCol.find('.auction-price .amount');
      const buyoutPriceEl = priceCol.find('.auction-blitzprice .amount');

      const currentPrice = currentPriceEl.length ? 
        (currentPriceEl.attr('data-eur') || currentPriceEl.text().trim()) : 
        'N/A';
        
      const buyoutPrice = buyoutPriceEl.length ? 
        (buyoutPriceEl.attr('data-eur') || buyoutPriceEl.text().trim()) : 
        null;

      // Log successful item scrape
      console.log('Successfully scraped item:', {
        title,
        bids,
        categories: categories.length,
        currentPrice,
        imageUrl
      });

      // Add the item to our results
      items.push({
        title,
        url: 'https://zenmarket.jp/en/' + itemUrl,
        bids,
        timeRemaining,
        categories: categories.length > 0 ? categories : ['Non catégorisé'],
        currentPrice,
        buyoutPrice,
        imageUrl
      });
    } catch (error) {
      console.error('Error scraping individual item:', error);
    }
  });

  // Check for next page link
  const nextPageEl = $('#paging_nextPage a#paging_nextPageLink');
  const nextPageUrl = nextPageEl.length ? 
    'https://zenmarket.jp' + nextPageEl.attr('href') : 
    null;

  const hasMorePages = nextPageUrl !== null;

  console.log(`Found ${items.length} items on this page`);
  if (nextPageUrl) {
    console.log('Next page URL:', nextPageUrl);
  } else {
    console.log('No more pages to scrape');
  }

  return { items, nextPageUrl, hasMorePages };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url || !url.includes('zenmarket.jp')) {
      throw new Error('Invalid URL provided');
    }

    const { items, nextPageUrl, hasMorePages } = await scrapePage(url);

    // Log summary of scraping results
    console.log('Scraping summary:', {
      totalItems: items.length,
      itemsWithCategories: items.filter(i => i.categories.length > 0).length,
      itemsWithBids: items.filter(i => i.bids > 0).length,
      hasMorePages
    });

    return new Response(
      JSON.stringify({
        items,
        nextPageUrl,
        hasMorePages
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});