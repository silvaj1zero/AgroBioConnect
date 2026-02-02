import { useQuery } from '@tanstack/react-query'
import {
  searchAgrofit,
  searchBioinsumos,
  getCurrentWeather,
  getWeatherForecast,
  getApiStatuses,
  type AgrofitProduct,
  type BioinsumoEntry,
  type WeatherData,
  type WeatherForecastDay,
  type GovApiStatus,
} from '@/lib/gov-apis'

export function useAgrofitSearch(query: string) {
  return useQuery<AgrofitProduct[]>({
    queryKey: ['agrofit-search', query],
    enabled: query.length >= 3,
    queryFn: () => searchAgrofit(query),
    staleTime: 1000 * 60 * 30, // 30min
  })
}

export function useBioinsumosSearch(query: string) {
  return useQuery<BioinsumoEntry[]>({
    queryKey: ['bioinsumos-search', query],
    enabled: query.length >= 3,
    queryFn: () => searchBioinsumos(query),
    staleTime: 1000 * 60 * 30,
  })
}

export function useCurrentWeather(lat?: number, lon?: number) {
  return useQuery<WeatherData | null>({
    queryKey: ['weather-current', lat, lon],
    enabled: lat != null && lon != null,
    queryFn: () => getCurrentWeather(lat!, lon!),
    staleTime: 1000 * 60 * 30,
  })
}

export function useWeatherForecast(lat?: number, lon?: number) {
  return useQuery<WeatherForecastDay[]>({
    queryKey: ['weather-forecast', lat, lon],
    enabled: lat != null && lon != null,
    queryFn: () => getWeatherForecast(lat!, lon!),
    staleTime: 1000 * 60 * 60, // 1h
  })
}

export function useApiStatuses() {
  return useQuery<GovApiStatus[]>({
    queryKey: ['api-statuses'],
    queryFn: getApiStatuses,
    staleTime: 1000 * 60 * 5,
  })
}
