import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Camera, Search, QrCode } from 'lucide-react'

export function QRScannerPage() {
  const navigate = useNavigate()
  const [manualCode, setManualCode] = useState('')
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleResult = (text: string) => {
    // Extract batch number from URL or use raw text
    const match = text.match(/\/trace\/([^/?#]+)/)
    const batchNumber = match ? decodeURIComponent(match[1]) : text.trim()
    if (batchNumber) {
      stopScanner()
      navigate(`/trace/${encodeURIComponent(batchNumber)}`)
    }
  }

  const startScanner = async () => {
    setError('')
    try {
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decoded) => handleResult(decoded),
        () => {} // ignore scan failures
      )
      setScanning(true)
    } catch (err: any) {
      setError(err?.message || 'Não foi possível acessar a câmera')
    }
  }

  const stopScanner = () => {
    if (scannerRef.current?.isScanning) {
      scannerRef.current.stop().catch(() => {})
    }
    setScanning(false)
  }

  useEffect(() => {
    return () => { stopScanner() }
  }, [])

  const handleManualSearch = () => {
    const code = manualCode.trim()
    if (code) {
      navigate(`/trace/${encodeURIComponent(code)}`)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Scanner QR</h1>
          <p className="text-muted-foreground text-sm">Escaneie o QR code do produto para rastrear</p>
        </div>
      </div>

      {/* Camera Scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Camera className="h-4 w-4" /> Câmera
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            id="qr-reader"
            ref={containerRef}
            className="w-full aspect-square max-w-[300px] mx-auto bg-muted rounded-lg overflow-hidden"
          />
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          <Button
            className="w-full gap-2"
            variant={scanning ? 'destructive' : 'default'}
            onClick={scanning ? stopScanner : startScanner}
          >
            <Camera className="h-4 w-4" />
            {scanning ? 'Parar Scanner' : 'Iniciar Scanner'}
          </Button>
        </CardContent>
      </Card>

      {/* Manual Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" /> Busca Manual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={manualCode}
              onChange={(e: any) => setManualCode(e.target.value)}
              placeholder="Número do lote (ex: LOT-2026-001)"
              onKeyDown={(e: any) => e.key === 'Enter' && handleManualSearch()}
            />
            <Button onClick={handleManualSearch} disabled={!manualCode.trim()}>
              <QrCode className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
