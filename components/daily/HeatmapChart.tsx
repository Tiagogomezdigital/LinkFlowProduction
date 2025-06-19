'use client'

import { Card } from '@/components/ui/card'

export function HeatmapChart() {
  const groups = ['Grupo A', 'Grupo B', 'Grupo C', 'Grupo D', 'Grupo E']
  const data = groups.map(() => Array.from({ length: 24 }, () => Math.floor(Math.random() * 20)))

  const max = Math.max(...data.flat())

  const getColor = (v: number) => {
    const intensity = v / max
    const alpha = 0.3 + intensity * 0.7
    return `rgba(132, 204, 22, ${alpha.toFixed(2)})` // lime-400 RGBA
  }

  return (
    <Card className="bg-slate-800 border-slate-700 p-4 overflow-auto">
      <h2 className="text-lg font-semibold text-white mb-4">Mapa de Calor (Cliques por Hora)</h2>
      <div className="min-w-[800px]">
        <div className="grid grid-cols-25 gap-px bg-slate-700">
          <div className="bg-slate-900 text-xs text-slate-400 p-1"></div>
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="bg-slate-900 text-xs text-center text-slate-400 p-1">
              {h}
            </div>
          ))}
          {groups.map((g, i) => (
            <>
              <div key={g} className="bg-slate-900 text-xs text-slate-400 p-1 whitespace-nowrap">
                {g}
              </div>
              {data[i].map((v, h) => (
                <div key={h} className="h-6" style={{ backgroundColor: getColor(v) }} />
              ))}
            </>
          ))}
        </div>
      </div>
    </Card>
  )
} 