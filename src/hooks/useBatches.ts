import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import type { ProductionBatch, QualityReport } from '@/types/database'

export function useBatches(biofactoryId?: string) {
  return useQuery({
    queryKey: ['batches', biofactoryId],
    queryFn: async () => {
      if (!biofactoryId) return []
      const { data, error } = await (supabase.from('production_batches') as any)
        .select('*')
        .eq('biofactory_id', biofactoryId)
        .order('production_date', { ascending: false })
      if (error) throw error
      return (data ?? []) as ProductionBatch[]
    },
    enabled: !!biofactoryId,
  })
}

export function useAllBatches() {
  const { profile } = useAuth()
  return useQuery({
    queryKey: ['all-batches', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return []
      // Get batches through biofactories belonging to org
      const { data: biofactories } = await (supabase.from('biofactories') as any)
        .select('id')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)

      if (!biofactories?.length) return []

      const ids = biofactories.map((b: any) => b.id)
      const { data, error } = await (supabase.from('production_batches') as any)
        .select('*')
        .in('biofactory_id', ids)
        .order('production_date', { ascending: false })
      if (error) throw error
      return (data ?? []) as ProductionBatch[]
    },
    enabled: !!profile?.organization_id,
  })
}

export function useBatch(id: string | undefined) {
  return useQuery({
    queryKey: ['batch', id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await (supabase.from('production_batches') as any)
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as ProductionBatch
    },
    enabled: !!id,
  })
}

interface CreateBatchInput {
  biofactory_id: string
  product_id?: string
  batch_number: string
  production_date: string
  expiry_date?: string
  volume_liters?: number
  weight_kg?: number
  initial_ph?: number
  final_ph?: number
  fermentation_temp_celsius?: number
  fermentation_duration_hours?: number
  fermentation_start_date?: string
  fermentation_end_date?: string
  organism_concentration?: string
  purity_percentage?: number
  notes?: string
}

export function useCreateBatch() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (input: CreateBatchInput) => {
      const { data, error } = await (supabase.from('production_batches') as any)
        .insert({ ...input, status: 'in_production', created_by: user?.id })
        .select()
        .single()
      if (error) throw error
      return data as ProductionBatch
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['batches'] })
      qc.invalidateQueries({ queryKey: ['all-batches'] })
    },
  })
}

export function useUpdateBatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProductionBatch> & { id: string }) => {
      const { data, error } = await (supabase.from('production_batches') as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as ProductionBatch
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['batches'] })
      qc.invalidateQueries({ queryKey: ['all-batches'] })
    },
  })
}

// Quality Reports
export function useQualityReports(batchId?: string) {
  return useQuery({
    queryKey: ['quality-reports', batchId],
    queryFn: async () => {
      if (!batchId) return []
      const { data, error } = await (supabase.from('quality_reports') as any)
        .select('*')
        .eq('batch_id', batchId)
        .order('report_date', { ascending: false })
      if (error) throw error
      return (data ?? []) as QualityReport[]
    },
    enabled: !!batchId,
  })
}

interface CreateQualityReportInput {
  batch_id: string
  report_number: string
  report_date: string
  analysis_date?: string
  lab_organization_id?: string
  ufc_count?: string
  ufc_ml?: number
  ufc_g?: number
  viability_percentage?: number
  purity_percentage?: number
  salmonella_present?: boolean
  ecoli_present?: boolean
  other_contaminants?: string
  ph_value?: number
  moisture_percentage?: number
  density?: number
  report_document_url?: string
  notes?: string
}

export function useCreateQualityReport() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (input: CreateQualityReportInput) => {
      const { data, error } = await (supabase.from('quality_reports') as any)
        .insert({ ...input, created_by: user?.id })
        .select()
        .single()
      if (error) throw error
      return data as QualityReport
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['quality-reports', vars.batch_id] })
    },
  })
}
