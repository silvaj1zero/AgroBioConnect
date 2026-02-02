import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { useDistinctFields, useCreateFieldEntry } from '@/hooks/useFields'
import { useProducts } from '@/hooks/useProducts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Camera, CloudSun, Droplets, MapPin, Thermometer } from 'lucide-react'

const ACTIVITY_TYPES = [
  { value: 'application', label: 'Aplicação de Produto' },
  { value: 'monitoring', label: 'Monitoramento' },
  { value: 'harvest', label: 'Colheita' },
  { value: 'planting', label: 'Plantio' },
  { value: 'soil_preparation', label: 'Preparo de Solo' },
  { value: 'irrigation', label: 'Irrigação' },
  { value: 'other', label: 'Outro' },
]

export function FieldActivityPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { data: fields = [] } = useDistinctFields()
  const { data: products = [] } = useProducts()
  const createEntry = useCreateFieldEntry()

  const [form, setForm] = useState({
    activity_type: 'application',
    entry_date: new Date().toISOString().split('T')[0],
    field_name: '',
    product_id: '',
    dosage: '',
    method: '',
    weather_conditions: '',
    temperature: '',
    humidity: '',
    description: '',
    observations: '',
  })
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile?.organization_id) return
    setError('')

    try {
      const productsUsed = form.product_id && form.dosage
        ? [{ product_id: form.product_id, quantity: parseFloat(form.dosage) || 0, unit: 'L/ha' }]
        : undefined

      await createEntry.mutateAsync({
        organization_id: profile.organization_id,
        entry_date: form.entry_date,
        activity_type: form.activity_type,
        field_name: form.field_name || undefined,
        description: form.description || `${ACTIVITY_TYPES.find((t) => t.value === form.activity_type)?.label}`,
        weather_conditions: form.weather_conditions || undefined,
        temperature_celsius: form.temperature ? parseFloat(form.temperature) : undefined,
        humidity_percentage: form.humidity ? parseFloat(form.humidity) : undefined,
        products_used: productsUsed,
        equipment_used: form.method ? [form.method] : undefined,
        observations: form.observations || undefined,
      })
      navigate('/fields')
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar atividade')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Registrar Atividade</h1>
          <p className="text-muted-foreground text-sm">Registre uma atividade no caderno de campo</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações da Atividade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Atividade *</Label>
                <Select value={form.activity_type} onValueChange={(v: string) => set('activity_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input type="date" value={form.entry_date} onChange={(e: any) => set('entry_date', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Talhão</Label>
              <Select value={form.field_name} onValueChange={(v: string) => set('field_name', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione o talhão" /></SelectTrigger>
                <SelectContent>
                  {fields.map((f) => (
                    <SelectItem key={f.field_name} value={f.field_name}>{f.field_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Textarea
                value={form.description}
                onChange={(e: any) => set('description', e.target.value)}
                placeholder="Descreva a atividade realizada..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Application-specific fields */}
        {form.activity_type === 'application' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Droplets className="h-4 w-4" /> Dados da Aplicação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Produto</Label>
                <Select value={form.product_id} onValueChange={(v: string) => set('product_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione o produto" /></SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dose (L/ha ou kg/ha)</Label>
                  <Input type="number" step="0.1" value={form.dosage} onChange={(e: any) => set('dosage', e.target.value)} placeholder="2.5" />
                </div>
                <div className="space-y-2">
                  <Label>Método de Aplicação</Label>
                  <Select value={form.method} onValueChange={(v: string) => set('method', v)}>
                    <SelectTrigger><SelectValue placeholder="Método" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spray">Pulverização</SelectItem>
                      <SelectItem value="drench">Drench</SelectItem>
                      <SelectItem value="seed_treatment">Tratamento de Sementes</SelectItem>
                      <SelectItem value="irrigation">Via Irrigação</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weather */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CloudSun className="h-4 w-4" /> Condições Climáticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <CloudSun className="h-3 w-3" /> Condição
                </Label>
                <Select value={form.weather_conditions} onValueChange={(v: string) => set('weather_conditions', v)}>
                  <SelectTrigger><SelectValue placeholder="Clima" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunny">Ensolarado</SelectItem>
                    <SelectItem value="cloudy">Nublado</SelectItem>
                    <SelectItem value="rainy">Chuvoso</SelectItem>
                    <SelectItem value="windy">Ventoso</SelectItem>
                    <SelectItem value="dry">Seco</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Thermometer className="h-3 w-3" /> Temp (°C)
                </Label>
                <Input type="number" step="0.1" value={form.temperature} onChange={(e: any) => set('temperature', e.target.value)} placeholder="28" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Droplets className="h-3 w-3" /> Umidade (%)
                </Label>
                <Input type="number" step="1" value={form.humidity} onChange={(e: any) => set('humidity', e.target.value)} placeholder="65" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photos placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="h-4 w-4" /> Fotos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Arraste fotos ou clique para fazer upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                (Upload via Supabase Storage será habilitado com bucket configurado)
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Label>Observações Adicionais</Label>
          <Textarea
            value={form.observations}
            onChange={(e: any) => set('observations', e.target.value)}
            placeholder="Observações sobre pragas, solo, crescimento..."
            rows={2}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" disabled={createEntry.isPending}>
            {createEntry.isPending ? 'Salvando...' : 'Registrar Atividade'}
          </Button>
        </div>
      </form>
    </div>
  )
}
