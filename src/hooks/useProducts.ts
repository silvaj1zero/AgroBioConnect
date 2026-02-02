import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Product, ProductCategory, Crop, ActiveIngredient } from '@/types/database'

interface ProductFilters {
  search?: string
  category?: ProductCategory | ''
  cropId?: string
  organicOnly?: boolean
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,commercial_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.organicOnly) {
        query = query.eq('organic_certified', true)
      }

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as unknown as Product[]
    },
  })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as unknown as Product
    },
    enabled: !!id,
  })
}

export function useProductIngredients(productId: string | undefined) {
  return useQuery({
    queryKey: ['product-ingredients', productId],
    queryFn: async () => {
      if (!productId) return []
      const { data, error } = await supabase
        .from('product_ingredients')
        .select('*, active_ingredients(*)')
        .eq('product_id', productId)
      if (error) throw error
      return data ?? []
    },
    enabled: !!productId,
  })
}

export function useProductCrops(productId: string | undefined) {
  return useQuery({
    queryKey: ['product-crops', productId],
    queryFn: async () => {
      if (!productId) return []
      const { data, error } = await supabase
        .from('product_crops')
        .select('*, crops(*)')
        .eq('product_id', productId)
      if (error) throw error
      return data ?? []
    },
    enabled: !!productId,
  })
}

export function useCrops() {
  return useQuery({
    queryKey: ['crops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crops')
        .select('*')
        .order('name')
      if (error) throw error
      return (data ?? []) as unknown as Crop[]
    },
  })
}

export function useActiveIngredients() {
  return useQuery({
    queryKey: ['active-ingredients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('active_ingredients')
        .select('*')
        .order('name')
      if (error) throw error
      return (data ?? []) as unknown as ActiveIngredient[]
    },
  })
}
