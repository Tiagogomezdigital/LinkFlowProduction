'use client'

import { Card } from '@/components/ui/card'
import { MousePointerClick, Users, Clock, Phone } from 'lucide-react'

interface DailyStats {
  clicks: number
  activeGroups: number
  peakHour: number
  activeNumbers: number
}

interface DailyStatsCardsProps {
  stats: DailyStats
}

export function DailyStatsCards({ stats }: DailyStatsCardsProps) {
  const cards = [
    { label: 'Cliques Totais', value: stats.clicks.toLocaleString(), icon: MousePointerClick },
    { label: 'Grupos Ativos', value: stats.activeGroups, icon: Users },
    { label: 'Horário de Pico', value: `${stats.peakHour}h`, icon: Clock },
    { label: 'Números Ativos', value: stats.activeNumbers, icon: Phone },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className="bg-slate-800 border-slate-700 p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-400">
            <c.icon className="h-4 w-4" />
            <span className="text-sm">{c.label}</span>
          </div>
          <div className="text-2xl font-bold text-white">{c.value}</div>
        </Card>
      ))}
    </div>
  )
}