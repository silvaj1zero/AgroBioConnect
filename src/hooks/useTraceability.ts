import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ProductionBatch, QualityReport, Biofactory, Product } from '@/types/database'

export interface TraceabilityData {
  batch: ProductionBatch & {
    biofactory?: Biofactory
    product?: Product
  }
  reports: QualityReport[]
  activities: Array<{
    id: string
    date: string
    type: string
    description: string
    field_name?: string
  }>
}

export function useTraceabilityByBatch(batchId: string | undefined) {
  return useQuery<TraceabilityData | null>({
    queryKey: ['traceability', batchId],
    enabled: !!batchId,
    queryFn: async () => {
      if (!batchId) return null

      // Fetch batch
      const { data: batch, error: batchErr } = await (supabase.from('production_batches') as any)
        .select('*')
        .eq('id', batchId)
        .single()
      if (batchErr || !batch) return null

      // Fetch biofactory
      const { data: biofactory } = await (supabase.from('biofactories') as any)
        .select('*')
        .eq('id', batch.biofactory_id)
        .single()

      // Fetch product if linked
      let product = null
      if (batch.product_id) {
        const { data: p } = await (supabase.from('products') as any)
          .select('*')
          .eq('id', batch.product_id)
          .single()
        product = p
      }

      // Fetch quality reports
      const { data: reports = [] } = await (supabase.from('quality_reports') as any)
        .select('*')
        .eq('batch_id', batchId)
        .order('report_date', { ascending: false })

      // Fetch field activities linked to this batch
      const { data: activities = [] } = await (supabase.from('field_notebook_entries') as any)
        .select('id, entry_date, activity_type, description, field_name')
        .eq('batch_id', batchId)
        .order('entry_date', { ascending: false })

      return {
        batch: { ...batch, biofactory, product },
        reports: reports ?? [],
        activities: (activities ?? []).map((a: any) => ({
          id: a.id,
          date: a.entry_date,
          type: a.activity_type,
          description: a.description,
          field_name: a.field_name,
        })),
      }
    },
  })
}

// Lookup batch by batch_number (for QR scan / public page)
export function useTraceabilityByNumber(batchNumber: string | undefined) {
  return useQuery<TraceabilityData | null>({
    queryKey: ['traceability-number', batchNumber],
    enabled: !!batchNumber,
    queryFn: async () => {
      if (!batchNumber) return null

      const { data: batch } = await (supabase.from('production_batches') as any)
        .select('*')
        .eq('batch_number', batchNumber)
        .single()
      if (!batch) return null

      const { data: biofactory } = await (supabase.from('biofactories') as any)
        .select('*')
        .eq('id', batch.biofactory_id)
        .single()

      let product = null
      if (batch.product_id) {
        const { data: p } = await (supabase.from('products') as any)
          .select('*')
          .eq('id', batch.product_id)
          .single()
        product = p
      }

      const { data: reports = [] } = await (supabase.from('quality_reports') as any)
        .select('*')
        .eq('batch_id', batch.id)
        .order('report_date', { ascending: false })

      const { data: activities = [] } = await (supabase.from('field_notebook_entries') as any)
        .select('id, entry_date, activity_type, description, field_name')
        .eq('batch_id', batch.id)
        .order('entry_date', { ascending: false })

      return {
        batch: { ...batch, biofactory, product },
        reports: reports ?? [],
        activities: (activities ?? []).map((a: any) => ({
          id: a.id,
          date: a.entry_date,
          type: a.activity_type,
          description: a.description,
          field_name: a.field_name,
        })),
      }
    },
  })
}
