"use client"

import { StatsCards } from "@/components/stats-cards"
import { TopGroupsTable } from "@/components/top-groups-table"
import { Breadcrumb } from "@/components/breadcrumb"

export default function DashboardPage() {
  const breadcrumbItems = [{ label: "Dashboard", href: "/admin/dashboard", active: true }]

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-slate-800">
        <nav className="text-sm text-slate-500 mb-4">
          <Breadcrumb items={breadcrumbItems} />
        </nav>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Dashboard</h1>
            <p className="text-base text-slate-400 font-normal leading-relaxed">Visão geral do sistema LinkFlow</p>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="space-y-8">
        <StatsCards />

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 lg:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Grupos Mais Ativos</h2>
            <p className="text-sm text-slate-400 mb-6">Grupos com maior número de cliques</p>
          </div>
          <TopGroupsTable dateFrom={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)} dateTo={new Date()} />
        </div>
      </div>
    </div>
  )
}
