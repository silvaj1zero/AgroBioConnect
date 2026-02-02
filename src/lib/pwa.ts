/**
 * Register service worker and handle PWA install prompt
 */

let deferredPrompt: any = null

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[SW] Registered:', reg.scope)

          // Check for updates every 30min
          setInterval(() => reg.update(), 30 * 60 * 1000)
        })
        .catch((err) => console.warn('[SW] Registration failed:', err))
    })
  }

  // Capture install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    window.dispatchEvent(new CustomEvent('pwa-install-available'))
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    console.log('[PWA] App installed')
  })
}

export function canInstallPWA(): boolean {
  return deferredPrompt != null
}

export async function promptInstallPWA(): Promise<boolean> {
  if (!deferredPrompt) return false
  deferredPrompt.prompt()
  const result = await deferredPrompt.userChoice
  deferredPrompt = null
  return result.outcome === 'accepted'
}

/**
 * Check if running as installed PWA
 */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  )
}
