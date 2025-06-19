import { supabase } from "@/lib/supabase"
import { getTopGroupsByClicks, getDeviceStats as getDeviceStatsRange } from "@/lib/api/stats"

/**
 * Obtém contagem de registros de uma tabela qualquer.
 * Aceita opcionalmente um builder com filtros adicionais.
 */
async function getCount(query: any) {
  const { count, error } = await query
  if (error) throw error
  return count || 0
}

//#region MÉTRICAS PRINCIPAIS -------------------------------------------------
export interface DashboardStats {
  totalGroups: number
  totalNumbers: number
  activeNumbers: number
  totalClicks: number
  clicksToday: number
  clicksThisWeek: number
  clicksThisMonth: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date()
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startWeek = new Date(startToday)
  startWeek.setDate(startWeek.getDate() - 7)
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Contagens
  const [totalGroups, totalNumbers, activeNumbers, totalClicks, clicksToday, clicksThisWeek, clicksThisMonth] =
    await Promise.all([
      getCount(supabase.from("groups").select("id", { count: "exact", head: true })),
      getCount(supabase.from("whatsapp_numbers").select("id", { count: "exact", head: true })),
      getCount(
        supabase.from("whatsapp_numbers").select("id", { count: "exact", head: true }).eq("is_active", true),
      ),
      getCount(supabase.from("clicks").select("id", { count: "exact", head: true })),
      getCount(
        supabase
          .from("clicks")
          .select("id", { count: "exact", head: true })
          .gte("created_at", startToday.toISOString()),
      ),
      getCount(
        supabase
          .from("clicks")
          .select("id", { count: "exact", head: true })
          .gte("created_at", startWeek.toISOString()),
      ),
      getCount(
        supabase
          .from("clicks")
          .select("id", { count: "exact", head: true })
          .gte("created_at", startMonth.toISOString()),
      ),
    ])

  return {
    totalGroups,
    totalNumbers,
    activeNumbers,
    totalClicks,
    clicksToday,
    clicksThisWeek,
    clicksThisMonth,
  }
}
//#endregion

//#region CLIQUES POR HORA -----------------------------------------------------
export interface HourlyClicks {
  hour_of_day: number
  click_count: number
}

export async function getHourlyClicks(): Promise<HourlyClicks[]> {
  const { data, error } = await supabase.rpc("get_hourly_clicks_secure")
  if (error) throw error
  // Garantir 24 posições mesmo se faltar alguma hora
  const base = Array.from({ length: 24 }, (_, h) => ({ hour_of_day: h, click_count: 0 }))
  data?.forEach((d: any) => {
    const h = Number(d.hour_of_day)
    if (!Number.isNaN(h) && h >= 0 && h < 24) {
      base[h].click_count = Number(d.click_count) || 0
    }
  })
  return base
}
//#endregion

//#region TOP GRUPOS -----------------------------------------------------------
export interface GroupClicks {
  group_id: string
  group_name: string
  clicks: number
}

export async function getTopGroups(limit = 5): Promise<GroupClicks[]> {
  const dateTo = new Date()
  const dateFrom = new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate()) // início do dia
  const groups = await getTopGroupsByClicks(dateFrom, dateTo)
  return groups.slice(0, limit)
}
//#endregion

//#region DISPOSITIVOS ---------------------------------------------------------
export interface DeviceStat {
  device_type: string
  count: number
  percent: number
}

export async function getDeviceStats(): Promise<DeviceStat[]> {
  const dateTo = new Date()
  const dateFrom = new Date(dateTo.getTime() - 30 * 24 * 60 * 60 * 1000) // último mês
  const stats = await getDeviceStatsRange(dateFrom, dateTo)
  const total = stats.reduce((s, d) => s + d.count, 0) || 1
  return stats.map((d) => ({ ...d, percent: Math.round((d.count / total) * 100) }))
}
//#endregion

//#region STATUS DO SISTEMA ----------------------------------------------------
export interface SystemStatus {
  inactiveGroups: number
  inactiveNumbers: number
  numbersNoUse7d: number
}

export async function getSystemStatus(): Promise<SystemStatus> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const [inactiveGroups, inactiveNumbers, numbersNoUse7d] = await Promise.all([
    getCount(supabase.from("groups").select("id", { count: "exact", head: true }).eq("is_active", false)),
    getCount(supabase.from("whatsapp_numbers").select("id", { count: "exact", head: true }).eq("is_active", false)),
    getCount(
      supabase
        .from("whatsapp_numbers")
        .select("id", { count: "exact", head: true })
        .or(`last_used_at.lt.${sevenDaysAgo.toISOString()},last_used_at.is.null`),
    ),
  ])
  return { inactiveGroups, inactiveNumbers, numbersNoUse7d }
}
//#endregion

//#region ATIVIDADE RECENTE ----------------------------------------------------
export interface RecentClick {
  id: string
  created_at: string
  group_name: string
  phone: string
}

export async function getRecentClicks(limit = 25): Promise<RecentClick[]> {
  const { data, error } = await supabase
    .from("clicks")
    .select(
      `id, created_at, groups!inner(name), whatsapp_numbers!inner(phone)`
    )
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return (
    data || []
  ).map((c: any) => ({
    id: c.id,
    created_at: c.created_at,
    group_name: c.groups?.name || "(Sem grupo)",
    phone: c.whatsapp_numbers?.phone || "",
  }))
}
//#endregion 