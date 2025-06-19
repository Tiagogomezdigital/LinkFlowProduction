import { supabase } from "../supabase"
import type { Click } from "../types"

export async function registerClick(params: {
  groupSlug: string
  numberPhone: string
  ipAddress?: string
  userAgent?: string
  deviceType?: string
  referrer?: string
}): Promise<void> {
  const { error } = await supabase.rpc("register_click", {
    group_slug: params.groupSlug,
    number_phone: params.numberPhone,
    ip_address: params.ipAddress,
    user_agent: params.userAgent,
    device_type: params.deviceType,
    referrer: params.referrer,
  })

  if (error) throw error
}

export async function getClicksByGroupId(groupId: string, limit = 100): Promise<Click[]> {
  const { data, error } = await supabase
    .from("clicks")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}
