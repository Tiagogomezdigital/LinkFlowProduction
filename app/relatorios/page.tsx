import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/supabase-auth";
import { useState } from "react";

export default async function RelatoriosPage() {
  const session = await getUserSession();
  if (!session) return redirect("/login");
  return <ClientRelatorios />;
}

'use client';
import { useReportData } from "@/hooks/useReportData";
import { ReportTable } from "@/components/reports/ReportTable";
import { generateCSV } from "@/lib/reports";

function ClientRelatorios() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [groupId, setGroupId] = useState("");
  const filters = { startDate, endDate, groupIds: groupId ? [groupId] : undefined };
  const { data, count, loading, error } = useReportData(filters);

  function handleExport() {
    const csv = generateCSV(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-cliques-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Relatórios de Cliques</h1>
      {/* Filtros básicos */}
      <section className="mb-8">
        <div className="bg-white/10 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 items-center">
            <label>Início:</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="rounded px-2 py-1" />
            <label>Fim:</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="rounded px-2 py-1" />
            <label>Grupo:</label>
            <input type="text" value={groupId} onChange={e => setGroupId(e.target.value)} placeholder="ID do grupo" className="rounded px-2 py-1" />
          </div>
          <button onClick={handleExport} className="bg-blue-600 text-white px-4 py-2 rounded">Exportar CSV</button>
        </div>
      </section>
      {/* Tabela de dados */}
      <section>
        <div className="bg-white/10 rounded-lg p-4">
          {loading && <div>Carregando dados...</div>}
          {error && <div className="text-red-500">Erro: {error}</div>}
          {!loading && !error && <ReportTable data={data} />}
        </div>
      </section>
    </main>
  );
} 