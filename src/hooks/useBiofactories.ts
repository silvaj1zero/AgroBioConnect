import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import type { Biofactory, BiofactoryType, Organization } from '@/types/database'

export function useBiofactories() {
  const { profile } = useAuth()
  return useQuery({
    queryKey: ['biofactories', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return []
      const { data, error } = await supabase
        .from('biofactories')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as Biofactory[]
    },
    enabled: !!profile?.organization_id,
  })
}

export function useBiofactory(id: string | undefined) {
  return useQuery({
    queryKey: ['biofactory', id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase
        .from('biofactories')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as unknown as Biofactory
    },
    enabled: !!id,
  })
}

interface CreateBiofactoryInput {
  organization_id: string
  name: string
  biofactory_type: BiofactoryType
  address_city: string
  address_state: string
  address_street?: string
  address_number?: string
  address_neighborhood?: string
  address_postal_code?: string
  latitude?: number
  longitude?: number
  production_capacity_liters?: number
  production_capacity_kg?: number
  infrastructure_description?: string
  mapa_registration?: string
  environmental_license?: string
}

export function useCreateBiofactory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateBiofactoryInput) => {
      const { data, error } = await supabase
        .from('biofactories')
        .insert(input as any)
        .select()
        .single()
      if (error) throw error
      return data as unknown as Biofactory
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['biofactories'] })
    },
  })
}

export function useCreateOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Partial<Organization>) => {
      const { data, error } = await supabase
        .from('organizations')
        .insert(input as any)
        .select()
        .single()
      if (error) throw error
      return data as unknown as Organization
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organizations'] })
    },
  })
}

export function useUserOrganization() {
  const { profile } = useAuth()
  return useQuery({
    queryKey: ['organization', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single()
      if (error) throw error
      return data as unknown as Organization
    },
    enabled: !!profile?.organization_id,
  })
}
