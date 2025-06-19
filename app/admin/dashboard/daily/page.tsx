'use client'

import { DateNavigator } from '@/components/daily/DateNavigator'
import { DailyStatsCards } from '@/components/daily/DailyStatsCards'
import { HeatmapChart } from '@/components/daily/HeatmapChart'
import { HourlyLineChart } from '@/components/daily/HourlyLineChart'
import { TopGroupsTableDaily } from '@/components/daily/TopGroupsTableDaily'
import { ExportButtons } from '@/components/daily/ExportButtons'
import { useState } from 'react'
import { addDays } from 'date-fns'

export default function DailyDashboardPage() {
  const [date, setDate] = useState<Date>(new Date())

  const changeDate = (days: number) => {
    setDate((prev) => addDays(prev, days))
  }

  return (
    <div className="flex flex-col gap-8">
      <DateNavigator date={date} onDateChange={setDate} onPrev={() => changeDate(-1)} onNext={() => changeDate(1)} />

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          <DailyStatsCards />
          <HeatmapChart />
        </div>
        <div className="flex flex-col gap-8">
          <HourlyLineChart />
          <TopGroupsTableDaily />
          <ExportButtons />
        </div>
      </div>
    </div>
  )
} 