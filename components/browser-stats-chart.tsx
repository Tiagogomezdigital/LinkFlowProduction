"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { createClient } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

interface BrowserStatsProps {
  groupId?: string
  startDate?: string
  endDate?: string
}

interface BrowserStat {
  browser: string
  clicks: number
  percentage: number
}

export function BrowserStatsChart({ groupId, startDate, endDate }: BrowserStatsProps) {
  const [data, setData] = useState<BrowserStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBrowserStats() {
      try {
        setLoading(true)
        setError(null)
        
        const supabase = createClient()
        
        const { data: browserStats, error } = await supabase.rpc('get_browser_stats', {
          p_group_id: groupId || null,
          p_start_date: startDate || null,
          p_end_date: endDate || null
        })

        if (error) {
          console.error('Erro ao buscar estatísticas de navegador:', error)
          setError('Erro ao carregar dados de navegador')
          return
        }

        setData(browserStats || [])
      } catch (err) {
        console.error('Erro:', err)
        setError('Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    fetchBrowserStats()
  }, [groupId, startDate, endDate])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas por Navegador</CardTitle>
          <CardDescription>Distribuição de cliques por navegador</CardDescription>
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
          <CardTitle>Estatísticas por Navegador</CardTitle>
          <CardDescription>Distribuição de cliques por navegador</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas por Navegador</CardTitle>
          <CardDescription>Distribuição de cliques por navegador</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas por Navegador</CardTitle>
        <CardDescription>
          Distribuição de {data.reduce((sum, item) => sum + item.clicks, 0)} cliques por navegador
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="browser" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `${value} cliques`,
                'Cliques'
              ]}
              labelFormatter={(label: string) => `Navegador: ${label}`}
            />
            <Bar 
              dataKey="clicks" 
              fill="#8884d8" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Top Navegadores:</h4>
          {data.slice(0, 5).map((item, index) => (
            <div key={item.browser} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {index + 1}. {item.browser || 'Desconhecido'}
              </span>
              <span className="font-medium">
                {item.clicks} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}