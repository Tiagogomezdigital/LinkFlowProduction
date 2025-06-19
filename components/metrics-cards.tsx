"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDashboardStats } from "@/lib/api/stats"
import { Skeleton } from "@/components/ui/skeleton"

interface MetricsCardsProps {
  dateFrom: Date
  dateTo: Date
  groupIds?: string[]
}

export function MetricsCards({ dateFrom, dateTo, groupIds }: MetricsCardsProps) {
  const [stats, setStats] = useState<{
    totalClicks: number
    uniqueVisitors: number
    averageClicksPerDay: number
    topGroup: { name: string; clicks: number } | null
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getDashboardStats(dateFrom, dateTo, groupIds)
        setStats(data)
      } catch (err) {
        console.error("Erro ao carregar estatísticas:", err)
        setError("Erro ao carregar estatísticas")
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [dateFrom, dateTo, groupIds])

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{error}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Total de Cliques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats?.totalClicks.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Visitantes Únicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats?.uniqueVisitors.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Média de Cliques/Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats?.averageClicksPerDay.toFixed(1)}</div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-400">Grupo Mais Acessado</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.topGroup ? (
            <div>
              <div className="text-2xl font-bold text-white">{stats.topGroup.name}</div>
              <p className="text-xs text-slate-400">{stats.topGroup.clicks.toLocaleString()} cliques</p>
            </div>
          ) : (
            <div className="text-2xl font-bold text-slate-400">Nenhum</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
