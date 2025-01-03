import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { currency } = await req.json()

    // Validate required parameters
    if (!currency) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: currency" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    console.log(`Fetching exchange rates for ${currency}`)
    
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${currency}`)
    const data = await response.json()

    console.log('Exchange rates fetched successfully:', data)

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in get-exchange-rates:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    )
  }
})