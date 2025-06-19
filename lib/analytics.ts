import { createClient } from "@supabase/supabase-js";
import { ENV_CONFIG } from "@/lib/env-config";

const supabase = createClient(ENV_CONFIG.SUPABASE_URL, ENV_CONFIG.SUPABASE_ANON_KEY);

export async function getDashboardStats() {
  // Exemplo: total de cliques, cliques do dia, top grupos
  const { data: totalClicks } = await supabase.from("clicks").select("id", { count: "exact", head: true });
  const { data: todayClicks } = await supabase.rpc("get_today_clicks"); // Supondo função SQL
  const { data: topGroups } = await supabase.from("group_stats").select("*").order("total_clicks", { ascending: false }).limit(10);
  return {
    totalClicks: totalClicks?.length || 0,
    todayClicks: todayClicks || 0,
    topGroups: topGroups || [],
    // Adicione mais métricas conforme necessário
  };
}

export async function getTrends(days = 7) {
  // Exemplo: tendências dos últimos 7 dias
  const { data } = await supabase.rpc("get_clicks_trends", { days }); // Supondo função SQL
  return data || [];
} 