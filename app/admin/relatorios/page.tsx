"use client"

import { useState } from "react"
import { AdvancedFilters } from "@/components/advanced-filters"
import { MetricsCards } from "@/components/metrics-cards"
import { ClicksChart } from "@/components/clicks-chart"
import { GroupsChart } from "@/components/groups-chart"
import { DevicesChart } from "@/components/devices-chart"
import { TopGroupsTable } from "@/components/top-groups-table"
import { CountryStatsChart } from "@/components/country-stats-chart"
import { BrowserStatsChart } from "@/components/browser-stats-chart"
import { OSStatsChart } from "@/components/os-stats-chart"
import { UTMStatsChart } from "@/components/utm-stats-chart"
import { LocationStatsChart } from "@/components/location-stats-chart"
import { useGroups } from "@/hooks/useGroups"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Download } from "lucide-react"
import { format } from "date-fns"

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
  const processRow = (row: string[]) =>
    row
      .map((val) => {
        const inner = val.replace(/"/g, '""')
        return /[",\n]/.test(inner) ? `"${inner}"` : inner
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

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters)
  }

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
    <div className="w-full min-h-screen flex flex-col bg-transparent gap-8">
      {/* Breadcrumb */}
      <nav className="text-xs sm:text-sm text-slate-400 mb-2" aria-label="Breadcrumb">
        <ol className="inline-flex gap-2">
          <li><a href="/admin/dashboard" className="hover:underline">Dashboard</a></li>
          <li>/</li>
          <li className="text-white">Relatórios</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Relatórios</h1>
          <p className="text-slate-400 text-sm sm:text-base">Visualize e exporte relatórios de uso dos seus grupos de WhatsApp</p>
        </div>
      </header>

      {/* Totais rápidos */}
      {filters.stats?.groupClicks && filters.stats.groupClicks.length>0 && (
        <div className="text-slate-400 text-sm mb-2">
          Total de Cliques: <span className="text-white font-medium">{totalClicks}</span> • Grupos com clique: <span className="text-white font-medium">{filters.stats.groupClicks.length}</span>
        </div>
      )}

      {/* Filtro Avançado */}
      <section className="w-full max-w-4xl relative">
        <AdvancedFilters
          groups={groups}
          onFiltersChange={handleFiltersChange}
          onExport={handleExport}
        />
        {filters.stats?.groupClicks && (
          <button
            onClick={handleExport}
            className="absolute right-4 top-4 bg-lime-400 hover:bg-lime-500 text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
        )}
      </section>

      {/* espaço para alinhamento interno removido */}

      {/* Tabela de grupos filtrados e cliques */}
      {filters.stats?.groupClicks && (
        <section className="w-full mt-4">
          <div className="rounded-xl border border-slate-700 bg-slate-800 shadow-sm w-full max-w-4xl p-4 sm:p-6 md:p-8 transition-all">
            <h2 className="text-lg font-semibold text-white">Grupos por Cliques</h2>
            <p className="text-slate-400 text-xs mb-4">Período: {format(filters.dateFrom,'dd/MM/yyyy')} – {format(filters.dateTo,'dd/MM/yyyy')}</p>
            <ul className="flex flex-col gap-2">
              {filters.stats.groupClicks.sort((a,b)=>b.clicks-a.clicks).map((group,index)=>(
                <li key={group.group_id} className="flex items-center justify-between bg-slate-900 rounded px-3 py-2">
                  <div className="flex items-center gap-3">
                    <span className="bg-lime-400 text-black font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs">{index+1}</span>
                    <div className="flex flex-col">
                      <span className="text-white text-sm">{group.group_name}</span>
                      <span className="text-slate-400 text-xs font-mono">/{group.group_slug}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-mono">{group.clicks}</div>
                    <div className="text-lime-400 text-xs font-mono">{totalClicks?((group.clicks/totalClicks)*100).toFixed(1):'0.0'}%</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {filters.stats?.groupClicks && filters.stats.groupClicks.length === 0 && (
        <div className="text-center py-20 text-slate-400">Nenhum registro para este período/grupos. <button className="underline" onClick={()=>handleFiltersChange({ ...filters, groupIds: undefined, stats: undefined})}>Limpar filtros</button></div>
      )}

      {/* Estatísticas Avançadas */}
      {filters.stats?.groupClicks && filters.stats.groupClicks.length > 0 && (
        <section className="w-full mt-8 space-y-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Estatísticas Avançadas</h2>
            <p className="text-slate-400 text-sm">Análise detalhada de localização, dispositivos e campanhas</p>
          </div>
          
          {/* Grid de estatísticas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LocationStatsChart 
              groupId={filters.groupIds?.[0]} 
              startDate={format(filters.dateFrom, 'yyyy-MM-dd')} 
              endDate={format(filters.dateTo, 'yyyy-MM-dd')} 
            />
            <DevicesChart 
               dateFrom={filters.dateFrom} 
               dateTo={filters.dateTo} 
               groupIds={filters.groupIds} 
             />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BrowserStatsChart 
              groupId={filters.groupIds?.[0]} 
              startDate={format(filters.dateFrom, 'yyyy-MM-dd')} 
              endDate={format(filters.dateTo, 'yyyy-MM-dd')} 
            />
            <OSStatsChart 
              groupId={filters.groupIds?.[0]} 
              startDate={format(filters.dateFrom, 'yyyy-MM-dd')} 
              endDate={format(filters.dateTo, 'yyyy-MM-dd')} 
            />
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <UTMStatsChart 
              groupId={filters.groupIds?.[0]} 
              startDate={format(filters.dateFrom, 'yyyy-MM-dd')} 
              endDate={format(filters.dateTo, 'yyyy-MM-dd')} 
            />
          </div>
        </section>
      )}
    </div>
  )
}