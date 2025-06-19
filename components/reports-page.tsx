"use client"

import { useState } from "react"
import { ArrowLeft, Zap, Download } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { MetricsCards } from "@/components/metrics-cards"
import { ClicksChart } from "@/components/clicks-chart"
import { GroupsChart } from "@/components/groups-chart"
import { DevicesChart } from "@/components/devices-chart"
import { TopGroupsTable } from "@/components/top-groups-table"
import { DateRangePicker } from "@/components/date-range-picker"

type PeriodFilter = "today" | "7days" | "30days" | "custom"

export function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>("7days")
  const [customDateRange, setCustomDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })

  const periodOptions = [
    { value: "today" as const, label: "Hoje" },
    { value: "7days" as const, label: "7 dias" },
    { value: "30days" as const, label: "30 dias" },
    { value: "custom" as const, label: "Personalizado" },
  ]

  const handleExportReport = () => {
    console.log("Exportando relatório...")
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-slate-800 bg-black">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-white hover:bg-slate-800" />
              <Link href="/admin" className="ds-link flex items-center gap-2 text-lime-400">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-lime-400">
                  <Zap className="h-5 w-5 text-black" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Relatórios e Analytics</h1>
                  <p className="text-sm text-slate-400">Acompanhe o desempenho dos seus grupos</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button onClick={handleExportReport} className="ds-button-outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Filtros de Período */}
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              {periodOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedPeriod === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(option.value)}
                  className={
                    selectedPeriod === option.value
                      ? "bg-lime-400 text-black hover:bg-lime-500"
                      : "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                  }
                >
                  {option.label}
                </Button>
              ))}
            </div>

            {selectedPeriod === "custom" && (
              <DateRangePicker dateRange={customDateRange} onDateRangeChange={setCustomDateRange} />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 ds-space-large">
        {/* Métricas Cards */}
        <MetricsCards period={selectedPeriod} customDateRange={customDateRange} />

        {/* Gráficos */}
        <div className="ds-grid-2">
          <ClicksChart period={selectedPeriod} />
          <GroupsChart period={selectedPeriod} />
        </div>

        <div className="ds-grid-3">
          <div className="lg:col-span-2">
            <TopGroupsTable period={selectedPeriod} />
          </div>
          <div>
            <DevicesChart period={selectedPeriod} />
          </div>
        </div>
      </main>
    </div>
  )
}
