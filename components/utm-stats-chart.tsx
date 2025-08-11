"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { createClient } from "@/lib/supabase"
import { Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface UTMStatsProps {
  groupId?: string
  startDate?: string
  endDate?: string
}

interface UTMStat {
  utm_source: string
  utm_medium: string
  utm_campaign: string
  clicks: number
  percentage: number
}

interface UTMSourceStat {
  utm_source: string
  clicks: number
  percentage: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function UTMStatsChart({ groupId, startDate, endDate }: UTMStatsProps) {
  const [utmData, setUtmData] = useState<UTMStat[]>([])
  const [sourceData, setSourceData] = useState<UTMSourceStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUTMStats() {
      try {
        setLoading(true)
        setError(null)
        
        const supabase = createClient()
        
        // Buscar estatísticas UTM completas
        const { data: utmStats, error: utmError } = await supabase.rpc('get_utm_stats', {
          p_group_id: groupId || null,
          p_start_date: startDate || null,
          p_end_date: endDate || null
        })

        if (utmError) {
          console.error('Erro ao buscar estatísticas UTM:', utmError)
          setError('Erro ao carregar dados UTM')
          return
        }

        // Buscar estatísticas por fonte UTM
        const { data: sourceStats, error: sourceError } = await supabase.rpc('get_utm_source_stats_v3', {
          p_group_id: groupId || null,
          p_start_date: startDate || null,
          p_end_date: endDate || null
        })

        if (sourceError) {
          console.error('Erro ao buscar estatísticas de fonte UTM:', sourceError)
          setError('Erro ao carregar dados de fonte UTM')
          return
        }

        setUtmData(utmStats || [])
        setSourceData(sourceStats || [])
      } catch (err) {
        console.error('Erro:', err)
        setError('Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    fetchUTMStats()
  }, [groupId, startDate, endDate])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas UTM</CardTitle>
          <CardDescription>Análise de parâmetros UTM de campanhas</CardDescription>
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
          <CardTitle>Estatísticas UTM</CardTitle>
          <CardDescription>Análise de parâmetros UTM de campanhas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasData = (utmData && utmData.length > 0) || (sourceData && sourceData.length > 0)

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas UTM</CardTitle>
          <CardDescription>Análise de parâmetros UTM de campanhas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Nenhum dado UTM disponível
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas UTM</CardTitle>
        <CardDescription>Análise de parâmetros UTM de campanhas</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sources" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sources">Fontes UTM</TabsTrigger>
            <TabsTrigger value="campaigns">Campanhas Completas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sources" className="space-y-4">
            {sourceData && sourceData.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Distribuição por Fonte</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={sourceData.slice(0, 6)}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="clicks"
                          label={({ utm_source, percentage }) => `${utm_source || 'Direto'}: ${percentage.toFixed(1)}%`}
                        >
                          {sourceData.slice(0, 6).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [`${value} cliques`, 'Cliques']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Top Fontes UTM</h4>
                    <div className="space-y-2">
                      {sourceData.slice(0, 6).map((item, index) => (
                        <div key={item.utm_source || 'direct'} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {index + 1}. {item.utm_source || 'Direto'}
                          </span>
                          <span className="font-medium">
                            {item.clicks} ({item.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Nenhuma fonte UTM encontrada
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="campaigns" className="space-y-4">
            {utmData && utmData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={utmData.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey={(item) => `${item.utm_source || 'Direto'}/${item.utm_medium || 'N/A'}`}
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
                              <div>Fonte: {data.utm_source || 'Direto'}</div>
                              <div>Meio: {data.utm_medium || 'N/A'}</div>
                              <div>Campanha: {data.utm_campaign || 'N/A'}</div>
                            </div>
                          )
                        }
                        return label
                      }}
                    />
                    <Bar 
                      dataKey="clicks" 
                      fill="#ffc658" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Detalhes das Campanhas:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {utmData.slice(0, 10).map((item, index) => (
                      <div key={`${item.utm_source}-${item.utm_medium}-${item.utm_campaign}-${index}`} className="text-xs border-l-2 border-muted pl-2">
                        <div className="font-medium">
                          {index + 1}. {item.utm_source || 'Direto'} / {item.utm_medium || 'N/A'}
                        </div>
                        <div className="text-muted-foreground">
                          Campanha: {item.utm_campaign || 'N/A'}
                        </div>
                        <div className="text-muted-foreground">
                          {item.clicks} cliques ({item.percentage.toFixed(1)}%)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Nenhuma campanha UTM encontrada
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}