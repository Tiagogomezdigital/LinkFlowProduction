"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { createClient } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

interface OSStatsProps {
  groupId?: string
  startDate?: string
  endDate?: string
}

interface OSStat {
  os: string
  clicks: number
  percentage: number
}

export function OSStatsChart({ groupId, startDate, endDate }: OSStatsProps) {
  const [data, setData] = useState<OSStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOSStats() {
      try {
        setLoading(true)
        setError(null)
        
        const supabase = createClient()
        
        const { data: osStats, error } = await supabase.rpc('get_os_stats', {
          p_group_id: groupId || null,
          p_start_date: startDate || null,
          p_end_date: endDate || null
        })

        if (error) {
          console.error('Erro ao buscar estatísticas de OS:', error)
          setError('Erro ao carregar dados de sistema operacional')
          return
        }

        setData(osStats || [])
      } catch (err) {
        console.error('Erro:', err)
        setError('Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    fetchOSStats()
  }, [groupId, startDate, endDate])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas por Sistema Operacional</CardTitle>
          <CardDescription>Distribuição de cliques por sistema operacional</CardDescription>
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
          <CardTitle>Estatísticas por Sistema Operacional</CardTitle>
          <CardDescription>Distribuição de cliques por sistema operacional</CardDescription>
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
          <CardTitle>Estatísticas por Sistema Operacional</CardTitle>
          <CardDescription>Distribuição de cliques por sistema operacional</CardDescription>
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
        <CardTitle>Estatísticas por Sistema Operacional</CardTitle>
        <CardDescription>
          Distribuição de {data.reduce((sum, item) => sum + item.clicks, 0)} cliques por sistema operacional
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="os" 
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
              labelFormatter={(label: string) => `Sistema: ${label}`}
            />
            <Bar 
              dataKey="clicks" 
              fill="#82ca9d" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Top Sistemas Operacionais:</h4>
          {data.slice(0, 5).map((item, index) => (
            <div key={item.os} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {index + 1}. {item.os || 'Desconhecido'}
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