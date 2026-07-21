type MetaPixelBrand = "sniperfactory" | "insideout"
type MetaFbq = ((...args: any[]) => void) & {
  callMethod?: (...args: any[]) => void
  queue?: any[][]
  push?: unknown
  loaded?: boolean
  version?: string
}

const PIXELS: Record<MetaPixelBrand, string> = {
  sniperfactory: "2150769842390721",
  insideout: "1021743190539834",
}

declare global {
  interface Window {
    fbq?: MetaFbq
    _fbq?: unknown
    __catchformMetaPixelScriptLoaded?: boolean
    __catchformMetaPixelInitialized?: Record<string, boolean>
  }
}

function pixelBrand(brand: unknown): MetaPixelBrand | "" {
  const value = String(brand || "").trim().toUpperCase()
  if (value === "SNIPERFACTORY") return "sniperfactory"
  if (value === "INSIDEOUT") return "insideout"
  return ""
}

function shouldTrackMetaPixel(brand: unknown, isFormal: boolean) {
  const key = pixelBrand(brand)
  return isFormal && !!key && !!PIXELS[key]
}

function loadMetaPixelScript() {
  if (typeof window === "undefined" || typeof document === "undefined") return
  if (window.fbq) {
    window.__catchformMetaPixelScriptLoaded = true
    return
  }
  if (window.__catchformMetaPixelScriptLoaded) return
  window.__catchformMetaPixelScriptLoaded = true
  const fbq: MetaFbq = (...args: any[]) => {
    if (fbq.callMethod) fbq.callMethod(...args)
    else fbq.queue?.push(args)
  }
  window.fbq = fbq
  if (!window._fbq) window._fbq = fbq
  fbq.push = fbq
  fbq.loaded = true
  fbq.version = "2.0"
  fbq.queue = []
  const script = document.createElement("script")
  script.async = true
  script.src = "https://connect.facebook.net/en_US/fbevents.js"
  const firstScript = document.getElementsByTagName("script")[0]
  firstScript?.parentNode?.insertBefore(script, firstScript)
}

export function initMetaPixel(brand: unknown, isFormal: boolean) {
  if (!shouldTrackMetaPixel(brand, isFormal) || typeof window === "undefined") return
  const key = pixelBrand(brand)
  if (!key) return
  const pixelId = PIXELS[key]
  loadMetaPixelScript()
  if (!window.fbq) return
  const initialized = window.__catchformMetaPixelInitialized || {}
  if (!initialized[pixelId]) {
    window.fbq("init", pixelId)
    initialized[pixelId] = true
    window.__catchformMetaPixelInitialized = initialized
  }
  window.fbq("trackSingle", pixelId, "PageView")
}

export function trackLead(brand: unknown, isFormal: boolean, data: Record<string, unknown> = {}) {
  if (!shouldTrackMetaPixel(brand, isFormal) || typeof window === "undefined") return
  const key = pixelBrand(brand)
  if (!key) return
  const pixelId = PIXELS[key]
  if (!window.fbq) initMetaPixel(brand, isFormal)
  if (!window.fbq) return
  window.fbq("trackSingle", pixelId, "Lead", data)
}
