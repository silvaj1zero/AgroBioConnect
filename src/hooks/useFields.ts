import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import type { FieldNotebookEntry } from '@/types/database'

// We use field_notebook_entries for field records since the schema
// has this table for all field activities including field definitions.

export interface FieldRecord {
  id: string
  organization_id: string
  field_name: string
  area_hectares: number | null
  latitude: number | null
  longitude: number | null
  crop_name?: string
  crop_id?: string
  created_at: string
}

export function useFieldEntries(filters?: { activityType?: string; fieldName?: string }) {
  const { profile } = useAuth()
  return useQuery({
    queryKey: ['field-entries', profile?.organization_id, filters],
    queryFn: async () => {
      if (!profile?.organization_id) return []
      let query = (supabase.from('field_notebook_entries') as any)
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('entry_date', { ascending: false })

      if (filters?.activityType) {
        query = query.eq('activity_type', filters.activityType)
      }
      if (filters?.fieldName) {
        query = query.eq('field_name', filters.fieldName)
      }

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as FieldNotebookEntry[]
    },
    enabled: !!profile?.organization_id,
  })
}

export function useFieldEntry(id: string | undefined) {
  return useQuery({
    queryKey: ['field-entry', id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await (supabase.from('field_notebook_entries') as any)
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as FieldNotebookEntry
    },
    enabled: !!id,
  })
}

export function useDistinctFields() {
  const { profile } = useAuth()
  return useQuery({
    queryKey: ['distinct-fields', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return []
      // Get distinct field names with their latest entry data
      const { data, error } = await (supabase.from('field_notebook_entries') as any)
        .select('field_name, area_hectares, latitude, longitude')
        .eq('organization_id', profile.organization_id)
        .not('field_name', 'is', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Deduplicate by field_name
      const seen = new Set<string>()
      const fields: Array<{ field_name: string; area_hectares: number | null; latitude: number | null; longitude: number | null }> = []
      for (const row of data ?? []) {
        if (row.field_name && !seen.has(row.field_name)) {
          seen.add(row.field_name)
          fields.push(row)
        }
      }
      return fields
    },
    enabled: !!profile?.organization_id,
  })
}

interface CreateFieldEntryInput {
  organization_id: string
  entry_date: string
  activity_type: string
  field_name?: string
  area_hectares?: number
  latitude?: number
  longitude?: number
  description: string
  weather_conditions?: string
  temperature_celsius?: number
  humidity_percentage?: number
  products_used?: Array<{ product_id: string; quantity: number; unit: string }>
  equipment_used?: string[]
  observations?: string
  photos?: Array<{ url: string; caption?: string }>
  biofactory_id?: string
  batch_id?: string
}

export function useCreateFieldEntry() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (input: CreateFieldEntryInput) => {
      const { data, error } = await (supabase.from('field_notebook_entries') as any)
        .insert({ ...input, created_by: user?.id })
        .select()
        .single()
      if (error) throw error
      return data as FieldNotebookEntry
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['field-entries'] })
      qc.invalidateQueries({ queryKey: ['distinct-fields'] })
    },
  })
}

export function useUpdateFieldEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FieldNotebookEntry> & { id: string }) => {
      const { data, error } = await (supabase.from('field_notebook_entries') as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as FieldNotebookEntry
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['field-entries'] })
    },
  })
}
