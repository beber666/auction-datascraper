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
    const { text, targetLanguage } = await req.json()

    if (!text || !targetLanguage) {
      throw new Error('Missing required parameters: text or targetLanguage')
    }

    console.log('Translating text:', text)
    console.log('Target language:', targetLanguage)

    // Skip translation if target language is Japanese (source language)
    if (targetLanguage === 'ja') {
      console.log('Target language is Japanese, returning original text')
      return new Response(
        JSON.stringify({ translatedText: text }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
          status: 200,
        }
      )
    }

    // Google Translate API endpoint
    const url = `https://translation.googleapis.com/language/translate/v2?key=${Deno.env.get('GOOGLE_TRANSLATE_API_KEY')}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: 'ja',
        target: targetLanguage,
        format: 'text'
      })
    })

    const data = await response.json()
    console.log('Translation response:', data)

    if (!response.ok) {
      throw new Error(data.error?.message || 'Translation failed')
    }

    const translatedText = data.data.translations[0].translatedText

    return new Response(
      JSON.stringify({ translatedText }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Translation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    )
  }
})