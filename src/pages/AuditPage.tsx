import { useState } from 'react'
import { useAuditLogs } from '@/hooks/useAuditLogs'
import { useAuth } from '@/lib/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Shield, Filter, Download } from 'lucide-react'
import { format } from 'date-fns'
import { exportCSV } from '@/lib/pdf-reports'

const ACTION_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  create: { label: 'Criação', variant: 'default' },
  update: { label: 'Atualização', variant: 'secondary' },
  delete: { label: 'Exclusão', variant: 'destructive' },
  read: { label: 'Leitura', variant: 'outline' },
  approve: { label: 'Aprovação', variant: 'default' },
  reject: { label: 'Rejeição', variant: 'destructive' },
  export: { label: 'Exportação', variant: 'secondary' },
}

const RESOURCE_TYPES = [
  'production_batches',
  'quality_reports',
  'field_notebook_entries',
  'biofactories',
  'compliance_records',
  'organizations',
  'products',
]

export function AuditPage() {
  const { role } = useAuth()
  const [actionFilter, setActionFilter] = useState('')
  const [resourceFilter, setResourceFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data: logs = [], isLoading } = useAuditLogs({
    action: actionFilter || undefined,
    resource_type: resourceFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  })

  const isAuditor = role === 'auditor' || role === 'admin'

  const handleExportCSV = () => {
    const headers = ['Data/Hora', 'Ação', 'Recurso', 'ID Recurso', 'Usuário', 'Descrição']
    const rows = logs.map((l) => [
      format(new Date(l.created_at), 'dd/MM/yyyy HH:mm'),
      l.action,
      l.resource_type,
      l.resource_id ?? '',
      l.user_email ?? '',
      l.description ?? '',
    ])
    exportCSV(headers, rows, `audit-logs-${new Date().toISOString().split('T')[0]}.csv`)
  }

  if (!isAuditor) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Shield className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Acesso Restrito</p>
          <p className="text-sm text-muted-foreground mt-1">
            Somente auditores e administradores podem acessar os logs de auditoria.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Logs de Auditoria</h1>
          <p className="text-muted-foreground">Registro imutável de todas as operações do sistema</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExportCSV} disabled={logs.length === 0}>
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={actionFilter || 'all'} onValueChange={(v) => setActionFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {Object.entries(ACTION_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={resourceFilter || 'all'} onValueChange={(v) => setResourceFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Recurso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {RESOURCE_TYPES.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e: any) => setDateFrom(e.target.value)}
          className="w-full sm:w-[160px]"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e: any) => setDateTo(e.target.value)}
          className="w-full sm:w-[160px]"
        />
        {(actionFilter || resourceFilter || dateFrom || dateTo) && (
          <Button variant="ghost" size="sm" onClick={() => {
            setActionFilter(''); setResourceFilter(''); setDateFrom(''); setDateTo('')
          }}>
            Limpar
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <Card className="animate-pulse"><CardContent className="h-48" /></Card>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhum registro encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">Ajuste os filtros ou aguarde novas operações</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => {
                const act = ACTION_LABELS[log.action] ?? { label: log.action, variant: 'secondary' as const }
                return (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={act.variant} className="text-xs">{act.label}</Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{log.resource_type}</TableCell>
                    <TableCell className="text-xs">{log.user_email ?? '—'}</TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">{log.description ?? '—'}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
