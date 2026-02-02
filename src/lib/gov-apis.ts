import { getCachedResponse, setCachedResponse } from './gov-api-cache'
import { supabase } from './supabase'

// ---- Agrofit API Client ----
// MAPA Agrofit: http://agrofit.agricultura.gov.br
// Note: real endpoints may differ; this uses a pattern that can be swapped for Edge Functions

const AGROFIT_BASE = 'https://agrofit.agricultura.gov.br/agrofit_cons'

export interface AgrofitProduct {
  id: string
  nome_comercial: string
  ingrediente_ativo: string
  classe: string
  grupo_quimico: string
  formulacao: string
  titular_registro: string
  numero_registro: string
}

export async function searchAgrofit(query: string): Promise<AgrofitProduct[]> {
  const cacheKey = `search:${query.toLowerCase().trim()}`
  const cached = await getCachedResponse('agrofit', cacheKey)
  if (cached) return cached as AgrofitProduct[]

  try {
    // Attempt real API call (likely to fail due to CORS / availability)
    const res = await fetch(`${AGROFIT_BASE}/principal_agrofit_cons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `nome_comercial=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) throw new Error(`Agrofit API ${res.status}`)
    const data = await res.json()
    await setCachedResponse('agrofit', cacheKey, data, 24)
    return data
  } catch {
    // Fallback: return empty with status indicator
    return []
  }
}

// ---- Bioinsumos API Client ----
// Plataforma de Bioinsumos do MAPA

const BIOINSUMOS_BASE = 'https://sistemasweb.agricultura.gov.br/pages/bioinsumos'

export interface BioinsumoEntry {
  id: string
  nome: string
  tipo: string
  organismo: string
  registro: string
  situacao: string
}

export async function searchBioinsumos(query: string): Promise<BioinsumoEntry[]> {
  const cacheKey = `search:${query.toLowerCase().trim()}`
  const cached = await getCachedResponse('bioinsumos', cacheKey)
  if (cached) return cached as BioinsumoEntry[]

  try {
    const res = await fetch(`${BIOINSUMOS_BASE}/api/consulta?q=${encodeURIComponent(query)}`, {
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) throw new Error(`Bioinsumos API ${res.status}`)
    const data = await res.json()
    await setCachedResponse('bioinsumos', cacheKey, data, 24)
    return data
  } catch {
    return []
  }
}

// ---- Weather API Client (OpenWeather) ----

const OW_BASE = 'https://api.openweathermap.org/data/2.5'
const OW_KEY = typeof import.meta !== 'undefined'
  ? (import.meta as any).env?.VITE_OPENWEATHER_API_KEY ?? ''
  : ''

export interface WeatherData {
  temp: number
  humidity: number
  description: string
  icon: string
  wind_speed: number
  feels_like: number
}

export interface WeatherForecastDay {
  date: string
  temp_min: number
  temp_max: number
  description: string
  icon: string
  humidity: number
  pop: number // probability of precipitation
}

export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherData | null> {
  if (!OW_KEY) return null

  const cacheKey = `current:${lat.toFixed(2)},${lon.toFixed(2)}`
  const cached = await getCachedResponse('openweather', cacheKey)
  if (cached) return cached as WeatherData

  try {
    const res = await fetch(
      `${OW_BASE}/weather?lat=${lat}&lon=${lon}&appid=${OW_KEY}&units=metric&lang=pt_br`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (!res.ok) throw new Error(`OpenWeather ${res.status}`)
    const json = await res.json()
    const data: WeatherData = {
      temp: json.main.temp,
      humidity: json.main.humidity,
      description: json.weather[0]?.description ?? '',
      icon: json.weather[0]?.icon ?? '',
      wind_speed: json.wind?.speed ?? 0,
      feels_like: json.main.feels_like,
    }
    await setCachedResponse('openweather', cacheKey, data as any, 1) // 1h TTL
    return data
  } catch {
    return null
  }
}

export async function getWeatherForecast(lat: number, lon: number): Promise<WeatherForecastDay[]> {
  if (!OW_KEY) return []

  const cacheKey = `forecast:${lat.toFixed(2)},${lon.toFixed(2)}`
  const cached = await getCachedResponse('openweather', cacheKey)
  if (cached) return cached as WeatherForecastDay[]

  try {
    const res = await fetch(
      `${OW_BASE}/forecast?lat=${lat}&lon=${lon}&appid=${OW_KEY}&units=metric&lang=pt_br`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (!res.ok) throw new Error(`OpenWeather ${res.status}`)
    const json = await res.json()

    // Group by day (API returns 3h intervals)
    const dayMap = new Map<string, any[]>()
    for (const item of json.list) {
      const date = item.dt_txt.split(' ')[0]
      if (!dayMap.has(date)) dayMap.set(date, [])
      dayMap.get(date)!.push(item)
    }

    const forecast: WeatherForecastDay[] = []
    for (const [date, items] of dayMap) {
      const temps = items.map((i: any) => i.main.temp)
      const midday = items[Math.floor(items.length / 2)]
      forecast.push({
        date,
        temp_min: Math.min(...temps),
        temp_max: Math.max(...temps),
        description: midday.weather[0]?.description ?? '',
        icon: midday.weather[0]?.icon ?? '',
        humidity: midday.main.humidity,
        pop: Math.max(...items.map((i: any) => i.pop ?? 0)),
      })
    }

    await setCachedResponse('openweather', cacheKey, forecast as any, 6) // 6h TTL
    return forecast
  } catch {
    return []
  }
}

// ---- API Status ----

export interface GovApiStatus {
  source: string
  label: string
  lastSync: string | null
  available: boolean
}

export async function getApiStatuses(): Promise<GovApiStatus[]> {
  const sources = ['agrofit', 'bioinsumos', 'openweather']
  const statuses: GovApiStatus[] = []

  for (const source of sources) {
    const { data } = await (supabase.from('gov_api_cache') as any)
      .select('cached_at')
      .eq('api_source', source)
      .order('cached_at', { ascending: false })
      .limit(1)

    const lastSync = data?.[0]?.cached_at ?? null
    statuses.push({
      source,
      label: source === 'agrofit' ? 'Agrofit (MAPA)' :
             source === 'bioinsumos' ? 'Bioinsumos (MAPA)' :
             'OpenWeather',
      lastSync,
      available: lastSync != null,
    })
  }

  return statuses
}
