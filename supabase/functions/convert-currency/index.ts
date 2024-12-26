import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    const { amount, from, to } = await req.json()

    if (!amount || !from || !to) {
      throw new Error('Missing required parameters: amount, from, or to currency')
    }

    // For now, we'll use a simple fixed conversion rate
    // TODO: Implement actual currency conversion using an API
    const rates = {
      JPY: {
        EUR: 0.0062,
        USD: 0.0067,
        GBP: 0.0053
      }
    }

    if (!rates[from] || !rates[from][to]) {
      throw new Error('Unsupported currency conversion')
    }

    const convertedAmount = (amount * rates[from][to]).toFixed(2)

    console.log(`Converting ${amount} ${from} to ${to}: ${convertedAmount}`)

    return new Response(
      JSON.stringify({ convertedAmount: `${convertedAmount} ${to}` }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Currency conversion error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      },
    )
  }
})