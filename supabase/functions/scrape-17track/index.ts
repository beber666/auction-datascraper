import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trackingNumber } = await req.json();
    console.log('Scraping tracking number:', trackingNumber);

    const url = `https://t.17track.net/en#nums=${trackingNumber}`;
    const response = await fetch(url);
    const html = await response.text();
    
    const $ = cheerio.load(html);
    const trackingInfo = [];
    
    // Parse tracking events
    $('.tracklist-details .trn-block dd').each((_, element) => {
      const time = $(element).find('time').text();
      const event = $(element).find('p').text();
      
      if (time && event) {
        trackingInfo.push({
          time,
          event,
        });
      }
    });

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