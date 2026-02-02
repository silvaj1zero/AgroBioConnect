import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useBatch, useQualityReports, useCreateQualityReport, useUpdateBatch } from '@/hooks/useBatches'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, FlaskConical, AlertTriangle, CheckCircle2, Upload, FileText } from 'lucide-react'
import { format } from 'date-fns'

const EMBRAPA_MIN_UFC = 1e8 // 1x10^8 UFC/mL minimum per Embrapa standards

export function BatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: batch, isLoading } = useBatch(id)
  const { data: reports = [] } = useQualityReports(id)
  const createReport = useCreateQualityReport()
  const updateBatch = useUpdateBatch()

  const [showReport, setShowReport] = useState(false)
  const [reportForm, setReportForm] = useState({
    report_number: '',
    report_date: new Date().toISOString().split('T')[0],
    ufc_ml: '',
    purity_percentage: '',
    ph_value: '',
    viability_percentage: '',
    salmonella_present: false,
    ecoli_present: false,
    notes: '',
  })

  const setR = (k: string, v: string | boolean) => setReportForm((p) => ({ ...p, [k]: v }))

  const handleCreateReport = async () => {
    if (!id || !reportForm.report_number) return
    await createReport.mutateAsync({
      batch_id: id,
      report_number: reportForm.report_number,
      report_date: reportForm.report_date,
      ufc_ml: reportForm.ufc_ml ? parseFloat(reportForm.ufc_ml) : undefined,
      purity_percentage: reportForm.purity_percentage ? parseFloat(reportForm.purity_percentage) : undefined,
      ph_value: reportForm.ph_value ? parseFloat(reportForm.ph_value) : undefined,
      viability_percentage: reportForm.viability_percentage ? parseFloat(reportForm.viability_percentage) : undefined,
      salmonella_present: reportForm.salmonella_present,
      ecoli_present: reportForm.ecoli_present,
      notes: reportForm.notes || undefined,
    })
    setShowReport(false)
    setReportForm({
      report_number: '', report_date: new Date().toISOString().split('T')[0],
      ufc_ml: '', purity_percentage: '', ph_value: '', viability_percentage: '',
      salmonella_present: false, ecoli_present: false, notes: '',
    })
  }

  if (isLoading) return <div className="animate-pulse h-64 bg-muted rounded-lg" />
  if (!batch) return (
    <div className="text-center py-12">
      <p>Lote não encontrado</p>
      <Button asChild variant="link"><Link to="/batches">Voltar</Link></Button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link to="/batches"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Lote {batch.batch_number}</h1>
          <p className="text-muted-foreground text-sm">
            Produzido em {format(new Date(batch.production_date), 'dd/MM/yyyy')}
          </p>
        </div>
        <Badge variant={batch.status === 'approved' ? 'outline' : batch.status === 'rejected' ? 'destructive' : 'default'}>
          {batch.status === 'in_production' ? 'Em Produção' :
           batch.status === 'quality_control' ? 'Controle de Qualidade' :
           batch.status === 'approved' ? 'Aprovado' :
           batch.status === 'rejected' ? 'Rejeitado' : batch.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Batch Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FlaskConical className="h-4 w-4" /> Parâmetros de Fermentação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Volume:</span>
                <p className="font-medium">{batch.volume_liters ? `${batch.volume_liters} L` : '—'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">pH Inicial:</span>
                <p className="font-medium">{batch.initial_ph ?? '—'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">pH Final:</span>
                <p className="font-medium">{batch.final_ph ?? '—'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Temperatura:</span>
                <p className="font-medium">{batch.fermentation_temp_celsius ? `${batch.fermentation_temp_celsius}°C` : '—'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Duração:</span>
                <p className="font-medium">{batch.fermentation_duration_hours ? `${batch.fermentation_duration_hours}h` : '—'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Concentração:</span>
                <p className="font-medium">{batch.organism_concentration ?? '—'}</p>
              </div>
            </div>
            {batch.notes && (
              <>
                <Separator className="my-4" />
                <p className="text-sm text-muted-foreground">{batch.notes}</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Status Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {batch.status === 'in_production' && (
              <Button
                className="w-full"
                onClick={() => updateBatch.mutate({ id: batch.id, status: 'quality_control' } as any)}
                disabled={updateBatch.isPending}
              >
                Enviar para Controle de Qualidade
              </Button>
            )}
            {batch.status === 'quality_control' && (
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => updateBatch.mutate({ id: batch.id, status: 'approved' } as any)}
                  disabled={updateBatch.isPending}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Aprovar Lote
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => updateBatch.mutate({ id: batch.id, status: 'rejected' } as any)}
                  disabled={updateBatch.isPending}
                >
                  Rejeitar Lote
                </Button>
              </div>
            )}
            <Button variant="outline" className="w-full gap-2" onClick={() => setShowReport(true)}>
              <Upload className="h-4 w-4" /> Adicionar Laudo Laboratorial
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quality Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" /> Laudos Laboratoriais ({reports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum laudo registrado. Adicione o primeiro laudo laboratorial.
            </p>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => {
                const ufcValue = report.ufc_ml ?? 0
                const belowEmbrapa = ufcValue > 0 && ufcValue < EMBRAPA_MIN_UFC
                return (
                  <div key={report.id} className="p-4 rounded-lg border space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Laudo {report.report_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(report.report_date), 'dd/MM/yyyy')}
                        </p>
                      </div>
                      {belowEmbrapa && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" /> UFC Abaixo do Padrão
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      {report.ufc_ml != null && (
                        <div>
                          <span className="text-muted-foreground text-xs">UFC/mL:</span>
                          <p className={`font-medium ${belowEmbrapa ? 'text-destructive' : ''}`}>
                            {report.ufc_ml.toExponential(1)}
                          </p>
                        </div>
                      )}
                      {report.purity_percentage != null && (
                        <div>
                          <span className="text-muted-foreground text-xs">Pureza:</span>
                          <p className="font-medium">{report.purity_percentage}%</p>
                        </div>
                      )}
                      {report.ph_value != null && (
                        <div>
                          <span className="text-muted-foreground text-xs">pH:</span>
                          <p className="font-medium">{report.ph_value}</p>
                        </div>
                      )}
                    </div>
                    {(report.salmonella_present || report.ecoli_present) && (
                      <div className="flex gap-2">
                        {report.salmonella_present && <Badge variant="destructive">Salmonella detectada</Badge>}
                        {report.ecoli_present && <Badge variant="destructive">E. coli detectada</Badge>}
                      </div>
                    )}
                    {report.notes && (
                      <p className="text-xs text-muted-foreground">{report.notes}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Report Dialog */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Laudo Laboratorial</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número do Laudo *</Label>
                <Input value={reportForm.report_number} onChange={(e: any) => setR('report_number', e.target.value)} placeholder="LAB-2026-001" />
              </div>
              <div className="space-y-2">
                <Label>Data do Laudo</Label>
                <Input type="date" value={reportForm.report_date} onChange={(e: any) => setR('report_date', e.target.value)} />
              </div>
            </div>

            <Separator />
            <p className="text-sm font-medium">Análise Microbiológica</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>UFC/mL</Label>
                <Input type="number" value={reportForm.ufc_ml} onChange={(e: any) => setR('ufc_ml', e.target.value)} placeholder="1000000000" />
                {reportForm.ufc_ml && parseFloat(reportForm.ufc_ml) < EMBRAPA_MIN_UFC && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Abaixo do mínimo Embrapa (1×10⁸ UFC/mL)
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Viabilidade (%)</Label>
                <Input type="number" step="0.1" value={reportForm.viability_percentage} onChange={(e: any) => setR('viability_percentage', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Pureza (%)</Label>
                <Input type="number" step="0.1" value={reportForm.purity_percentage} onChange={(e: any) => setR('purity_percentage', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>pH</Label>
                <Input type="number" step="0.1" value={reportForm.ph_value} onChange={(e: any) => setR('ph_value', e.target.value)} />
              </div>
            </div>

            <Separator />
            <p className="text-sm font-medium">Contaminação</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="salmonella">Salmonella presente</Label>
                <Switch
                  id="salmonella"
                  checked={reportForm.salmonella_present}
                  onCheckedChange={(v: boolean) => setR('salmonella_present', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="ecoli">E. coli presente</Label>
                <Switch
                  id="ecoli"
                  checked={reportForm.ecoli_present}
                  onCheckedChange={(v: boolean) => setR('ecoli_present', v)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={reportForm.notes} onChange={(e: any) => setR('notes', e.target.value)} rows={2} />
            </div>

            {/* File upload placeholder */}
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Upload do PDF do laudo (via Supabase Storage)</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReport(false)}>Cancelar</Button>
            <Button onClick={handleCreateReport} disabled={!reportForm.report_number || createReport.isPending}>
              {createReport.isPending ? 'Salvando...' : 'Salvar Laudo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
