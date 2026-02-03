import { useState, useEffect } from 'react'
import { canInstallPWA, promptInstallPWA } from '@/lib/pwa'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'

export function PWAInstallBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const check = () => setShow(canInstallPWA())
    check()
    window.addEventListener('pwa-install-available', check)
    return () => window.removeEventListener('pwa-install-available', check)
  }, [])

  if (!show) return null

  const handleInstall = async () => {
    const accepted = await promptInstallPWA()
    if (accepted) setShow(false)
  }

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 bg-card border rounded-lg shadow-lg p-4 flex items-center gap-3">
      <Download className="h-5 w-5 text-primary flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">Instalar AgroBio</p>
        <p className="text-xs text-muted-foreground">Acesse offline direto da tela inicial</p>
      </div>
      <div className="flex gap-1">
        <Button size="sm" onClick={handleInstall}>Instalar</Button>
        <Button size="sm" variant="ghost" onClick={() => setShow(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
