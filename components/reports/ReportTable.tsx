interface ReportTableProps {
  data: any[];
}

export function ReportTable({ data }: ReportTableProps) {
  if (!data.length) return <div>Nenhum dado encontrado.</div>;
  const headers = Object.keys(data[0]);
  return (
    <table className="min-w-full text-left text-sm">
      <thead>
        <tr>
          {headers.map((h) => (
            <th key={h} className="px-4 py-2 capitalize">{h.replace(/_/g, ' ')}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="border-t border-white/10">
            {headers.map((h) => (
              <td key={h} className="px-4 py-2">{String(row[h])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
} 