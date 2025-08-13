import { supabase } from "@/lib/supabase"
import type { WhatsAppNumber } from "@/lib/types"

// Função principal que estava faltando
export async function getAllNumbers(): Promise<WhatsAppNumber[]> {
  try {
    const { data, error } = await supabase
      .from("whatsapp_numbers")
      .select(`*, groups!whatsapp_numbers_group_id_fkey(name)`)
      .order("created_at", { ascending: false })

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Error fetching all numbers:", error)
      }
      throw error
    }

    return data || []
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("Error in getAllNumbers:", error)
    }
    return []
  }
}

export async function getNumbersByGroupId(groupId: string): Promise<WhatsAppNumber[]> {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log("Fetching numbers for group:", groupId)
    }

    const { data, error } = await supabase.rpc("get_numbers_by_group_id", {
      p_group_id: groupId,
    })

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Error fetching numbers by group:", error)
      }
      // Fallback para query direta se a função falhar
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("whatsapp_numbers")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false })

      if (fallbackError) {
        if (process.env.NODE_ENV !== 'production') {
          console.error("Fallback query also failed:", fallbackError)
        }
        throw fallbackError
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log("Using fallback data:", fallbackData)
      }
      return fallbackData || []
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log("Numbers fetched successfully:", data)
    }
    return data || []
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("Error in getNumbersByGroupId:", error)
    }
    return []
  }
}

export async function getNumbers(groupId?: string): Promise<WhatsAppNumber[]> {
  try {
    let query = supabase.from("whatsapp_numbers").select("*").order("created_at", { ascending: false })

    if (groupId) {
      query = query.eq("group_id", groupId)
    }

    const { data, error } = await query

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Error fetching numbers:", error)
      }
      throw error
    }

    return data || []
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("Error in getNumbers:", error)
    }
    return []
  }
}

// Função que usa a função SQL get_next_number
export async function getNextNumber(groupSlug: string): Promise<WhatsAppNumber | null> {
  try {
    const { data, error } = await supabase.rpc("get_next_number", {
      group_slug: groupSlug,
    })

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Error getting next number:", error)
      }
      throw error
    }

    return data && data.length > 0 ? data[0] : null
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("Error in getNextNumber:", error)
    }
    return null
  }
}

export async function createNumber(numberData: {
  number: string
  description: string
  group_id: string
  is_active: boolean
  custom_message?: string
}): Promise<WhatsAppNumber> {
  try {
    const { data, error } = await supabase
      .from("whatsapp_numbers")
      .insert([
        {
          phone: numberData.number,
          name: numberData.description,
          group_id: numberData.group_id,
          is_active: numberData.is_active,
          custom_message: numberData.custom_message || null,
        },
      ])
      .select()
      .single()

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Error creating number:", error)
      }
      throw error
    }

    return data
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("Error in createNumber:", error)
    }
    throw error
  }
}

export async function updateNumber(id: string, updates: Partial<WhatsAppNumber>): Promise<WhatsAppNumber> {
  try {
    const { data, error } = await supabase.from("whatsapp_numbers").update(updates).eq("id", id).select().single()

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Error updating number:", error)
      }
      throw error
    }

    return data
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("Error in updateNumber:", error)
    }
    throw error
  }
}

export async function deleteNumber(id: string): Promise<void> {
  try {
    const { data, error } = await supabase.from("whatsapp_numbers").delete().eq("id", id).select()

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Error deleting number:", error)
      }
      throw error
    }

    if (!data || data.length === 0) {
      throw new Error("A exclusão falhou. Verifique as permissões ou se o número ainda existe.")
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("Error in deleteNumber:", error)
    }
    throw error
  }
}

export async function toggleNumberStatus(id: string, isActive: boolean): Promise<WhatsAppNumber> {
  try {
    const { data, error } = await supabase
      .from("whatsapp_numbers")
      .update({ is_active: isActive })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error("Error toggling number status:", error)
      }
      throw error
    }

    return data
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("Error in toggleNumberStatus:", error)
    }
    throw error
  }
}
