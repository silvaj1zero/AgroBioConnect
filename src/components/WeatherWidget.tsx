import { useState, useEffect } from 'react'
import { useCurrentWeather, useWeatherForecast } from '@/hooks/useGovApis'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CloudSun, MapPin, Thermometer, Droplets, Wind } from 'lucide-react'

export function WeatherWidget() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => {} // silent fail
      )
    }
  }, [])

  const { data: weather } = useCurrentWeather(coords?.lat, coords?.lon)
  const { data: forecast = [] } = useWeatherForecast(coords?.lat, coords?.lon)

  if (!coords) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <CloudSun className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Ative a geolocalização para ver o clima local
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => {
              navigator.geolocation?.getCurrentPosition(
                (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                () => {}
              )
            }}
          >
            <MapPin className="h-3 w-3 mr-1" /> Ativar GPS
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!weather) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <CloudSun className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Dados climáticos indisponíveis. Configure VITE_OPENWEATHER_API_KEY.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <CloudSun className="h-4 w-4" /> Clima Local
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current */}
        <div className="flex items-center gap-4">
          {weather.icon && (
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt={weather.description}
              className="h-12 w-12"
            />
          )}
          <div>
            <p className="text-2xl font-bold">{weather.temp.toFixed(0)}°C</p>
            <p className="text-sm text-muted-foreground capitalize">{weather.description}</p>
          </div>
          <div className="ml-auto text-right text-xs text-muted-foreground space-y-1">
            <p className="flex items-center gap-1 justify-end">
              <Thermometer className="h-3 w-3" /> Sensação {weather.feels_like.toFixed(0)}°C
            </p>
            <p className="flex items-center gap-1 justify-end">
              <Droplets className="h-3 w-3" /> {weather.humidity}%
            </p>
            <p className="flex items-center gap-1 justify-end">
              <Wind className="h-3 w-3" /> {weather.wind_speed.toFixed(1)} m/s
            </p>
          </div>
        </div>

        {/* Forecast */}
        {forecast.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pt-2">
            {forecast.slice(0, 5).map((day) => (
              <div key={day.date} className="flex-shrink-0 text-center px-2 py-1 rounded bg-muted/50 min-w-[60px]">
                <p className="text-[10px] text-muted-foreground">
                  {new Date(day.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })}
                </p>
                {day.icon && (
                  <img
                    src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                    alt={day.description}
                    className="h-8 w-8 mx-auto"
                  />
                )}
                <p className="text-xs font-medium">{day.temp_max.toFixed(0)}°</p>
                <p className="text-[10px] text-muted-foreground">{day.temp_min.toFixed(0)}°</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
