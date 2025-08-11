'use client'

import { KpiCards } from '@/components/analytics-dashboard/KpiCards'
import { TopGroupsCard } from '@/components/analytics-dashboard/TopGroupsCard'
import { DeviceDistributionCard } from '@/components/analytics-dashboard/DeviceDistributionCard'
import { HeatmapDailyCard } from '@/components/analytics-dashboard/HeatmapDailyCard'
import { Button } from '@/components/ui/button'
import { Download, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { format, startOfDay, endOfDay } from 'date-fns'
import { getDashboardStats } from '@/lib/api/stats'

export default function AnalyticsDashboard() {
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [kpiData, setKpiData] = useState({
    totalClicks: 0,
    activeGroups: 0,
    totalNumbers: 0,
    clicksToday: 0
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const today = new Date()
        const stats = await getDashboardStats(startOfDay(today), endOfDay(today))
        setKpiData({
          totalClicks: stats.totalClicks,
          activeGroups: 25, // Mock - implementar função para contar grupos ativos
          totalNumbers: 87, // Mock - implementar função para contar números
          clicksToday: stats.totalClicks
        })
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
      }
    }
    fetchData()
  }, [lastUpdate])

  const handleRefresh = () => {
    setLastUpdate(new Date())
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Analytics Geral</h1>
          <p className="text-slate-400 text-sm">Última atualização: {format(lastUpdate, 'dd/MM/yyyy HH:mm')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-600 flex gap-2" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" /> Atualizar
          </Button>
          <Button variant="outline" className="border-slate-600 flex gap-2">
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button variant="outline" className="border-slate-600 flex gap-2">
            <Download className="h-4 w-4" /> PNG
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <KpiCards data={kpiData} />

      {/* Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        <TopGroupsCard />
        <DeviceDistributionCard />
      </div>

      <HeatmapDailyCard />
    </div>
  )
}