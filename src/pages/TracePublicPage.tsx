import { useParams, Link } from 'react-router-dom'
import { useTraceabilityByNumber } from '@/hooks/useTraceability'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  Leaf,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calendar,
  FileText,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const EMBRAPA_MIN_UFC = 1e8

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  in_production: { label: 'Em Produção', color: 'bg-yellow-100 text-yellow-800' },
  quality_control: { label: 'Controle de Qualidade', color: 'bg-blue-100 text-blue-800' },
  approved: { label: 'Aprovado', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-800' },
  distributed: { label: 'Distribuído', color: 'bg-purple-100 text-purple-800' },
}

export function TracePublicPage() {
  const { batchNumber } = useParams<{ batchNumber: string }>()
  const { data, isLoading, isError } = useTraceabilityByNumber(batchNumber)

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-48 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Lote não encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">
              O código "{batchNumber}" não corresponde a nenhum lote registrado.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link to="/scanner">
                <ArrowLeft className="h-4 w-4 mr-2" /> Escanear outro QR
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { batch, reports, activities } = data
  const st = STATUS_LABELS[batch.status] ?? { label: batch.status, color: 'bg-gray-100 text-gray-800' }
  const latestReport = reports[0]
  const ufcOk = latestReport?.ufc_ml != null && latestReport.ufc_ml >= EMBRAPA_MIN_UFC
  const hasContamination = latestReport?.salmonella_present || latestReport?.ecoli_present

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Leaf className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-primary">AgroBio</h1>
          <p className="text-xs text-muted-foreground">Rastreabilidade de Bioinsumos</p>
        </div>
      </div>

      {/* Batch Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FlaskConical className="h-5 w-5" /> Lote {batch.batch_number}
            </CardTitle>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>
              {st.label}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Produção:</span>
              <p className="font-medium">
                {format(new Date(batch.production_date + 'T12:00:00'), "dd 'de' MMMM, yyyy", { locale: ptBR })}
              </p>
            </div>
            {batch.expiry_date && (
              <div>
                <span className="text-muted-foreground">Validade:</span>
                <p className="font-medium">
                  {format(new Date(batch.expiry_date + 'T12:00:00'), 'dd/MM/yyyy')}
                </p>
              </div>
            )}
            {batch.volume_liters && (
              <div>
                <span className="text-muted-foreground">Volume:</span>
                <p className="font-medium">{batch.volume_liters} L</p>
              </div>
            )}
            {batch.organism_concentration && (
              <div>
                <span className="text-muted-foreground">Concentração:</span>
                <p className="font-medium">{batch.organism_concentration}</p>
              </div>
            )}
          </div>

          {/* Product info */}
          {batch.product && (
            <>
              <Separator />
              <div className="text-sm">
                <span className="text-muted-foreground">Produto:</span>
                <p className="font-medium">{batch.product.name}</p>
                {batch.product.mapa_registration_number && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Registro MAPA: {batch.product.mapa_registration_number}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Biofactory info */}
          {batch.biofactory && (
            <>
              <Separator />
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{batch.biofactory.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {batch.biofactory.address_city}, {batch.biofactory.address_state}
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quality Status */}
      {latestReport && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Controle de Qualidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              {ufcOk && !hasContamination ? (
                <Badge variant="outline" className="gap-1 text-green-700 border-green-300 bg-green-50">
                  <CheckCircle2 className="h-3 w-3" /> Conforme Embrapa
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" /> Alerta de Qualidade
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              {latestReport.ufc_ml != null && (
                <div>
                  <span className="text-muted-foreground text-xs">UFC/mL:</span>
                  <p className={`font-medium ${!ufcOk ? 'text-destructive' : ''}`}>
                    {latestReport.ufc_ml.toExponential(1)}
                  </p>
                </div>
              )}
              {latestReport.purity_percentage != null && (
                <div>
                  <span className="text-muted-foreground text-xs">Pureza:</span>
                  <p className="font-medium">{latestReport.purity_percentage}%</p>
                </div>
              )}
              {latestReport.ph_value != null && (
                <div>
                  <span className="text-muted-foreground text-xs">pH:</span>
                  <p className="font-medium">{latestReport.ph_value}</p>
                </div>
              )}
            </div>

            {hasContamination && (
              <div className="flex gap-2">
                {latestReport.salmonella_present && <Badge variant="destructive">Salmonella</Badge>}
                {latestReport.ecoli_present && <Badge variant="destructive">E. coli</Badge>}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Laudo: {latestReport.report_number} — {format(new Date(latestReport.report_date), 'dd/MM/yyyy')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Traceability Chain */}
      {activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Cadeia de Rastreabilidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.map((a) => (
                <div key={a.id} className="flex gap-3 text-sm">
                  <div className="text-xs text-muted-foreground w-20 flex-shrink-0 pt-0.5">
                    {format(new Date(a.date + 'T12:00:00'), 'dd/MM/yyyy')}
                  </div>
                  <div>
                    <p className="font-medium">{a.description}</p>
                    {a.field_name && (
                      <p className="text-xs text-muted-foreground">{a.field_name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground py-4">
        <p>Dados verificados via AgroBio</p>
        <p>Sistema de rastreabilidade de bioinsumos</p>
      </div>
    </div>
  )
}
