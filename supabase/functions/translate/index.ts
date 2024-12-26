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

    // Generate Google Translate URL
    const encodedText = encodeURIComponent(text)
    const translateUrl = `https://translate.google.com/?sl=ja&tl=${targetLanguage}&text=${encodedText}&op=translate`

    return new Response(
      JSON.stringify({ 
        translatedText: text, // Return original text since we can't get translation from URL
        translateUrl // Return URL so frontend can open it if needed
      }),
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