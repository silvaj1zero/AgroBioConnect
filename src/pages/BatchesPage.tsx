import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAllBatches, useCreateBatch } from '@/hooks/useBatches'
import { useBiofactories } from '@/hooks/useBiofactories'
import { useProducts } from '@/hooks/useProducts'
import { useAuth } from '@/lib/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FlaskConical, Plus, Thermometer, Droplets } from 'lucide-react'
import { format } from 'date-fns'

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  in_production: { label: 'Em Produção', variant: 'default' },
  quality_control: { label: 'Controle de Qualidade', variant: 'secondary' },
  approved: { label: 'Aprovado', variant: 'outline' },
  rejected: { label: 'Rejeitado', variant: 'destructive' },
  distributed: { label: 'Distribuído', variant: 'outline' },
}

export function BatchesPage() {
  const { data: batches = [], isLoading } = useAllBatches()
  const { data: biofactories = [] } = useBiofactories()
  const { data: products = [] } = useProducts()
  const createBatch = useCreateBatch()

  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({
    biofactory_id: '',
    product_id: '',
    batch_number: '',
    production_date: new Date().toISOString().split('T')[0],
    volume_liters: '',
    initial_ph: '',
    fermentation_temp_celsius: '',
    fermentation_duration_hours: '',
    fermentation_start_date: '',
    organism_concentration: '',
    notes: '',
  })

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleCreate = async () => {
    if (!form.biofactory_id || !form.batch_number) return
    await createBatch.mutateAsync({
      biofactory_id: form.biofactory_id,
      product_id: form.product_id || undefined,
      batch_number: form.batch_number,
      production_date: form.production_date,
      volume_liters: form.volume_liters ? parseFloat(form.volume_liters) : undefined,
      initial_ph: form.initial_ph ? parseFloat(form.initial_ph) : undefined,
      fermentation_temp_celsius: form.fermentation_temp_celsius ? parseFloat(form.fermentation_temp_celsius) : undefined,
      fermentation_duration_hours: form.fermentation_duration_hours ? parseInt(form.fermentation_duration_hours) : undefined,
      fermentation_start_date: form.fermentation_start_date || undefined,
      organism_concentration: form.organism_concentration || undefined,
      notes: form.notes || undefined,
    })
    setShowNew(false)
    setForm({
      biofactory_id: '', product_id: '', batch_number: '',
      production_date: new Date().toISOString().split('T')[0],
      volume_liters: '', initial_ph: '', fermentation_temp_celsius: '',
      fermentation_duration_hours: '', fermentation_start_date: '',
      organism_concentration: '', notes: '',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lotes de Produção</h1>
          <p className="text-muted-foreground">Gerencie os lotes de bioinsumos produzidos</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="gap-2" disabled={biofactories.length === 0}>
          <Plus className="h-4 w-4" /> Novo Lote
        </Button>
      </div>

      {biofactories.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Registre uma biofábrica antes de criar lotes de produção.
            </p>
            <Button asChild className="mt-4" variant="outline">
              <Link to="/biofactory/new">Registrar Biofábrica</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Card className="animate-pulse"><CardContent className="h-48" /></Card>
      ) : batches.length === 0 ? (
        biofactories.length > 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FlaskConical className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Nenhum lote registrado</p>
              <p className="text-sm text-muted-foreground mt-1">Registre seu primeiro lote de produção</p>
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lote</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>pH</TableHead>
                <TableHead>Temp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => {
                const st = STATUS_MAP[batch.status] ?? { label: batch.status, variant: 'secondary' as const }
                return (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium">{batch.batch_number}</TableCell>
                    <TableCell>{format(new Date(batch.production_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{batch.volume_liters ? `${batch.volume_liters} L` : '—'}</TableCell>
                    <TableCell>{batch.initial_ph ?? '—'}</TableCell>
                    <TableCell>{batch.fermentation_temp_celsius ? `${batch.fermentation_temp_celsius}°C` : '—'}</TableCell>
                    <TableCell><Badge variant={st.variant}>{st.label}</Badge></TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/batches/${batch.id}`}>Ver</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* New Batch Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Lote de Produção</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Biofábrica *</Label>
              <Select value={form.biofactory_id} onValueChange={(v: string) => set('biofactory_id', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {biofactories.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número do Lote *</Label>
                <Input value={form.batch_number} onChange={(e: any) => set('batch_number', e.target.value)} placeholder="LOT-2026-001" />
              </div>
              <div className="space-y-2">
                <Label>Data de Produção</Label>
                <Input type="date" value={form.production_date} onChange={(e: any) => set('production_date', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Produto</Label>
              <Select value={form.product_id} onValueChange={(v: string) => set('product_id', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3 flex items-center gap-2">
                <FlaskConical className="h-4 w-4" /> Parâmetros de Fermentação
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Volume (L)</Label>
                  <Input type="number" step="0.1" value={form.volume_liters} onChange={(e: any) => set('volume_liters', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>pH Inicial</Label>
                  <Input type="number" step="0.1" min="0" max="14" value={form.initial_ph} onChange={(e: any) => set('initial_ph', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Thermometer className="h-3 w-3" /> Temperatura (°C)</Label>
                  <Input type="number" step="0.1" value={form.fermentation_temp_celsius} onChange={(e: any) => set('fermentation_temp_celsius', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Duração (horas)</Label>
                  <Input type="number" value={form.fermentation_duration_hours} onChange={(e: any) => set('fermentation_duration_hours', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label>Concentração de Organismos</Label>
                <Input value={form.organism_concentration} onChange={(e: any) => set('organism_concentration', e.target.value)} placeholder="1x10^9 UFC/mL" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={(e: any) => set('notes', e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={!form.biofactory_id || !form.batch_number || createBatch.isPending}>
              {createBatch.isPending ? 'Salvando...' : 'Criar Lote'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
