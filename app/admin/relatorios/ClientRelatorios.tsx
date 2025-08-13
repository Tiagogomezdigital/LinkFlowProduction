"use client";

import { useState } from "react";
import { useGroups } from "@/hooks/useGroups";
import { generateCSV } from "@/lib/reports";
import { MultiSelect } from "@/components/ui/multiselect";
import { useReportData } from "@/hooks/useReportData";

function somarCliquesPorGrupo(data: any[], groups: any[]) {
  // Agrupa por group_id e soma os cliques
  const soma: Record<string, number> = {};
  data.forEach((item) => {
    if (!item.group_id) return;
    soma[item.group_id] = (soma[item.group_id] || 0) + 1;
  });
  // Monta array com nome do grupo e total
  return Object.entries(soma).map(([group_id, total]) => {
    const group = groups.find((g) => g.id === group_id);
    return {
      group: group ? group.name : group_id,
      total_cliques: total,
    };
  });
}

export default function ClientRelatorios() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [filters, setFilters] = useState({ startDate: "", endDate: "", groupIds: [] as string[] });
  const [applied, setApplied] = useState(false);
  const { groups, loading: loadingGroups } = useGroups();
  const { data, loading, error } = useReportData(filters);

  function handleApplyFilters() {
    if (!selectedDate) return;
    const startDate = selectedDate + 'T00:00:00';
    const endDate = selectedDate + 'T23:59:59.999';
    setFilters({
      startDate,
      endDate,
      groupIds: selectedGroups,
    });
    setApplied(true);
  }

  function handleExport() {
    if (typeof document === 'undefined') return;
    
    const dados = somarCliquesPorGrupo(data, groups);
    const csv = generateCSV(dados);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-cliques-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const groupOptions = groups.map((g) => ({ value: g.id, label: g.name }));
  const dados = somarCliquesPorGrupo(data, groups);

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Relatórios de Cliques</h1>
      {/* Filtros */}
      <section className="mb-8">
        <div className="bg-white/10 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <label>Dia:</label>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="rounded px-2 py-1" />
            <MultiSelect
              options={groupOptions}
              value={selectedGroups}
              onChange={setSelectedGroups}
              placeholder="Selecione os grupos"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleApplyFilters} className="bg-green-600 text-white px-4 py-2 rounded">Gerar Relatório</button>
            <button onClick={handleExport} className="bg-blue-600 text-white px-4 py-2 rounded">Exportar CSV</button>
          </div>
        </div>
      </section>
      {/* Tabela de dados */}
      <section>
        <div className="bg-white/10 rounded-lg p-4">
          {loading && <div>Carregando dados...</div>}
          {error && <div className="text-red-500">Erro: {error}</div>}
          {!loading && !error && applied && (
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left px-2 py-1">Grupo</th>
                  <th className="text-left px-2 py-1">Total de Cliques</th>
                </tr>
              </thead>
              <tbody>
                {dados.length === 0 && (
                  <tr><td colSpan={2} className="text-center py-2">Nenhum dado encontrado</td></tr>
                )}
                {dados.map((row) => (
                  <tr key={row.group}>
                    <td className="px-2 py-1">{row.group}</td>
                    <td className="px-2 py-1">{row.total_cliques}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}