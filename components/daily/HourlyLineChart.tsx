"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { ChartContainer, ChartLegend } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { getHourlyClicks, HourlyClicks } from "@/lib/api/dashboard"

export function HourlyLineChart() {
  const [data, setData] = useState<HourlyClicks[]>([])
  const [loading, setLoading] = useState(true)
  const hasData = data.some((d) => d.click_count > 0)

  useEffect(() => {
    getHourlyClicks()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700 p-4 animate-pulse h-64" />
    )
  }

  if (!hasData) {
    return (
      <Card className="bg-slate-800 border-slate-700 p-4 flex items-center justify-center h-64">
        <p className="text-slate-400 text-sm">Sem dados de cliques nas últimas 24 horas.</p>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800 border-slate-700 p-4">
      <h2 className="text-lg font-semibold text-white mb-4">Cliques por Hora</h2>
      <ChartContainer config={{ clicks: { color: "rgba(132,204,22,1)", label: "Cliques" } }}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-700" />
          <XAxis dataKey="hour_of_day" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <ChartLegend />
          <Line type="monotone" dataKey="click_count" stroke="rgba(132,204,22,1)" strokeWidth={2} dot={false} />
        </LineChart>
      </ChartContainer>
    </Card>
  )
} 