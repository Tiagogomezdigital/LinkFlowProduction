"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { supabase } from "@/lib/supabase"
import { Globe } from "lucide-react"

interface CountryStats {
  country: string
  total_clicks: number
}

interface CountryStatsChartProps {
  dateFrom?: Date
  dateTo?: Date
  groupIds?: string[]
}

export function CountryStatsChart({ dateFrom, dateTo, groupIds }: CountryStatsChartProps) {
  const [data, setData] = useState<CountryStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCountryStats() {
      try {
        setLoading(true)
        setError(null)

        const { data: countryData, error: countryError } = await supabase.rpc(
          "get_country_stats_v3",
          {
            p_start_date: dateFrom?.toISOString().split('T')[0] || null,
            p_end_date: dateTo?.toISOString().split('T')[0] || null,
            p_group_id: groupIds?.[0] || null, // A função aceita apenas um group_id
            p_limit: 10
          }
        )

        if (countryError) {
          console.error("Erro ao buscar estatísticas de país:", countryError)
          setError("Erro ao carregar dados de país")
          return
        }

        const formattedData = (countryData || []).map((item: any) => ({
          country: item.calculated_country || "Desconhecido",
          total_clicks: Number(item.calculated_total_clicks) || 0
        }))

        setData(formattedData)
      } catch (err) {
        console.error("Erro ao buscar estatísticas de país:", err)
        setError("Erro ao carregar dados")
      } finally {
        setLoading(false)
      }
    }

    fetchCountryStats()
  }, [dateFrom, dateTo, groupIds])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Cliques por País
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
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
            Cliques por País
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Cliques por País
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-500 py-8">
            Nenhum dado de país disponível para o período selecionado
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
          Cliques por País
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-700" />
            <XAxis 
              dataKey="country" 
              className="text-slate-400"
              tick={{ fontSize: 12 }}
            />
            <YAxis className="text-slate-400" tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#f1f5f9"
              }}
              formatter={(value: number) => [value, "Cliques"]}
              labelFormatter={(label: string) => `País: ${label}`}
            />
            <Bar 
              dataKey="total_clicks" 
              fill="#84cc16" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}