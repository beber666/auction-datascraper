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

    // Générer un X-CSRF-Token aléatoire
    const xcsrfToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const response = await fetch(`https://t.17track.net/restapi/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'X-CSRF-Token': xcsrfToken,
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': 'https://t.17track.net',
        'Referer': `https://t.17track.net/en#nums=${trackingNumber}`,
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Connection': 'keep-alive',
      },
      body: JSON.stringify({
        "data": [{
          "num": trackingNumber,
          "fc": 0,
          "sc": 0
        }],
        "guid": "",
        "timeZoneOffset": -60
      })
    });

    if (!response.ok) {
      console.error('API response not OK:', response.status, response.statusText);
      throw new Error('Failed to fetch tracking data');
    }

    const data = await response.json();
    console.log('17track API response:', data);

    if (!data.ret || data.ret !== 1 || !data.dat?.[0]?.track?.z0) {
      console.error('Invalid tracking data received:', data);
      throw new Error('No tracking data found');
    }

    // Transform the tracking events into our format
    const trackingInfo = data.dat[0].track.z0.map(event => ({
      time: new Date(event.a * 1000).toLocaleString(),
      event: event.z
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