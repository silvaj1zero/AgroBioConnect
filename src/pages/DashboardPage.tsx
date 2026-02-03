import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { useAnalytics } from '@/hooks/useCompliance'
import { useApiStatuses } from '@/hooks/useGovApis'
import { WeatherWidget } from '@/components/WeatherWidget'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Leaf, MapPin, QrCode, FileCheck, FlaskConical, Droplets, Wifi, WifiOff } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function DashboardPage() {
  const { profile } = useAuth()
  const { data: analytics } = useAnalytics()
  const { data: apiStatuses = [] } = useApiStatuses()

  const stats = [
    { label: 'Talhões', value: analytics?.totalFields?.toString() ?? '—', icon: MapPin, color: 'text-blue-600' },
    { label: 'Lotes', value: analytics?.totalBatches?.toString() ?? '—', icon: FlaskConical, color: 'text-green-600' },
    { label: 'Aplicações', value: analytics?.totalApplications?.toString() ?? '—', icon: Droplets, color: 'text-purple-600' },
    { label: 'Conformidade', value: analytics ? `${analytics.complianceRate.toFixed(0)}%` : '—', icon: FileCheck, color: 'text-amber-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Olá, {profile?.full_name?.split(' ')[0] ?? 'Produtor'}
        </h1>
        <p className="text-muted-foreground">
          Bem-vindo ao AgroBio. Gerencie sua biofábrica e talhões.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Weather */}
        <WeatherWidget />

        {/* API Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Status das APIs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {apiStatuses.length === 0 ? (
              <p className="text-sm text-muted-foreground">Carregando status...</p>
            ) : (
              apiStatuses.map((api) => (
                <div key={api.source} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {api.available ? (
                      <Wifi className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span>{api.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {api.lastSync
                      ? formatDistanceToNow(new Date(api.lastSync), { addSuffix: true, locale: ptBR })
                      : 'Sem dados'}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/biofactory/new">Registrar Biofábrica</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/fields/activity/new">Nova Atividade</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/batches">Novo Lote</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/scanner">Scanner QR</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/compliance">Relatórios</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
