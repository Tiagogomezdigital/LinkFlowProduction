export interface WhatsAppNumber {
  id: string
  group_id: string
  phone: string
  name?: string
  custom_message?: string
  is_active: boolean
  last_used_at?: string
  created_at: string
  updated_at: string
  groups?: {
    name: string
  }
}

export interface Group {
  id: string
  name: string
  slug: string
  description?: string
  default_message?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Click {
  id: string
  group_id: string
  number_id: string
  ip_address?: string
  user_agent?: string
  device_type?: string
  referrer?: string
  created_at: string
}

export interface GroupStats {
  group_id: string
  group_name: string
  group_slug: string
  total_numbers: number
  active_numbers: number
  total_clicks: number
  clicks_today: number
  clicks_this_week: number
  clicks_this_month: number
  last_click_at?: string
}

export interface DailyStats {
  date: string
  clicks: number
}

export interface DeviceStats {
  device_type: string
  count: number
}

export interface GroupClickStats {
  group_id: string
  group_name: string
  clicks: number
}
