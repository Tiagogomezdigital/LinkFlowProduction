import { supabase } from "@/lib/supabase"

// VERSÃO ULTRA SEGURA - SÓ USA QUERIES SIMPLES
export async function getUltraSafeGroupAnalytics(groupId: string) {
  try {
    console.log("🔍 Buscando analytics ultra seguro para grupo:", groupId)

    // 1. Buscar info do grupo (SEGURO)
    const { data: groupInfo, error: groupError } = await supabase.from("groups").select("*").eq("id", groupId).single()

    if (groupError) {
      console.error("❌ Erro ao buscar grupo:", groupError)
      throw groupError
    }

    // 2. Buscar números do grupo (SEGURO)
    const { data: numbers, error: numbersError } = await supabase
      .from("whatsapp_numbers")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false })

    if (numbersError) {
      console.error("❌ Erro ao buscar números:", numbersError)
      throw numbersError
    }

    // 3. Buscar cliques do grupo (SEGURO)
    const { data: clicks, error: clicksError } = await supabase
      .from("clicks")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false })
      .limit(50000) // Limite alto para evitar problemas de performance

    if (clicksError) {
      console.error("❌ Erro ao buscar cliques:", clicksError)
      throw clicksError
    }

    // 4. Buscar stats do grupo (SEGURO)
    const { data: stats, error: statsError } = await supabase.from("group_stats").select("*").eq("id", groupId).single()

    if (statsError) {
      console.warn("⚠️ Stats não encontradas, usando dados calculados")
    }

    // 5. PROCESSAR DADOS LOCALMENTE (100% SEGURO)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Calcular estatísticas
    const totalClicks = clicks?.length || 0
    const clicksToday = clicks?.filter((c) => new Date(c.created_at) >= today).length || 0
    const clicksThisWeek = clicks?.filter((c) => new Date(c.created_at) >= thisWeek).length || 0
    const clicksThisMonth = clicks?.filter((c) => new Date(c.created_at) >= thisMonth).length || 0

    const uniqueIps = new Set(clicks?.map((c) => c.ip_address).filter(Boolean)).size
    const totalNumbers = numbers?.length || 0
    const activeNumbers = numbers?.filter((n) => n.is_active).length || 0

    // Cliques por número
    const clicksByNumber =
      numbers
        ?.map((number) => {
          const numberClicks = clicks?.filter((c) => c.number_id === number.id) || []
          return {
            number_id: number.id,
            phone: number.phone,
            name: number.name || "Sem nome",
            click_count: numberClicks.length,
            last_click: numberClicks[0]?.created_at || null,
            last_used_at: number.last_used_at,
          }
        })
        .sort((a, b) => b.click_count - a.click_count) || []

    // Cliques por hora
    const clicksByHour = Array.from({ length: 24 }, (_, hour) => {
      const hourClicks =
        clicks?.filter((c) => {
          const clickHour = new Date(c.created_at).getHours()
          return clickHour === hour
        }).length || 0

      return {
        hour_of_day: hour,
        click_count: hourClicks,
      }
    })

    // Cliques recentes
    const recentClicks =
      clicks?.slice(0, 50).map((click) => {
        const number = numbers?.find((n) => n.id === click.number_id)
        return {
          click_id: click.id,
          click_date: click.created_at,
          number_phone: number?.phone || "N/A",
          number_name: number?.name || "Sem nome",
          ip_address: click.ip_address || "",
          user_agent: click.user_agent || "",
          device_type: click.device_type || "",
          referrer: click.referrer || "",
        }
      }) || []

    console.log("✅ Analytics processados com sucesso!")

    return {
      success: true,
      data: {
        group: groupInfo,
        stats: {
          total_clicks: totalClicks,
          clicks_today: clicksToday,
          clicks_this_week: clicksThisWeek,
          clicks_this_month: clicksThisMonth,
          unique_ips: uniqueIps,
          total_numbers: totalNumbers,
          active_numbers: activeNumbers,
          avg_clicks_per_day:
            totalClicks > 0
              ? Math.round(
                  (totalClicks /
                    Math.max(
                      1,
                      Math.ceil((now.getTime() - new Date(groupInfo.created_at).getTime()) / (1000 * 60 * 60 * 24)),
                    )) *
                    100,
                ) / 100
              : 0,
          last_click_at: clicks?.[0]?.created_at || null,
        },
        topNumbers: clicksByNumber,
        clicksByHour,
        recentClicks,
      },
    }
  } catch (error: any) {
    console.error("❌ Erro no analytics ultra seguro:", error)
    return {
      success: false,
      error: error.message,
      data: null,
    }
  }
}

// Função para exportar dados (ULTRA SEGURA)
export async function exportUltraSafeGroupData(groupId: string) {
  try {
    const analytics = await getUltraSafeGroupAnalytics(groupId)

    if (!analytics.success || !analytics.data) {
      throw new Error("Erro ao buscar dados para exportação")
    }

    const { group, stats, topNumbers, recentClicks } = analytics.data

    // Preparar dados para CSV
    const csvData = {
      group: {
        id: group.id,
        name: group.name,
        slug: group.slug,
        description: group.description,
        is_active: group.is_active,
        created_at: group.created_at,
      },
      stats,
      topNumbers,
      recentClicks: recentClicks.slice(0, 100), // Limitar para não ficar muito grande
    }

    return {
      success: true,
      data: csvData,
      filename: `grupo-${group.slug}-analytics-${new Date().toISOString().split("T")[0]}.json`,
    }
  } catch (error: any) {
    console.error("❌ Erro na exportação ultra segura:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}