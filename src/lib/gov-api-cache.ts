import { supabase } from '@/lib/supabase'

interface CacheEntry {
  id: string
  api_source: string
  endpoint: string
  response: Record<string, unknown>
  cached_at: string
  ttl_hours: number
}

/**
 * Get cached API response, returns null if expired or missing
 */
export async function getCachedResponse(apiSource: string, endpoint: string): Promise<any | null> {
  const { data } = await (supabase.from('gov_api_cache') as any)
    .select('*')
    .eq('api_source', apiSource)
    .eq('endpoint', endpoint)
    .single()

  if (!data) return null

  const entry = data as CacheEntry
  const cachedAt = new Date(entry.cached_at).getTime()
  const ttlMs = entry.ttl_hours * 60 * 60 * 1000
  if (Date.now() - cachedAt > ttlMs) return null

  return entry.response
}

/**
 * Store API response in cache
 */
export async function setCachedResponse(
  apiSource: string,
  endpoint: string,
  response: Record<string, unknown>,
  ttlHours = 24
): Promise<void> {
  await (supabase.from('gov_api_cache') as any)
    .upsert({
      api_source: apiSource,
      endpoint,
      response,
      cached_at: new Date().toISOString(),
      ttl_hours: ttlHours,
    } as any, { onConflict: 'api_source,endpoint' })
}
