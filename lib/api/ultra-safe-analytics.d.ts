export interface GroupAnalyticsData {
  group: {
    id: string
    name: string
    slug: string
    description: string | null
    is_active: boolean
    created_at: string
  }
  stats: {
    total_clicks: number
    clicks_today: number
    clicks_this_week: number
    clicks_this_month: number
    unique_ips: number
    total_numbers: number
    active_numbers: number
    avg_clicks_per_day: number
    last_click_at: string | null
  }
  topNumbers: Array<{
    number_id: string
    phone: string
    name: string
    click_count: number
    last_click: string | null
    last_used_at: string | null
  }>
  clicksByHour: Array<{
    hour_of_day: number
    click_count: number
  }>
  recentClicks: Array<{
    click_id: string
    click_date: string
    number_phone: string
    number_name: string
    ip_address: string
    user_agent: string
    device_type: string
    referrer: string
  }>
}

export interface AnalyticsResponse {
  success: boolean
  data: GroupAnalyticsData | null
  error?: string
}

export interface ExportResponse {
  success: boolean
  data?: any
  filename?: string
  error?: string
}

export function getUltraSafeGroupAnalytics(groupId: string): Promise<AnalyticsResponse>
export function exportUltraSafeGroupData(groupId: string): Promise<ExportResponse> 