"use client"

import { Breadcrumb } from "@/components/breadcrumb"
import { StatsCards } from "@/components/stats-cards"
import { HourlyLineChart } from "@/components/daily/HourlyLineChart"
import { TopGroupsCard } from "@/components/analytics-dashboard/TopGroupsCard"
import { DeviceDistributionCard } from "@/components/analytics-dashboard/DeviceDistributionCard"
import { SystemStatusCards } from "@/components/system-status-cards"
import { RecentActivityList } from "@/components/recent-activity-list"

export default function OverviewPage() {
  const breadcrumbItems = [{ label: "Visão Geral", href: "/admin/overview", active: true }]

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-slate-800">
        <nav className="text-sm text-slate-500 mb-4">
          <Breadcrumb items={breadcrumbItems} />
        </nav>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Dashboard MVP</h1>
            <p className="text-base text-slate-400 font-normal leading-relaxed">
              Visão consolidada das métricas essenciais do LinkFlow
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="space-y-8">
        {/* KPIs */}
        <StatsCards />

        {/* Gráfico + Top Grupos */}
        <div className="grid lg:grid-cols-2 gap-8">
          <HourlyLineChart />
          <TopGroupsCard />
        </div>

        {/* Dispositivos + Status */}
        <div className="grid lg:grid-cols-2 gap-8">
          <DeviceDistributionCard />
          <SystemStatusCards />
        </div>

        {/* Atividade Recente */}
        <RecentActivityList />
      </div>
    </div>
  )
} 