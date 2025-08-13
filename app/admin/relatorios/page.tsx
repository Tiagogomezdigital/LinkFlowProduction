"use client"

import { useState, useCallback } from "react"
import { AdvancedFilters } from "@/components/advanced-filters"
import { useGroups } from "@/hooks/useGroups"
import { toast } from "sonner"
import { Download, FileText, TrendingUp, Users, Calendar, Filter } from "lucide-react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Filters {
  dateFrom: Date
  dateTo: Date
  groupIds?: string[]
  stats?: {
    dailyClicks: Array<{
      date: string
      clicks: number
    }>
    groupClicks: Array<{
      group_id: string
      group_name: string
      group_slug: string
      clicks: number
    }>
  }
}

function downloadCsv(filename: string, rows: string[][]) {
  if (typeof document === 'undefined') return
  
  const processRow = (row: string[]) =>
    row
      .map((field) => {
        let result = field || ''
        if (result.search(/["\n\r,]/g) >= 0) {
          result = '"' + result.replace(/"/g, '""') + '"'
        }
        return result
      })
      .join(',')

  const csvContent = rows.map(processRow).join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default function ReportsPage() {
  const { groups } = useGroups()
  const [filters, setFilters] = useState<Filters>({
    dateFrom: new Date(),
    dateTo: new Date(),
  })

  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters)
  }, [])

  const handleExport = async () => {
    try {
      if (!filters.stats?.groupClicks) {
        toast.error("Nada para exportar")
        return
      }
      const rows = [["date_from","date_to","group_id", "group_name", "clicks"]]
      filters.stats.groupClicks.forEach((g) => {
        rows.push([
          format(filters.dateFrom,'yyyy-MM-dd'),
          format(filters.dateTo,'yyyy-MM-dd'),
          g.group_id,
          g.group_name,
          String(g.clicks),
        ])
      })
      downloadCsv("relatorio-grupos.csv", rows)
      toast.success("CSV exportado")
    } catch (error) {
      console.error("Erro ao exportar dados:", error)
      toast.error("Erro ao exportar dados")
    }
  }

  const totalClicks = filters.stats?.groupClicks?.reduce((s, g) => s + g.clicks, 0) || 0

  return (
    <div className="container mx-auto px-4 py-6 space-y-8 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-400" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <a href="/admin/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </a>
          </li>
          <li className="text-slate-600">/</li>
          <li className="text-white font-medium">Relatórios</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-lime-500/10 rounded-lg">
              <FileText className="h-6 w-6 text-lime-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Relatórios</h1>
              <p className="text-slate-400">Visualize e exporte relatórios de uso dos seus grupos</p>
            </div>
          </div>
        </div>
        
        {filters.stats?.groupClicks && (
          <Button
            onClick={handleExport}
            className="bg-lime-500 hover:bg-lime-600 text-black font-medium"
            size="lg"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        )}
      </div>

      {/* Métricas Rápidas */}
      {filters.stats?.groupClicks && filters.stats.groupClicks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Total de Cliques</p>
                  <p className="text-2xl font-bold text-white">{totalClicks.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Grupos Ativos</p>
                  <p className="text-2xl font-bold text-white">{filters.stats.groupClicks.length}</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Período</p>
                  <p className="text-sm font-medium text-white">
                    {format(filters.dateFrom, 'dd/MM/yyyy')} - {format(filters.dateTo, 'dd/MM/yyyy')}
                  </p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Filter className="h-5 w-5" />
            Filtros de Busca
          </CardTitle>
          <CardDescription>
            Configure os filtros para gerar relatórios personalizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdvancedFilters
            groups={groups}
            onFiltersChange={handleFiltersChange}
            onExport={handleExport}
          />
        </CardContent>
      </Card>

      {/* Resultados */}
      {filters.stats?.groupClicks && filters.stats.groupClicks.length > 0 && (
        <Card className="bg-slate-800/30 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Ranking de Grupos</CardTitle>
            <CardDescription>
              Grupos ordenados por número de cliques no período selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filters.stats.groupClicks
                .sort((a, b) => b.clicks - a.clicks)
                .map((group, index) => {
                  const percentage = totalClicks ? ((group.clicks / totalClicks) * 100) : 0
                  const isTop3 = index < 3
                  
                  return (
                    <div
                      key={group.group_id}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg transition-all hover:scale-[1.02]",
                        isTop3 ? "bg-gradient-to-r from-lime-500/10 to-green-500/10 border border-lime-500/20" : "bg-slate-700/50"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm",
                          isTop3 ? "bg-lime-400 text-black" : "bg-slate-600 text-white"
                        )}>
                          {index + 1}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-medium text-white">{group.group_name}</h3>
                          <p className="text-sm text-slate-400 font-mono">/{group.group_slug}</p>
                        </div>
                        {isTop3 && (
                          <Badge variant="secondary" className="bg-lime-500/20 text-lime-400 border-lime-500/30">
                            Top {index + 1}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-right space-y-1">
                        <div className="text-xl font-bold text-white">
                          {group.clicks.toLocaleString()}
                        </div>
                        <div className="text-sm text-lime-400 font-medium">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado Vazio */}
      {filters.stats?.groupClicks && filters.stats.groupClicks.length === 0 && (
        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="py-16">
            <div className="text-center space-y-4">
              <div className="p-4 bg-slate-700/50 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-white">Nenhum dado encontrado</h3>
                <p className="text-slate-400">Não há registros para o período e grupos selecionados.</p>
              </div>
              <Button
                variant="outline"
                onClick={() => handleFiltersChange({ ...filters, groupIds: undefined, stats: undefined })}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}