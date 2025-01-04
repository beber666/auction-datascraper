import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
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

    // Launch browser
    const browser = await puppeteer.launch({
      args: ['--no-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      
      // Navigate to 17track
      await page.goto(`https://t.17track.net/en#nums=${trackingNumber}`);

      // Wait for the tracking details to load
      await page.waitForSelector('#cl-details', { timeout: 30000 });

      // Get tracking details
      const trackingInfo = await page.evaluate(() => {
        const events = [];
        const eventElements = document.querySelectorAll('.trk-card-content');
        
        eventElements.forEach(element => {
          const timeElement = element.querySelector('.time');
          const statusElement = element.querySelector('.status');
          
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
        error: error.message 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
})