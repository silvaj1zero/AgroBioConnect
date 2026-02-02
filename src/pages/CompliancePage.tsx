import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { useAllBatches } from '@/hooks/useBatches'
import { useFieldEntries } from '@/hooks/useFields'
import { useAnalytics } from '@/hooks/useCompliance'
import { generateComplianceCertificate, generateFieldNotebookReport, exportCSV } from '@/lib/pdf-reports'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  FileCheck,
  FileText,
  Download,
  Shield,
  BarChart3,
  Sprout,
  FlaskConical,
  Droplets,
  MapPin,
} from 'lucide-react'

export function CompliancePage() {
  const { role } = useAuth()
  const { data: analytics, isLoading: loadingAnalytics } = useAnalytics()
  const { data: batches = [] } = useAllBatches()
  const { data: entries = [] } = useFieldEntries()
  const [generating, setGenerating] = useState('')

  const handleFieldNotebookPDF = async () => {
    setGenerating('notebook')
    try {
      const doc = await generateFieldNotebookReport({
        entries: entries.map((e) => ({
          entry_date: e.entry_date,
          activity_type: e.activity_type ?? 'other',
          field_name: e.field_name ?? undefined,
          description: e.description,
          weather_conditions: e.weather_conditions ?? undefined,
          temperature_celsius: e.temperature_celsius ?? undefined,
          products_used: e.products_used ?? undefined,
        })),
      })
      doc.save(`caderno-campo-${new Date().toISOString().split('T')[0]}.pdf`)
    } finally {
      setGenerating('')
    }
  }

  const handleBatchCertificate = async (batch: any) => {
    setGenerating(batch.id)
    try {
      const doc = await generateComplianceCertificate({
        batch,
        reports: [],
      })
      doc.save(`certificado-${batch.batch_number}.pdf`)
    } finally {
      setGenerating('')
    }
  }

  const handleExportFieldCSV = () => {
    const headers = ['Data', 'Tipo', 'Talhão', 'Descrição', 'Clima', 'Temperatura']
    const rows = entries.map((e) => [
      e.entry_date,
      e.activity_type ?? '',
      e.field_name ?? '',
      e.description,
      e.weather_conditions ?? '',
      e.temperature_celsius?.toString() ?? '',
    ])
    exportCSV(headers, rows, `caderno-campo-${new Date().toISOString().split('T')[0]}.csv`)
  }

  const handleExportBatchCSV = () => {
    const headers = ['Lote', 'Data Produção', 'Volume (L)', 'pH Inicial', 'Temperatura', 'Status']
    const rows = batches.map((b) => [
      b.batch_number,
      b.production_date,
      b.volume_liters?.toString() ?? '',
      b.initial_ph?.toString() ?? '',
      b.fermentation_temp_celsius?.toString() ?? '',
      b.status,
    ])
    exportCSV(headers, rows, `lotes-${new Date().toISOString().split('T')[0]}.csv`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Conformidade e Relatórios</h1>
          <p className="text-muted-foreground">Gere relatórios, exporte dados e monitore a conformidade</p>
        </div>
        {(role === 'auditor' || role === 'admin') && (
          <Button asChild variant="outline" className="gap-2">
            <Link to="/audit">
              <Shield className="h-4 w-4" /> Modo Auditoria
            </Link>
          </Button>
        )}
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics?.totalFields ?? '—'}</p>
                <p className="text-xs text-muted-foreground">Talhões</p>
              </div>
            </div>
            {analytics?.totalHectares ? (
              <p className="text-xs text-muted-foreground mt-2">{analytics.totalHectares.toFixed(1)} hectares</p>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FlaskConical className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics?.totalBatches ?? '—'}</p>
                <p className="text-xs text-muted-foreground">Lotes</p>
              </div>
            </div>
            {analytics?.totalVolumeLiters ? (
              <p className="text-xs text-muted-foreground mt-2">{analytics.totalVolumeLiters.toFixed(0)} L produzidos</p>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Droplets className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics?.totalApplications ?? '—'}</p>
                <p className="text-xs text-muted-foreground">Aplicações</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics?.complianceRate?.toFixed(0) ?? '—'}%</p>
                <p className="text-xs text-muted-foreground">Conformidade</p>
              </div>
            </div>
            {analytics && (
              <Progress value={analytics.complianceRate} className="mt-2 h-1.5" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Batch Status Breakdown */}
      {analytics && Object.keys(analytics.batchStatusCounts).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Status dos Lotes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              {Object.entries(analytics.batchStatusCounts).map(([status, count]) => (
                <div key={status} className="text-center">
                  <p className="text-lg font-bold">{count}</p>
                  <Badge variant="secondary" className="text-xs">{translateStatus(status)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports & Exports */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" /> Relatórios PDF
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleFieldNotebookPDF}
              disabled={generating === 'notebook' || entries.length === 0}
            >
              <Sprout className="h-4 w-4" />
              {generating === 'notebook' ? 'Gerando...' : 'Caderno de Campo (PDF)'}
            </Button>

            {batches.filter((b) => b.status === 'approved').length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Certificados de Conformidade:</p>
                {batches.filter((b) => b.status === 'approved').map((b) => (
                  <Button
                    key={b.id}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => handleBatchCertificate(b)}
                    disabled={generating === b.id}
                  >
                    <FileCheck className="h-3 w-3" />
                    {generating === b.id ? 'Gerando...' : `Certificado — ${b.batch_number}`}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-4 w-4" /> Exportação CSV
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleExportFieldCSV}
              disabled={entries.length === 0}
            >
              <Sprout className="h-4 w-4" /> Caderno de Campo (CSV)
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleExportBatchCSV}
              disabled={batches.length === 0}
            >
              <FlaskConical className="h-4 w-4" /> Lotes de Produção (CSV)
            </Button>
            <p className="text-xs text-muted-foreground">
              Formato CSV compatível com MAPA (separador ponto-e-vírgula, UTF-8 BOM)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* LGPD Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" /> LGPD — Proteção de Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Seus dados são armazenados de acordo com a Lei Geral de Proteção de Dados (LGPD).
            Para solicitar exclusão, portabilidade ou revisão dos seus dados, entre em contato
            com o administrador do sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function translateStatus(status: string): string {
  const map: Record<string, string> = {
    in_production: 'Em Produção',
    quality_control: 'Controle de Qualidade',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    distributed: 'Distribuído',
  }
  return map[status] ?? status
}
