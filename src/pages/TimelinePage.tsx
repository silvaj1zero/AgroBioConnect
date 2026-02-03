import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFieldEntries } from '@/hooks/useFields'
import { useAllBatches } from '@/hooks/useBatches'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Plus,
  Sprout,
  Droplets,
  FlaskConical,
  Eye,
  Tractor,
  CloudSun,
  MapPin,
  Calendar,
  Filter,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  application: Droplets,
  monitoring: Eye,
  harvest: Tractor,
  planting: Sprout,
  soil_preparation: Tractor,
  field_registration: MapPin,
  production: FlaskConical,
  other: Calendar,
}

const ACTIVITY_LABELS: Record<string, string> = {
  application: 'Aplicação',
  monitoring: 'Monitoramento',
  harvest: 'Colheita',
  planting: 'Plantio',
  soil_preparation: 'Preparo de Solo',
  irrigation: 'Irrigação',
  field_registration: 'Registro de Talhão',
  production: 'Produção',
  other: 'Outro',
}

export function TimelinePage() {
  const [typeFilter, setTypeFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')

  const { data: entries = [], isLoading: loadingEntries } = useFieldEntries(
    typeFilter ? { activityType: typeFilter } : undefined
  )
  const { data: batches = [], isLoading: loadingBatches } = useAllBatches()

  // Merge entries and batches into a unified timeline
  interface TimelineItem {
    id: string
    date: string
    type: string
    title: string
    description: string
    location?: string
    weather?: string
    link?: string
    source: 'entry' | 'batch'
  }

  const timeline: TimelineItem[] = [
    ...entries.map((e) => ({
      id: e.id,
      date: e.entry_date,
      type: e.activity_type ?? 'other',
      title: ACTIVITY_LABELS[e.activity_type ?? ''] ?? e.activity_type ?? 'Atividade',
      description: e.description,
      location: e.field_name ?? undefined,
      weather: e.weather_conditions ?? undefined,
      source: 'entry' as const,
    })),
    ...batches.map((b) => ({
      id: b.id,
      date: b.production_date,
      type: 'production',
      title: `Lote ${b.batch_number}`,
      description: b.notes ?? `Lote de produção - ${b.volume_liters ? b.volume_liters + 'L' : ''}`,
      link: `/batches/${b.id}`,
      source: 'batch' as const,
    })),
  ]
    .filter((item) => !dateFrom || item.date >= dateFrom)
    .sort((a, b) => b.date.localeCompare(a.date))

  const isLoading = loadingEntries || loadingBatches

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Timeline de Atividades</h1>
          <p className="text-muted-foreground">Histórico cronológico de todas as operações</p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/fields/activity/new">
            <Plus className="h-4 w-4" /> Nova Atividade
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={typeFilter || 'all'} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Tipo de atividade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(ACTIVITY_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e: any) => setDateFrom(e.target.value)}
          className="w-full sm:w-[180px]"
          placeholder="A partir de"
        />
        {(typeFilter || dateFrom) && (
          <Button variant="ghost" size="sm" onClick={() => { setTypeFilter(''); setDateFrom('') }}>
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="h-20" /></Card>
          ))}
        </div>
      ) : timeline.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhuma atividade registrada</p>
            <p className="text-sm text-muted-foreground mt-1">
              Registre atividades no caderno de campo ou crie lotes de produção
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-4">
            {timeline.map((item) => {
              const Icon = ACTIVITY_ICONS[item.type] ?? Calendar
              return (
                <div key={`${item.source}-${item.id}`} className="relative pl-14">
                  {/* Dot */}
                  <div className="absolute left-4 top-4 h-5 w-5 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                    <Icon className="h-3 w-3 text-primary" />
                  </div>

                  <Card className="hover:shadow-sm transition-shadow">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {ACTIVITY_LABELS[item.type] ?? item.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(item.date + 'T12:00:00'), "dd 'de' MMM, yyyy", { locale: ptBR })}
                            </span>
                          </div>
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                            {item.description}
                          </p>
                          <div className="flex gap-3 mt-2">
                            {item.location && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {item.location}
                              </span>
                            )}
                            {item.weather && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <CloudSun className="h-3 w-3" /> {item.weather}
                              </span>
                            )}
                          </div>
                        </div>
                        {item.link && (
                          <Button asChild variant="ghost" size="sm">
                            <Link to={item.link}>Ver</Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
