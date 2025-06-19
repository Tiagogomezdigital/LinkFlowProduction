"use client"

import { useState, useEffect } from "react"
import { Folder, Phone, MousePointer, TrendingUp } from "lucide-react"
import { getDashboardStats } from "@/lib/api/dashboard"

export function StatsCards() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getDashboardStats()
      setStats(data)
      console.log("Dashboard stats loaded:", data)
    } catch (error: any) {
      console.error("Error loading stats:", error)
      setError(error.message)
      setStats({
        totalGroups: 0,
        totalNumbers: 0,
        activeNumbers: 0,
        totalClicks: 0,
        clicksToday: 0,
        clicksThisWeek: 0,
        clicksThisMonth: 0,
        conversionRate: "0",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-slate-800 border border-slate-700 rounded-xl p-6 animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 w-24 bg-slate-700 rounded"></div>
              <div className="h-8 w-8 bg-slate-700 rounded"></div>
            </div>
            <div className="mb-2">
              <div className="h-8 w-16 bg-slate-700 rounded"></div>
            </div>
            <div className="h-3 w-28 bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  const statsData = [
    {
      title: "TOTAL DE GRUPOS",
      value: stats?.totalGroups || 0,
      description: `${stats?.activeNumbers || 0} números ativos`,
      icon: Folder,
      iconColor: "text-lime-400",
    },
    {
      title: "NÚMEROS CADASTRADOS",
      value: stats?.totalNumbers || 0,
      description: `${stats?.activeNumbers || 0} ativos`,
      icon: Phone,
      iconColor: "text-lime-400",
    },
    {
      title: "CLIQUES HOJE",
      value: stats?.clicksToday || 0,
      description: `${stats?.clicksThisWeek || 0} esta semana`,
      icon: MousePointer,
      iconColor: "text-lime-400",
    },
    {
      title: "TOTAL DE CLIQUES",
      value: stats?.totalClicks || 0,
      description: `${stats?.clicksThisMonth || 0} este mês`,
      icon: TrendingUp,
      iconColor: "text-lime-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <div
          key={index}
          className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:scale-105 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">{stat.title}</h3>
            <stat.icon className={`h-8 w-8 opacity-80 ${stat.iconColor}`} />
          </div>
          <div className="mb-2">
            <div className="text-4xl font-light text-white font-mono text-center">{stat.value}</div>
          </div>
          <p className="text-xs text-slate-500 font-normal text-center">{stat.description}</p>
        </div>
      ))}
    </div>
  )
}
