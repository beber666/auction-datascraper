import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trackingNumber } = await req.json();
    
    if (!trackingNumber) {
      return new Response(
        JSON.stringify({ success: false, error: "Tracking number is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Scraping tracking number:', trackingNumber);

    // Launch browser with additional settings
    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
      ]
    });
    
    try {
      const page = await browser.newPage();
      
      // Set a Mac Chrome user agent
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
      
      // Set viewport
      await page.setViewport({
        width: 1920,
        height: 1080
      });

      console.log('Navigating to 17track...');
      
      // Navigate to 17track with additional options
      await page.goto(`https://t.17track.net/en#nums=${trackingNumber}`, {
        waitUntil: 'networkidle0',
        timeout: 60000
      });

      console.log('Waiting for tracking details to load...');

      // Wait longer for the content to load
      await page.waitForSelector('#cl-details', { timeout: 60000 });
      
      // Add a small delay to ensure dynamic content is loaded
      await new Promise(resolve => setTimeout(resolve, 5000));

      console.log('Extracting tracking details...');

      // Get tracking details with improved selector
      const trackingInfo = await page.evaluate(() => {
        const events = [];
        const eventElements = document.querySelectorAll('[class*="trk-card-content"]');
        
        eventElements.forEach(element => {
          const timeElement = element.querySelector('[class*="time"]');
          const statusElement = element.querySelector('[class*="status"]');
          
          if (timeElement && statusElement) {
            events.push({
              time: timeElement.textContent?.trim() || '',
              event: statusElement.textContent?.trim() || ''
            });
          }
        });
        
        return events;
      });

      console.log('Found tracking events:', trackingInfo);

      if (trackingInfo.length === 0) {
        console.log('No tracking events found, might be a detection issue');
        throw new Error('No tracking events found');
      }

      await browser.close();

      return new Response(
        JSON.stringify({ 
          success: true, 
          trackingInfo 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (error) {
      console.error('Error during scraping:', error);
      await browser.close();
      throw error;
    }

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Failed to fetch tracking information. Please try again later." 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
})