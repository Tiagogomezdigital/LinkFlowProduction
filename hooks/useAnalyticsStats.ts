import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/analytics";

export function useAnalyticsStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getDashboardStats()
      .then((data) => setStats(data))
      .catch((err) => setError(err.message || "Erro ao buscar métricas"))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading, error };
} 