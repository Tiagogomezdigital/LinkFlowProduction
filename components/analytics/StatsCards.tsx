interface StatsCardsProps {
  stats: {
    totalClicks: number;
    todayClicks: number;
    topGroups: any[];
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white/10 rounded-lg p-4 h-24 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold">Total de Cliques</span>
        <span className="text-2xl font-bold">{stats.totalClicks}</span>
      </div>
      <div className="bg-white/10 rounded-lg p-4 h-24 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold">Cliques Hoje</span>
        <span className="text-2xl font-bold">{stats.todayClicks}</span>
      </div>
      <div className="bg-white/10 rounded-lg p-4 h-24 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold">Top Grupos</span>
        <span className="text-2xl font-bold">{stats.topGroups.length}</span>
      </div>
    </div>
  );
} 