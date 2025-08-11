'use client'

import { DateNavigator } from '@/components/daily/DateNavigator'
import { DailyStatsCards } from '@/components/daily/DailyStatsCards'
import { HeatmapChart } from '@/components/daily/HeatmapChart'
import { HourlyLineChart } from '@/components/daily/HourlyLineChart'
import { TopGroupsTableDaily } from '@/components/daily/TopGroupsTableDaily'
import { ExportButtons } from '@/components/daily/ExportButtons'
import { useState, useEffect } from 'react'
import { addDays, startOfDay, endOfDay } from 'date-fns'
import { getDailyStats } from '@/lib/api/stats' // Supondo que getDailyStats retorne os dados necessários

export default function DailyDashboardPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [stats, setStats] = useState({ clicks: 0, activeGroups: 0, peakHour: 0, activeNumbers: 0 });

  useEffect(() => {
    async function fetchData() {
      const from = startOfDay(date);
      const to = endOfDay(date);
      // Mock de dados enquanto a API não está pronta
      const mockData = {
        totalClicks: 1280,
        activeGroups: 25,
        peakHour: 14,
        activeNumbers: 87,
        dailyClicks: [],
        deviceStats: [],
        topGroups: []
      };
      // const data = await getDailyStats(from, to);
      setStats({
        clicks: mockData.totalClicks,
        activeGroups: mockData.activeGroups,
        peakHour: mockData.peakHour,
        activeNumbers: mockData.activeNumbers
      });
    }
    fetchData();
  }, [date]);


  const changeDate = (days: number) => {
    setDate((prev) => addDays(prev, days))
  }

  return (
    <div className="flex flex-col gap-8">
      <DateNavigator date={date} onDateChange={setDate} onPrev={() => changeDate(-1)} onNext={() => changeDate(1)} />

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          <DailyStatsCards stats={stats} />
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