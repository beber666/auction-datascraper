import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trackingNumber } = await req.json()
    
    if (!trackingNumber) {
      return new Response(
        JSON.stringify({ success: false, error: "Tracking number is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    console.log('Scraping tracking number:', trackingNumber);

    // Launch browser
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      
      // Navigate to 17track
      await page.goto(`https://t.17track.net/en#nums=${trackingNumber}`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Wait for the tracking details to load
      await page.waitForSelector('#cl-details', { timeout: 30000 });

      // Get tracking details from the copy button
      const trackingDetails = await page.evaluate(() => {
        const button = document.querySelector('#cl-details');
        return button?.getAttribute('data-clipboard-text') || '';
      });

      console.log('Found tracking details:', trackingDetails);

      const trackingInfo = [];
      
      if (trackingDetails) {
        // Split the text into lines and process each event
        const lines = trackingDetails.split('\n');
        lines.forEach(line => {
          // Look for lines that start with a date (YYYY-MM-DD)
          if (line.match(/^\d{4}-\d{2}-\d{2}/)) {
            const [dateTime, ...eventParts] = line.split(' ');
            trackingInfo.push({
              time: dateTime,
              event: eventParts.join(' ')
            });
          }
        });
      }

      console.log('Parsed tracking info:', trackingInfo);

      return new Response(
        JSON.stringify({ 
          success: true, 
          trackingInfo 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )

    } finally {
      await browser.close();
    }

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})