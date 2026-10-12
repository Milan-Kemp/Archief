import type { StyleSpecification } from 'maplibre-gl'

// OpenFreeMap-stijlen tonen standaard lokale naam + Engels/Latijns alternatief
// in label-tekstvelden (bv. "東京 Tokyo"). We forceren puur Engels: name_en,
// met de brontaal-naam als terugval voor plekken zonder Engelse vertaling.
function forceEnglishLabels(style: StyleSpecification): StyleSpecification {
  const layers = style.layers.map((layer) => {
    const layout = (layer as { layout?: Record<string, unknown> }).layout
    const textField = layout?.['text-field']
    if (!textField || !JSON.stringify(textField).includes('"name')) return layer

    return {
      ...layer,
      layout: {
        ...layout,
        'text-field': ['coalesce', ['get', 'name_en'], ['get', 'name']],
      },
    } as typeof layer
  })

  return { ...style, layers }
}

const styleCache = new Map<string, Promise<StyleSpecification>>()

export function loadEnglishMapStyle(styleUrl: string): Promise<StyleSpecification> {
  let cached = styleCache.get(styleUrl)
  if (!cached) {
    cached = fetch(styleUrl)
      .then((res) => res.json())
      .then(forceEnglishLabels)
    styleCache.set(styleUrl, cached)
  }
  return cached
}
