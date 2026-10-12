import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Chrome-only bug: na het weghalen van de MapLibre/Leaflet-kaart (WebGL-canvas
// + veel transform-lagen) blijft het scherm soms wit staan tot het venster
// geschaald wordt of DevTools opent — beide forceren Chrome om zijn compositor-
// laagboom opnieuw te berekenen. We doen hier hetzelfde, automatisch, na elke
// route-wissel. De DOM is op dat moment al correct; dit is puur een reflow-
// trucje om Chrome te laten herschilderen. Edge/Firefox hebben dit probleem
// niet, maar de truc is daar onschadelijk.
export function RouteChangeEffects() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)

    const el = document.body
    const previousDisplay = el.style.display
    el.style.display = 'none'
    void el.offsetHeight
    el.style.display = previousDisplay
  }, [location.pathname])

  return null
}
