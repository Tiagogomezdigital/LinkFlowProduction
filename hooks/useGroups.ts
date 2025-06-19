import { useEffect, useState } from "react";
import { getGroups } from "@/lib/api/groups";
import type { Group } from "@/lib/types";

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getGroups()
      .then(setGroups)
      .catch((err) => setError(err.message || "Erro ao buscar grupos"))
      .finally(() => setLoading(false));
  }, []);

  return { groups, loading, error };
} 