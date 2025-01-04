import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    console.log('Fetching tracking info for:', trackingNumber);

    // Use the correct URL format
    const trackingUrl = `https://t.17track.net/en#nums=${trackingNumber}`;
    
    const response = await fetch(trackingUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch tracking page:', response.status, response.statusText);
      throw new Error('Failed to fetch tracking page');
    }

    const html = await response.text();
    console.log('Successfully fetched tracking page');

    // For now, we'll return a simple success response since we're just verifying the URL works
    return new Response(
      JSON.stringify({ 
        success: true,
        trackingUrl,
        message: "Tracking page fetched successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

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