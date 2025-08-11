"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { createClient } from "@/lib/supabase"
import { Loader2, Globe, MapPin } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LocationStatsProps {
  groupId?: string
  startDate?: string
  endDate?: string
}

interface CountryStat {
  country: string
  clicks: number
  percentage: number
}

interface LocationStat {
  country: string
  city: string
  clicks: number
  percentage: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

export function LocationStatsChart({ groupId, startDate, endDate }: LocationStatsProps) {
  const [countryData, setCountryData] = useState<CountryStat[]>([])
  const [locationData, setLocationData] = useState<LocationStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLocationStats() {
      try {
        setLoading(true)
        setError(null)
        
        const supabase = createClient()
        
        // Buscar estatísticas por país
        const { data: countryStats, error: countryError } = await supabase.rpc('get_country_stats_v3', {
          p_group_id: groupId || null,
          p_start_date: startDate || null,
          p_end_date: endDate || null
        })

        if (countryError) {
          console.error('Erro ao buscar estatísticas de país:', countryError)
          setError('Erro ao carregar dados de país')
          return
        }

        // Buscar estatísticas por localização (país + cidade)
        const { data: locationStats, error: locationError } = await supabase.rpc('get_location_stats', {
          p_group_id: groupId || null,
          p_start_date: startDate || null,
          p_end_date: endDate || null
        })

        if (locationError) {
          console.error('Erro ao buscar estatísticas de localização:', locationError)
          setError('Erro ao carregar dados de localização')
          return
        }

        setCountryData(countryStats || [])
        setLocationData(locationStats || [])
      } catch (err) {
        console.error('Erro:', err)
        setError('Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    fetchLocationStats()
  }, [groupId, startDate, endDate])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Estatísticas de Localização
          </CardTitle>
          <CardDescription>Distribuição geográfica de cliques</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Estatísticas de Localização
          </CardTitle>
          <CardDescription>Distribuição geográfica de cliques</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasData = (countryData && countryData.length > 0) || (locationData && locationData.length > 0)

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Estatísticas de Localização
          </CardTitle>
          <CardDescription>Distribuição geográfica de cliques</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Nenhum dado de localização disponível
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Estatísticas de Localização
        </CardTitle>
        <CardDescription>Distribuição geográfica de cliques</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="countries" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="countries" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Países
            </TabsTrigger>
            <TabsTrigger value="cities" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Cidades
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="countries" className="space-y-4">
            {countryData && countryData.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Distribuição por País</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={countryData.slice(0, 8)}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="clicks"
                          label={({ country, percentage }) => `${country || 'Desconhecido'}: ${percentage.toFixed(1)}%`}
                        >
                          {countryData.slice(0, 8).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [`${value} cliques`, 'Cliques']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Top Países</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {countryData.slice(0, 10).map((item, index) => (
                        <div key={item.country || 'unknown'} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {index + 1}. {item.country || 'Desconhecido'}
                          </span>
                          <span className="font-medium">
                            {item.clicks} ({item.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={countryData.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="country" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value} cliques`, 'Cliques']}
                      labelFormatter={(label: string) => `País: ${label || 'Desconhecido'}`}
                    />
                    <Bar 
                      dataKey="clicks" 
                      fill="#8884d8" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Nenhum dado de país encontrado
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="cities" className="space-y-4">
            {locationData && locationData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={locationData.slice(0, 15)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey={(item) => `${item.city || 'N/A'}, ${item.country || 'N/A'}`}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      fontSize={10}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value} cliques`, 'Cliques']}
                      labelFormatter={(label: string, payload: any) => {
                        if (payload && payload[0] && payload[0].payload) {
                          const data = payload[0].payload
                          return (
                            <div>
                              <div>Cidade: {data.city || 'Desconhecida'}</div>
                              <div>País: {data.country || 'Desconhecido'}</div>
                            </div>
                          )
                        }
                        return label
                      }}
                    />
                    <Bar 
                      dataKey="clicks" 
                      fill="#82ca9d" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Top Cidades:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {locationData.slice(0, 15).map((item, index) => (
                        <div key={`${item.city}-${item.country}-${index}`} className="text-xs border-l-2 border-muted pl-2">
                          <div className="font-medium">
                            {index + 1}. {item.city || 'Desconhecida'}
                          </div>
                          <div className="text-muted-foreground">
                            {item.country || 'País desconhecido'}
                          </div>
                          <div className="text-muted-foreground">
                            {item.clicks} cliques ({item.percentage.toFixed(1)}%)
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Nenhum dado de cidade encontrado
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}