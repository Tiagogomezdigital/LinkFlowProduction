import { getSupabaseClient } from "@/lib/supabase";

const supabase = getSupabaseClient();

export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  groupIds?: string[];
}

export async function getReportData({ startDate, endDate, groupIds }: ReportFilter) {
  // Exemplo: busca de cliques filtrados
  let query = supabase.from("clicks").select("*", { count: "exact" });
  if (startDate) query = query.gte("created_at", startDate);
  if (endDate) query = query.lte("created_at", endDate);
  if (groupIds && groupIds.length) query = query.in("group_id", groupIds);
  const { data, count } = await query;
  return { data, count };
}

export function generateCSV(data: any[]): string {
  // Geração simples de CSV client-side
  if (!data?.length) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map((row: any) => headers.map(h => JSON.stringify(row[h] ?? "")).join(","));
  return [headers.join(","), ...rows].join("\n");
}