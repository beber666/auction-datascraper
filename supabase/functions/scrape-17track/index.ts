import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trackingNumber } = await req.json();
    console.log('Scraping tracking number:', trackingNumber);

    const url = `https://t.17track.net/en#nums=${trackingNumber}`;
    console.log('Fetching URL:', url);

    const response = await fetch(url);
    const html = await response.text();
    console.log('Received HTML response');
    
    const $ = cheerio.load(html);
    const trackingInfo = [];
    
    // Get the tracking details from the copy button's data-clipboard-text attribute
    const trackingDetails = $('#cl-details').attr('data-clipboard-text');
    console.log('Found tracking details:', trackingDetails);
    
    if (trackingDetails) {
      // Parse the tracking events from the formatted text
      const lines = trackingDetails.split('\n');
      
      // Skip header lines and footer
      const events = lines.slice(3, -2).filter(line => line.trim() !== '');
      
      events.forEach(event => {
        const match = event.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}) (.+)$/);
        if (match) {
          trackingInfo.push({
            time: match[1],
            event: match[2],
          });
        }
      });
    }

    console.log('Parsed tracking info:', trackingInfo);

    return new Response(
      JSON.stringify({ 
        success: true, 
        trackingInfo,
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Error scraping tracking info:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});