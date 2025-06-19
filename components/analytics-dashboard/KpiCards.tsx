'use client'

import { Card } from '@/components/ui/card'
import { MousePointerClick, Users, Phone, Activity } from 'lucide-react'

export function KpiCards() {
  const items = [
    { label: 'Total de Cliques', value: '10.357', icon: MousePointerClick },
    { label: 'Grupos Ativos', value: '46', icon: Users },
    { label: 'Números', value: '0', icon: Phone },
    { label: 'Cliques Hoje', value: '0', icon: Activity },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((i) => (
        <Card key={i.label} className="bg-slate-800 border-slate-700 p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <i.icon className="h-4 w-4" /> {i.label}
          </div>
          <div className="text-2xl font-bold text-white">{i.value}</div>
        </Card>
      ))}
    </div>
  )
} 