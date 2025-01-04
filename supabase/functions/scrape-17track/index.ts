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

    // Using 17track's mobile API endpoint
    const response = await fetch(`https://api.17track.net/track/v1/gettrackinfo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://m.17track.net',
        'Referer': 'https://m.17track.net/',
      },
      body: JSON.stringify({
        "numbers": [trackingNumber],
        "timeZoneOffset": -480,
        "platform": "ios",
        "uniqueId": crypto.randomUUID()
      })
    });

    if (!response.ok) {
      console.error('API response not OK:', response.status, response.statusText);
      throw new Error('Failed to fetch tracking data');
    }

    const data = await response.json();
    console.log('17track mobile API response:', data);

    if (!data.data?.[0]?.track) {
      console.error('Invalid tracking data received:', data);
      throw new Error('No tracking data found');
    }

    // Transform the tracking events into our format
    const trackingInfo = data.data[0].track.map(event => ({
      time: new Date(event.time * 1000).toLocaleString(),
      event: event.description
    }));

    console.log('Transformed tracking events:', trackingInfo);

    return new Response(
      JSON.stringify({ 
        success: true, 
        trackingInfo 
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