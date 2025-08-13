"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, MousePointer, Download, RefreshCw, Phone, Globe, Smartphone, Monitor } from "lucide-react"
import { getUltraSafeGroupAnalytics, exportUltraSafeGroupData } from "@/lib/api/ultra-safe-analytics"

interface UltraSafeGroupAnalyticsProps {
  groupId: string
}

export function UltraSafeGroupAnalytics({ groupId }: UltraSafeGroupAnalyticsProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("🔄 Carregando analytics ultra seguro...")
      const result = await getUltraSafeGroupAnalytics(groupId)

      if (result.success) {
        setData(result.data)
        console.log("✅ Dados carregados:", result.data)
      } else {
        setError(result.error || "Erro desconhecido")
      }
    } catch (err: any) {
      console.error("❌ Erro ao carregar:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const result = await exportUltraSafeGroupData(groupId)

      if (result.success) {
        // Download do arquivo
        if (typeof document !== 'undefined') {
          const blob = new Blob([JSON.stringify(result.data, null, 2)], {
            type: "application/json",
          })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = result.filename || "analytics.json"
          a.click()
          URL.revokeObjectURL(url)
        }
      }
    } catch (err: any) {
      console.error("❌ Erro na exportação:", err)
    } finally {
      setExporting(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [groupId])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-white">Carregando analytics...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-red-900/20 border-red-800">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Erro ao carregar analytics</h3>
            <p className="text-red-300 mb-4">{error}</p>
            <Button onClick={loadData} variant="outline" className="text-red-400 border-red-600">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="p-6">
          <p className="text-center text-slate-400">Nenhum dado encontrado</p>
        </CardContent>
      </Card>
    )
  }

  const { group, stats, topNumbers, clicksByHour, recentClicks } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Analytics: {group.name}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-400 border-green-600">
              {group.is_active ? "Ativo" : "Inativo"}
            </Badge>
            <span className="text-slate-400">Slug: {group.slug}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={handleExport} disabled={exporting} size="sm">
            <Download className="h-4 w-4 mr-2" />
            {exporting ? "Exportando..." : "Exportar"}
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total de Cliques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-white">{stats.total_clicks}</div>
              <MousePointer className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-xs text-slate-500 mt-1">Média: {stats.avg_clicks_per_day}/dia</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-white">{stats.clicks_today}</div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-xs text-slate-500 mt-1">Esta semana: {stats.clicks_this_week}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Números</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-white">{stats.active_numbers}</div>
              <Phone className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-xs text-slate-500 mt-1">Total: {stats.total_numbers}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">IPs Únicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-white">{stats.unique_ips}</div>
              <Globe className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-xs text-slate-500 mt-1">Visitantes únicos</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com Gráficos */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="numbers">Top Números</TabsTrigger>
          <TabsTrigger value="recent">Cliques Recentes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Cliques por Hora do Dia</CardTitle>
              <CardDescription className="text-slate-400">Distribuição de cliques ao longo do dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={clicksByHour}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour_of_day" stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                  <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "6px",
                    }}
                    labelStyle={{ color: "#F3F4F6" }}
                  />
                  <Bar dataKey="click_count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="numbers" className="space-y-4">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Top Números por Cliques</CardTitle>
              <CardDescription className="text-slate-400">Números mais utilizados do grupo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topNumbers.slice(0, 10).map((number: any, index: number) => (
                  <div key={number.number_id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-white">{number.phone}</p>
                        <p className="text-sm text-slate-400">{number.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">{number.click_count} cliques</p>
                      {number.last_click && (
                        <p className="text-sm text-slate-400">
                          Último: {new Date(number.last_click).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Cliques Recentes</CardTitle>
              <CardDescription className="text-slate-400">
                Últimos {recentClicks.length} cliques registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentClicks.map((click: any) => (
                  <div
                    key={click.click_id}
                    className="flex items-center justify-between p-3 bg-slate-800 rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {click.device_type === "mobile" ? (
                          <Smartphone className="h-4 w-4 text-blue-400" />
                        ) : (
                          <Monitor className="h-4 w-4 text-green-400" />
                        )}
                        <span className="text-white font-medium">{click.number_phone}</span>
                      </div>
                      <span className="text-slate-400">{click.number_name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white">{new Date(click.click_date).toLocaleString("pt-BR")}</p>
                      <p className="text-slate-400 text-xs">{click.ip_address?.split(",")[0] || "IP não disponível"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}