import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAllBatches } from '@/hooks/useBatches'
import { generateQRDataUrl, getTraceUrl } from '@/lib/qr-generator'
import { generateBatchLabel, generateLabelSheet } from '@/lib/pdf-labels'
import type { QRData } from '@/lib/qr-generator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import {
  QrCode,
  ScanLine,
  Download,
  Printer,
  Eye,
  FlaskConical,
} from 'lucide-react'
import { format } from 'date-fns'

export function TraceabilityPage() {
  const { data: batches = [], isLoading } = useAllBatches()
  const [selectedQR, setSelectedQR] = useState<{ batchNumber: string; dataUrl: string } | null>(null)
  const [selectedForPrint, setSelectedForPrint] = useState<Set<string>>(new Set())
  const [generatingPdf, setGeneratingPdf] = useState(false)

  const handleShowQR = async (batchNumber: string) => {
    const dataUrl = await generateQRDataUrl(batchNumber, 512)
    setSelectedQR({ batchNumber, dataUrl })
  }

  const handleDownloadQR = async (batchNumber: string) => {
    const dataUrl = await generateQRDataUrl(batchNumber, 1024)
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `qr-${batchNumber}.png`
    a.click()
  }

  const handleSingleLabel = async (batch: any) => {
    setGeneratingPdf(true)
    try {
      const data: QRData = {
        batchId: batch.id,
        batchNumber: batch.batch_number,
        productionDate: batch.production_date,
        expiryDate: batch.expiry_date ?? undefined,
      }
      const doc = await generateBatchLabel(data)
      doc.save(`etiqueta-${batch.batch_number}.pdf`)
    } finally {
      setGeneratingPdf(false)
    }
  }

  const togglePrintSelection = (id: string) => {
    setSelectedForPrint((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handlePrintSheet = async () => {
    setGeneratingPdf(true)
    try {
      const items: QRData[] = batches
        .filter((b) => selectedForPrint.has(b.id))
        .map((b) => ({
          batchId: b.id,
          batchNumber: b.batch_number,
          productionDate: b.production_date,
          expiryDate: b.expiry_date ?? undefined,
        }))
      if (items.length === 0) return
      const doc = await generateLabelSheet(items)
      doc.save(`etiquetas-lotes.pdf`)
    } finally {
      setGeneratingPdf(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rastreabilidade QR</h1>
          <p className="text-muted-foreground">Gerencie QR codes e etiquetas dos lotes</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/scanner">
              <ScanLine className="h-4 w-4" /> Scanner
            </Link>
          </Button>
          {selectedForPrint.size > 0 && (
            <Button className="gap-2" onClick={handlePrintSheet} disabled={generatingPdf}>
              <Printer className="h-4 w-4" />
              Imprimir {selectedForPrint.size} etiqueta{selectedForPrint.size > 1 ? 's' : ''}
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="h-16" /></Card>
          ))}
        </div>
      ) : batches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhum lote registrado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Crie lotes de produção para gerar QR codes de rastreabilidade
            </p>
            <Button asChild className="mt-4" variant="outline">
              <Link to="/batches">Ir para Lotes</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {batches.map((batch) => (
            <Card key={batch.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedForPrint.has(batch.id)}
                    onCheckedChange={() => togglePrintSelection(batch.id)}
                  />
                  <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FlaskConical className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{batch.batch_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(batch.production_date), 'dd/MM/yyyy')}
                      {batch.volume_liters ? ` — ${batch.volume_liters} L` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleShowQR(batch.batch_number)} title="Ver QR">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDownloadQR(batch.batch_number)} title="Baixar QR PNG">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleSingleLabel(batch)} disabled={generatingPdf} title="Etiqueta PDF">
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button asChild variant="ghost" size="sm" title="Página pública">
                      <Link to={`/trace/${encodeURIComponent(batch.batch_number)}`}>
                        <QrCode className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* QR Preview Dialog */}
      <Dialog open={!!selectedQR} onOpenChange={() => setSelectedQR(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>QR Code — {selectedQR?.batchNumber}</DialogTitle>
          </DialogHeader>
          {selectedQR && (
            <div className="flex flex-col items-center gap-4 py-4">
              <img src={selectedQR.dataUrl} alt="QR Code" className="w-64 h-64" />
              <p className="text-xs text-muted-foreground text-center break-all">
                {getTraceUrl(selectedQR.batchNumber)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedQR(null)}>Fechar</Button>
            <Button onClick={() => selectedQR && handleDownloadQR(selectedQR.batchNumber)}>
              <Download className="h-4 w-4 mr-2" /> Baixar PNG
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
