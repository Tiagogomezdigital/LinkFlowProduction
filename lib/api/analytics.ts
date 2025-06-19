import { supabase } from "@/lib/supabase"

export interface GroupAnalytics {
  total_clicks: number
  active_numbers: number
  total_numbers: number
  clicks_today: number
  clicks_this_week: number
  clicks_this_month: number
  avg_clicks_per_number: number
}

export async function getGroupAnalytics(groupId: string): Promise<GroupAnalytics | null> {
  try {
    const { data, error } = await supabase.rpc("get_group_analytics", {
      p_group_id: groupId,
    })

    if (error) {
      console.error("Error fetching group analytics:", error)
      throw error
    }

    const analytics = data?.[0]

    if (!analytics) {
      return {
        total_clicks: 0,
        active_numbers: 0,
        total_numbers: 0,
        clicks_today: 0,
        clicks_this_week: 0,
        clicks_this_month: 0,
        avg_clicks_per_number: 0,
      }
    }

    return {
      total_clicks: Number(analytics.total_clicks) || 0,
      active_numbers: Number(analytics.active_numbers) || 0,
      total_numbers: Number(analytics.total_numbers) || 0,
      clicks_today: Number(analytics.clicks_today) || 0,
      clicks_this_week: Number(analytics.clicks_this_week) || 0,
      clicks_this_month: Number(analytics.clicks_this_month) || 0,
      avg_clicks_per_number: Number(analytics.avg_clicks_per_number) || 0,
    }
  } catch (error) {
    console.error("Error in getGroupAnalytics:", error)
    return null
  }
}
