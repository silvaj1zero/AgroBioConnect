import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ComplianceRecord } from '@/types/database'

export function useComplianceRecords(biofactoryId?: string) {
  return useQuery<ComplianceRecord[]>({
    queryKey: ['compliance-records', biofactoryId],
    queryFn: async () => {
      let q = (supabase.from('compliance_records') as any)
        .select('*')
        .order('created_at', { ascending: false })

      if (biofactoryId) q = q.eq('biofactory_id', biofactoryId)

      const { data, error } = await q
      if (error) throw error
      return data ?? []
    },
  })
}

export function useAllComplianceRecords() {
  return useQuery<ComplianceRecord[]>({
    queryKey: ['compliance-records-all'],
    queryFn: async () => {
      const { data, error } = await (supabase.from('compliance_records') as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return data ?? []
    },
  })
}

export function useLgpdConsents() {
  return useQuery({
    queryKey: ['lgpd-consents'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const { data, error } = await (supabase.from('lgpd_consents') as any)
        .select('*')
        .eq('user_id', user.id)
        .order('granted_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useUpdateLgpdConsent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { consent_type: string; granted: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Upsert consent
      const { error } = await (supabase.from('lgpd_consents') as any)
        .upsert({
          user_id: user.id,
          consent_type: payload.consent_type,
          granted: payload.granted,
          granted_at: new Date().toISOString(),
        } as any, { onConflict: 'user_id,consent_type' })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lgpd-consents'] }),
  })
}

// Analytics aggregation
export interface AnalyticsData {
  totalFields: number
  totalHectares: number
  totalBatches: number
  totalVolumeLiters: number
  totalApplications: number
  totalQRScans: number // placeholder
  complianceRate: number
  batchStatusCounts: Record<string, number>
}

export function useAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: async () => {
      // Fields
      const { data: fields = [] } = await (supabase.from('field_notebook_entries') as any)
        .select('field_name, area_hectares')
        .eq('activity_type', 'field_registration')

      const uniqueFields = new Set((fields ?? []).map((f: any) => f.field_name).filter(Boolean))
      const totalHectares = (fields ?? []).reduce((sum: number, f: any) => sum + (f.area_hectares || 0), 0)

      // Batches
      const { data: batches = [] } = await (supabase.from('production_batches') as any)
        .select('status, volume_liters')

      const totalVolume = (batches ?? []).reduce((sum: number, b: any) => sum + (b.volume_liters || 0), 0)
      const batchStatusCounts: Record<string, number> = {}
      for (const b of (batches ?? [])) {
        batchStatusCounts[b.status] = (batchStatusCounts[b.status] || 0) + 1
      }

      // Applications
      const { count: appCount } = await (supabase.from('field_notebook_entries') as any)
        .select('id', { count: 'exact', head: true })
        .eq('activity_type', 'application')

      // Compliance
      const approvedCount = batchStatusCounts['approved'] || 0
      const totalBatchCount = (batches ?? []).length
      const complianceRate = totalBatchCount > 0 ? (approvedCount / totalBatchCount) * 100 : 0

      return {
        totalFields: uniqueFields.size,
        totalHectares,
        totalBatches: totalBatchCount,
        totalVolumeLiters: totalVolume,
        totalApplications: appCount ?? 0,
        totalQRScans: 0,
        complianceRate,
        batchStatusCounts,
      }
    },
  })
}
