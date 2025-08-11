import { supabase } from "@/lib/supabase"
import type { GroupStats, DailyStats, DeviceStats, GroupClickStats, Click } from "@/lib/types"
import { createClient } from "@/lib/supabase"

export async function getGroupStats(): Promise<GroupStats[]> {
  try {
    console.log(`[${new Date().toISOString()}] 🔍 Buscando estatísticas dos grupos...`)

    const { data, error } = await supabase.rpc("get_group_stats")

    if (error) {
      console.error(`[${new Date().toISOString()}] ❌ Erro ao buscar group stats:`, error)
      throw error
    }

    console.log(`[${new Date().toISOString()}] ✅ Dados recebidos do banco:`, data)

    // Mapear os dados para o formato esperado
    const mappedData = (data || []).map((item: any) => ({
      group_id: item.group_id,
      group_name: item.group_name,
      group_slug: item.group_slug,
      total_numbers: Number(item.total_numbers) || 0,
      active_numbers: Number(item.active_numbers) || 0,
      total_clicks: Number(item.total_clicks) || 0,
    }))

    console.log(`[${new Date().toISOString()}] 📊 Dados mapeados:`, mappedData)
    return mappedData
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Erro em getGroupStats:`, error)
    return []
  }
}

export async function getDashboardStats(dateFrom: Date, dateTo: Date, groupIds?: string[]) {
  try {
    const supabase = createClient()

    // Construir a query base
    let query = supabase
      .from("clicks")
      .select("*", { count: "exact" })

    // Aplicar filtros de data
    query = query
      .gte("created_at", dateFrom.toISOString())
      .lte("created_at", dateTo.toISOString())

    // Aplicar filtro de grupos se fornecido
    if (groupIds && groupIds.length > 0) {
      query = query.in("group_id", groupIds)
    }

    // Buscar dados
    const { data: clicks, error, count } = await query

    if (error) throw error

    // Calcular métricas
    const totalClicks = count || 0
    const uniqueVisitors = new Set((clicks as Click[])?.map((click) => click.ip_address) || []).size
    const daysDiff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const averageClicksPerDay = totalClicks / daysDiff

    // Buscar grupo mais acessado
    const { data: topGroupData } = await supabase
      .from("clicks")
      .select("group_id, groups(name)")
      .gte("created_at", dateFrom.toISOString())
      .lte("created_at", dateTo.toISOString())
      .order("created_at", { ascending: false })

    if (!topGroupData) return {
      totalClicks,
      uniqueVisitors,
      averageClicksPerDay,
      topGroup: null
    }

    // Processar dados para encontrar o grupo mais acessado
    const groupStats = (topGroupData as any[]).reduce((acc: { [key: string]: { name: string; clicks: number } }, curr) => {
      const groupId = curr.group_id
      if (!acc[groupId]) {
        acc[groupId] = {
          name: curr.groups.name,
          clicks: 0,
        }
      }
      acc[groupId].clicks++
      return acc
    }, {})

    const topGroup = Object.entries(groupStats)
      .map(([group_id, data]) => ({
        name: data.name,
        clicks: data.clicks,
      }))
      .sort((a, b) => b.clicks - a.clicks)[0] || null

    return {
      totalClicks,
      uniqueVisitors,
      averageClicksPerDay,
      topGroup
    }
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error)
    throw error
  }
}

// Função para debug direto
export async function debugGroupStats() {
  try {
    console.log("🔍 DEBUG: Testando query direta...")

    // Query direta para debug
    const { data: directData, error: directError } = await supabase
      .from("clicks")
      .select(`
        id,
        created_at,
        groups!inner(id, name, slug),
        whatsapp_numbers!inner(id, phone)
      `)
      .limit(10)

    console.log("📋 Cliques diretos da tabela:", directData)

    if (directError) {
      console.error("❌ Erro na query direta:", directError)
    }

    // Testar função SQL
    const { data: funcData, error: funcError } = await supabase.rpc("get_group_stats")
    console.log("🔧 Resultado da função SQL:", funcData)

    if (funcError) {
      console.error("❌ Erro na função SQL:", funcError)
    }
  } catch (error) {
    console.error("❌ Erro no debug:", error)
  }
}

export async function getDailyStats(dateFrom: Date, dateTo: Date, groupIds?: string[]) {
  try {
    const supabase = createClient()

    // Construir a query base
    let query = supabase
      .from("clicks")
      .select("created_at, count")
      .gte("created_at", dateFrom.toISOString())
      .lte("created_at", dateTo.toISOString())

    // Aplicar filtro de grupos se fornecido
    if (groupIds && groupIds.length > 0) {
      query = query.in("group_id", groupIds)
    }

    // Agrupar por data
    const { data, error } = await query
      .select("created_at")
      .order("created_at", { ascending: true })

    if (error) throw error

    // Processar dados para o formato esperado
    const dailyStats = (data as Click[])?.reduce((acc: { [key: string]: number }, curr) => {
      const date = new Date(curr.created_at).toISOString().split("T")[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    // Converter para array e preencher datas vazias
    const result = []
    const currentDate = new Date(dateFrom)
    const endDate = new Date(dateTo)

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0]
      result.push({
        date: dateStr,
        clicks: dailyStats?.[dateStr] || 0,
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return result
  } catch (error) {
    console.error("Erro ao buscar estatísticas diárias:", error)
    throw error
  }
}

export async function getDeviceStats(dateFrom: Date, dateTo: Date, groupIds?: string[]) {
  try {
    const supabase = createClient()

    // Construir a query base
    let query = supabase
      .from("clicks")
      .select("device_type")
      .gte("created_at", dateFrom.toISOString())
      .lte("created_at", dateTo.toISOString())

    // Aplicar filtro de grupos se fornecido
    if (groupIds && groupIds.length > 0) {
      query = query.in("group_id", groupIds)
    }

    // Buscar dados
    const { data, error } = await query
      .order("created_at", { ascending: false })

    if (error) throw error

    // Processar dados para o formato esperado
    const deviceStats = (data as any[])?.reduce((acc: { [key: string]: number }, curr) => {
      const deviceType = curr.device_type || "desconhecido"
      acc[deviceType] = (acc[deviceType] || 0) + 1
      return acc
    }, {})

    // Converter para array
    const result = Object.entries(deviceStats || {}).map(([device_type, count]) => ({
      device_type,
      count,
    }))

    return result
  } catch (error) {
    console.error("Erro ao buscar estatísticas de dispositivos:", error)
    throw error
  }
}

export async function getTopGroupsByClicks(dateFrom: Date, dateTo: Date, groupIds?: string[]) {
  try {
    const supabase = createClient()

    // Construir a query base
    let query = supabase
      .from("clicks")
      .select("group_id, groups(name)")
      .gte("created_at", dateFrom.toISOString())
      .lte("created_at", dateTo.toISOString())

    // Aplicar filtro de grupos se fornecido
    if (groupIds && groupIds.length > 0) {
      query = query.in("group_id", groupIds)
    }

    // Buscar dados
    const { data, error } = await query
      .order("created_at", { ascending: false })

    if (error) throw error

    // Processar dados para o formato esperado
    const groupStats = (data as any[])?.reduce((acc: { [key: string]: { name: string; clicks: number } }, curr) => {
      const groupId = curr.group_id
      if (!acc[groupId]) {
        acc[groupId] = {
          name: curr.groups.name,
          clicks: 0,
        }
      }
      acc[groupId].clicks++
      return acc
    }, {})

    // Converter para array e ordenar por cliques
    const result = Object.entries(groupStats || {}).map(([group_id, data]) => ({
      group_id,
      group_name: data.name,
      clicks: data.clicks,
    }))

    return result.sort((a, b) => b.clicks - a.clicks)
  } catch (error) {
    console.error("Erro ao buscar estatísticas de grupos:", error)
    throw error
  }
}

// Função para obter estatísticas de um grupo específico
export async function getGroupStatsById(groupId: string): Promise<GroupStats | null> {
  try {
    const stats = await getGroupStats()
    return stats.find((stat) => stat.group_id === groupId) || null
  } catch (error) {
    console.error("Error in getGroupStatsById:", error)
    return null
  }
}

// Função para forçar atualização das estatísticas
export async function refreshGroupStats(): Promise<void> {
  try {
    // Força uma nova consulta das estatísticas
    await supabase.rpc("get_group_stats")
  } catch (error) {
    console.error("Error refreshing group stats:", error)
  }
}

interface FilteredStats {
  dailyClicks: Array<{
    date: string
    clicks: number
  }>
  groupClicks: Array<{
    group_id: string
    group_name: string
    group_slug: string
    clicks: number
  }>
}

export async function getFilteredStats(
  dateFrom: Date,
  dateTo: Date,
  groupIds?: string[]
): Promise<FilteredStats> {
  try {
    console.log("🔍 Buscando estatísticas filtradas...", { dateFrom, dateTo, groupIds })

    // Buscar todos os cliques do período/grupos, incluindo join com groups
    let query = supabase
      .from("clicks")
      .select("group_id, created_at, groups(id, name, slug)")
      .gte("created_at", dateFrom.toISOString())
      .lte("created_at", dateTo.toISOString())

    if (groupIds?.length) {
      query = query.in("group_id", groupIds)
    }

    const { data, error } = await query
    if (error) throw error

    // Agrupar por dia
    const stats = new Map<string, number>()
    const startDate = new Date(dateFrom)
    const endDate = new Date(dateTo)
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      stats.set(d.toISOString().split("T")[0], 0)
    }
    data?.forEach((click: any) => {
      const date = new Date(click.created_at).toISOString().split("T")[0]
      stats.set(date, (stats.get(date) || 0) + 1)
    })

    // Agrupar por grupo
    const groupMap = new Map<string, { group_id: string, group_name: string, group_slug: string, clicks: number }>()
    data?.forEach((click: any) => {
      const group_id = click.group_id
      const group_name = click.groups?.name || "(Sem nome)"
      const group_slug = click.groups?.slug || ""
      if (!groupMap.has(group_id)) {
        groupMap.set(group_id, { group_id, group_name, group_slug, clicks: 0 })
      }
      groupMap.get(group_id)!.clicks++
    })
    const groupClicks = Array.from(groupMap.values()).sort((a, b) => b.clicks - a.clicks)

    const result = {
      dailyClicks: Array.from(stats.entries()).map(([date, clicks]) => ({ date, clicks })),
      groupClicks,
    }
    console.log("✅ Estatísticas filtradas processadas:", result)
    return result
  } catch (error) {
    console.error("❌ Erro em getFilteredStats:", error)
    return {
      dailyClicks: [],
      groupClicks: [],
    }
  }
}
