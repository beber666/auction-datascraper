import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, from, to } = await req.json()
    
    if (!amount || !from || !to) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Converting ${amount} ${from} to ${to}`);

    // For now, using a simple fixed rate for JPY to EUR as an example
    // In production, you would want to use a real exchange rate API
    const rate = 0.0062; // 1 JPY = 0.0062 EUR
    const convertedAmount = amount * rate;

    console.log(`Converted amount: ${convertedAmount} ${to}`);

    return new Response(
      JSON.stringify({ convertedAmount }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
        }
      }
    )

  } catch (error) {
    console.error('Error in get-exchange-rates:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})