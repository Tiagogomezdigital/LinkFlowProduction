import { useEffect, useState } from "react";
import { getReportData, ReportFilter } from "@/lib/reports";

export function useReportData(filters: ReportFilter) {
  const [data, setData] = useState<any[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getReportData(filters)
      .then((res) => {
        setData(res.data || []);
        setCount(res.count || 0);
      })
      .catch((err) => setError(err.message || "Erro ao buscar dados"))
      .finally(() => setLoading(false));
  }, [JSON.stringify(filters)]);

  return { data, count, loading, error };
} 