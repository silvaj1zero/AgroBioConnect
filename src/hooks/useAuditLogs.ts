import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { AuditLog } from '@/types/database'

interface AuditFilters {
  action?: string
  resource_type?: string
  organization_id?: string
  dateFrom?: string
  dateTo?: string
}

export function useAuditLogs(filters?: AuditFilters) {
  return useQuery<AuditLog[]>({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      let q = (supabase.from('audit_logs') as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)

      if (filters?.action) q = q.eq('action', filters.action)
      if (filters?.resource_type) q = q.eq('resource_type', filters.resource_type)
      if (filters?.organization_id) q = q.eq('organization_id', filters.organization_id)
      if (filters?.dateFrom) q = q.gte('created_at', filters.dateFrom)
      if (filters?.dateTo) q = q.lte('created_at', filters.dateTo + 'T23:59:59')

      const { data, error } = await q
      if (error) throw error
      return data ?? []
    },
  })
}
