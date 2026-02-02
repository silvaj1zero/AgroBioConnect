import { useState } from 'react'
import { useDistinctFields, useFieldEntries, useCreateFieldEntry } from '@/hooks/useFields'
import { useCrops } from '@/hooks/useProducts'
import { useAuth } from '@/lib/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { MapPin, Plus, Ruler, Sprout } from 'lucide-react'

export function FieldsPage() {
  const { profile } = useAuth()
  const { data: fields = [], isLoading } = useDistinctFields()
  const { data: crops = [] } = useCrops()
  const createEntry = useCreateFieldEntry()

  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({
    field_name: '',
    area_hectares: '',
    latitude: '',
    longitude: '',
    crop: '',
    description: '',
  })

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleCreate = async () => {
    if (!profile?.organization_id || !form.field_name) return
    await createEntry.mutateAsync({
      organization_id: profile.organization_id,
      entry_date: new Date().toISOString().split('T')[0],
      activity_type: 'field_registration',
      field_name: form.field_name,
      area_hectares: form.area_hectares ? parseFloat(form.area_hectares) : undefined,
      latitude: form.latitude ? parseFloat(form.latitude) : undefined,
      longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      description: form.description || `Talhão ${form.field_name} registrado`,
    })
    setShowNew(false)
    setForm({ field_name: '', area_hectares: '', latitude: '', longitude: '', crop: '', description: '' })
  }

  const getLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set('latitude', pos.coords.latitude.toFixed(6))
        set('longitude', pos.coords.longitude.toFixed(6))
      },
      () => {}
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Talhões</h1>
          <p className="text-muted-foreground">Gerencie as áreas de cultivo da sua propriedade</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Talhão
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader><div className="h-5 bg-muted rounded w-3/4" /></CardHeader>
              <CardContent><div className="h-4 bg-muted rounded w-1/2" /></CardContent>
            </Card>
          ))}
        </div>
      ) : fields.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhum talhão cadastrado</p>
            <p className="text-sm text-muted-foreground mt-1">Adicione seu primeiro talhão para começar</p>
            <Button onClick={() => setShowNew(true)} className="mt-4 gap-2">
              <Plus className="h-4 w-4" /> Cadastrar Talhão
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => (
            <Card key={field.field_name} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{field.field_name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {field.area_hectares && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Ruler className="h-4 w-4" />
                    {field.area_hectares} ha
                  </div>
                )}
                {field.latitude && field.longitude && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {Number(field.latitude).toFixed(4)}, {Number(field.longitude).toFixed(4)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Map placeholder */}
      {fields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mapa dos Talhões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Mapa Leaflet será exibido aqui quando coordenadas estiverem cadastradas
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Field Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Talhão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Talhão *</Label>
              <Input value={form.field_name} onChange={(e: any) => set('field_name', e.target.value)} placeholder="Talhão A1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Área (hectares)</Label>
                <Input type="number" step="0.01" value={form.area_hectares} onChange={(e: any) => set('area_hectares', e.target.value)} placeholder="50" />
              </div>
              <div className="space-y-2">
                <Label>Cultura</Label>
                <Select value={form.crop} onValueChange={(v: string) => set('crop', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {crops.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Coordenadas GPS</Label>
                <Button type="button" variant="outline" size="sm" onClick={getLocation}>
                  <MapPin className="h-3 w-3 mr-1" /> Obter GPS
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input type="number" step="0.000001" value={form.latitude} onChange={(e: any) => set('latitude', e.target.value)} placeholder="Latitude" />
                <Input type="number" step="0.000001" value={form.longitude} onChange={(e: any) => set('longitude', e.target.value)} placeholder="Longitude" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={form.description} onChange={(e: any) => set('description', e.target.value)} placeholder="Solo argiloso, irrigação por pivô..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={!form.field_name || createEntry.isPending}>
              {createEntry.isPending ? 'Salvando...' : 'Salvar Talhão'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
