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
    const $el = $(element);
    
    // Get basic item info
    const titleEl = $el.find('.translate a.auction-url');
    const title = titleEl.text().trim();
    const itemUrl = titleEl.attr('href');
    
    if (!title || !itemUrl) {
      return; // Skip if missing essential data
    }

    // Get bids count
    const bidsEl = $el.find('.label.label-default.auction-label');
    const bids = parseInt(bidsEl.text().replace('Bids: ', '')) || 0;

    // Get time remaining
    const timeEl = $el.find('.glyphicon-time').parent();
    const timeRemaining = timeEl.text().trim();

    // Get categories
    const categoryContainer = $el.find('div:contains("Category:")');
    const categories = categoryContainer
      .find('a.auction-url')
      .map((_, link) => $(link).text().trim())
      .get();

    // Get prices from the next column
    const priceCol = $el.next('.col-md-3');
    const currentPriceEl = priceCol.find('.auction-price .amount');
    const buyoutPriceEl = priceCol.find('.auction-blitzprice .amount');

    const currentPrice = currentPriceEl.attr('data-eur') || currentPriceEl.text().trim();
    const buyoutPrice = buyoutPriceEl.length ? 
      (buyoutPriceEl.attr('data-eur') || buyoutPriceEl.text().trim()) : 
      null;

    // Add the item to our results
    items.push({
      title,
      url: 'https://zenmarket.jp/en/' + itemUrl,
      bids,
      timeRemaining,
      categories,
      currentPrice,
      buyoutPrice
    });
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url || !url.includes('zenmarket.jp')) {
      throw new Error('Invalid URL provided');
    }

    const { items, nextPageUrl, hasMorePages } = await scrapePage(url);

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