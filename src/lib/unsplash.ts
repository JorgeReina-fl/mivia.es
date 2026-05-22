interface UnsplashPhoto {
  url: string
  photographer: string
  photographerUrl: string
  photoId: string
}

export async function fetchUnsplashPhoto(keyword: string): Promise<UnsplashPhoto | null> {
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

  if (!UNSPLASH_ACCESS_KEY) {
    console.log('[Unsplash] API key not configured, skipping photo fetch')
    return null
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)

    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(keyword)}&client_id=${UNSPLASH_ACCESS_KEY}&orientation=landscape`,
      { signal: controller.signal }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.log(`[Unsplash] API error: ${response.status}`)
      return null
    }

    const data = await response.json()

    // Trigger download tracking (required by Unsplash API terms)
    await fetch(
      `https://api.unsplash.com/photos/${data.id}/download?client_id=${UNSPLASH_ACCESS_KEY}`
    ).catch(() => {})

    return {
      url: data.urls.regular,
      photographer: data.user.name,
      photographerUrl: data.user.links.html,
      photoId: data.id
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('[Unsplash] Request timeout after 2s')
    } else {
      console.log('[Unsplash] Fetch failed:', error)
    }
    return null
  }
}
