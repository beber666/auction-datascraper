import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const url = new URL(req.url)
    const imageUrl = url.searchParams.get('url')
    
    if (!imageUrl) {
      return new Response('Missing image URL', { status: 400 })
    }

    const response = await fetch(imageUrl)
    
    if (!response.ok) {
      return new Response('Failed to fetch image', { status: response.status })
    }

    // Get the content type from the original response
    const contentType = response.headers.get('content-type')
    
    // Forward the image with appropriate headers
    return new Response(response.body, {
      headers: {
        'Content-Type': contentType || 'image/jpeg',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return new Response('Internal server error', { status: 500 })
  }
})