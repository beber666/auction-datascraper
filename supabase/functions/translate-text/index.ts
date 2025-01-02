import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  console.log('Translation function called with method:', req.method)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request')
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  try {
    const { text, targetLang } = await req.json()
    console.log('Request parameters:', { text, targetLang })

    if (!text || !targetLang) {
      console.error('Missing parameters:', { text, targetLang })
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters',
          details: { text, targetLang }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    console.log('Making request to:', url)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Translation API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      throw new Error(`Translation API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('Translation API response:', data)
    
    if (!data || !Array.isArray(data[0])) {
      console.error('Invalid translation response format:', data)
      throw new Error('Invalid translation response format')
    }

    const translatedText = data[0][0][0] || text
    console.log('Extracted translation:', translatedText)

    return new Response(
      JSON.stringify({ translatedText }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600'
        },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Translation error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack,
        type: 'translation_error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})