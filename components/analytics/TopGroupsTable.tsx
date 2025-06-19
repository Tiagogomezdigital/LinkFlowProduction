interface TopGroupsTableProps {
  groups: any[];
}

export function TopGroupsTable({ groups }: TopGroupsTableProps) {
  return (
    <table className="min-w-full text-left text-sm">
      <thead>
        <tr>
          <th className="px-4 py-2">Grupo</th>
          <th className="px-4 py-2">Total Cliques</th>
          <th className="px-4 py-2">Ativo?</th>
        </tr>
      </thead>
      <tbody>
        {groups.map((g, i) => (
          <tr key={g.group_id || g.id || i} className="border-t border-white/10">
            <td className="px-4 py-2">{g.group_name || g.name}</td>
            <td className="px-4 py-2">{g.total_clicks ?? '-'}</td>
            <td className="px-4 py-2">{g.is_active ? 'Sim' : 'Não'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
} 