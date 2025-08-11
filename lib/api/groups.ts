import { supabase } from "@/lib/supabase"
import type { Group } from "@/lib/types"

export async function getGroups(): Promise<Group[]> {
  try {
    const { data, error } = await supabase.from("groups").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching groups:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error in getGroups:", error)
    return []
  }
}

export async function getGroupById(id: string): Promise<Group | null> {
  try {
    const { data, error } = await supabase.from("groups").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching group:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in getGroupById:", error)
    return null
  }
}

export async function getGroupBySlug(slug: string): Promise<Group | null> {
  try {
    const { data, error } = await supabase.from("groups").select("*").eq("slug", slug).eq("is_active", true).single()

    if (error) {
      console.error("Error fetching group by slug:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in getGroupBySlug:", error)
    return null
  }
}

export async function createGroup(groupData: {
  name: string
  slug: string
  description?: string
  is_active: boolean
}): Promise<Group> {
  try {
    const { data, error } = await supabase.from("groups").insert([groupData]).select().single()

    if (error) {
      console.error("Error creating group:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in createGroup:", error)
    throw error
  }
}

export async function updateGroup(id: string, updates: Partial<Group>): Promise<Group> {
  try {
    const { data, error } = await supabase.from("groups").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Error updating group:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in updateGroup:", error)
    throw error
  }
}

export async function deleteGroup(id: string): Promise<void> {
  try {
    const { data, error } = await supabase.from("groups").delete().eq("id", id).select()

    if (error) {
      console.error("Error deleting group:", error)
      throw error
    }

    if (!data || data.length === 0) {
      throw new Error("A exclusão falhou. Verifique as permissões ou se o grupo ainda existe.")
    }
  } catch (error) {
    console.error("Error in deleteGroup:", error)
    throw error
  }
}

// Função que usa a função SQL register_click
export async function registerClick(clickData: {
  groupSlug: string
  numberPhone: string
  ipAddress?: string
  userAgent?: string
  deviceType?: string
  referrer?: string
}): Promise<void> {
  try {
    const { error } = await supabase.rpc("register_click", {
      group_slug: clickData.groupSlug,
      number_phone: clickData.numberPhone,
      ip_address: clickData.ipAddress || null,
      user_agent: clickData.userAgent || null,
      device_type: clickData.deviceType || null,
      referrer: clickData.referrer || null,
    })

    if (error) {
      console.error("Error registering click:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in registerClick:", error)
    throw error
  }
}
