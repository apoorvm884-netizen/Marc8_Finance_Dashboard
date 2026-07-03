import { motion } from 'framer-motion';
import { ChartCard } from '@/components/shared/chart-card';
import type { TopVehicles } from '@/types/dashboard';
import { Award, TrendingDown, Zap, BarChart3 } from 'lucide-react';

interface Props {
  topVehicles: TopVehicles | null;
  loading: boolean;
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function RankItem({ rank, label, value, valueColor, suffix, index }: { rank: number; label: string; value: number; valueColor: string; suffix?: string; index: number }) {
  const rankColors = [
    'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'bg-gray-300/10 text-gray-300 border-gray-400/20',
    'bg-orange-500/10 text-orange-400 border-orange-500/20',
  ];
  const rankClass = rank <= 3 ? rankColors[rank - 1] : 'bg-accent-500/10 text-accent-400';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group flex items-center gap-3 rounded-lg bg-surface-light px-3 py-2.5 transition-all duration-200 hover:bg-surface-light/80 hover:scale-[1.01]"
    >
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold border ${rankClass}`}>
        {rank}
      </span>
      <span className="flex-1 text-sm text-secondary-300 truncate group-hover:text-white transition-colors">{label}</span>
      <span className={`text-sm font-medium font-mono tabular-nums ${valueColor}`}>
        {suffix || '₹'}{Math.round(value).toLocaleString('en-IN')}
      </span>
    </motion.div>
  );
}

export function DashboardTopVehicles({ topVehicles, loading }: Props) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <motion.div variants={item}>
        <ChartCard title="Top Performing Vehicles" subtitle="Highest revenue generators" loading={loading} action={<Award className="h-4 w-4 text-emerald-400" />}>
          {topVehicles && topVehicles.top_performing.length > 0 ? (
            <div className="space-y-2">
              {topVehicles.top_performing.map((v, i) => (
                <RankItem key={v.vehicle_id} rank={i + 1} label={v.vehicle_number} value={v.total_revenue ?? 0} valueColor="text-emerald-400" index={i} />
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center"><p className="text-sm text-secondary-500">No data</p></div>
          )}
        </ChartCard>
      </motion.div>
      <motion.div variants={item}>
        <ChartCard title="Highest Expense Vehicles" subtitle="Vehicles with most costs" loading={loading} action={<TrendingDown className="h-4 w-4 text-red-400" />}>
          {topVehicles && topVehicles.top_expense.length > 0 ? (
            <div className="space-y-2">
              {topVehicles.top_expense.map((v, i) => (
                <RankItem key={v.vehicle_id} rank={i + 1} label={v.vehicle_number} value={v.total_expense ?? 0} valueColor="text-red-400" index={i} />
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center"><p className="text-sm text-secondary-500">No data</p></div>
          )}
        </ChartCard>
      </motion.div>
      <motion.div variants={item}>
        <ChartCard title="Most Profitable Vehicles" subtitle="Highest net profit vehicles" loading={loading} action={<Zap className="h-4 w-4 text-emerald-400" />}>
          {topVehicles && topVehicles.most_profitable.length > 0 ? (
            <div className="space-y-2">
              {topVehicles.most_profitable.map((v, i) => (
                <RankItem key={v.vehicle_id} rank={i + 1} label={v.vehicle_number} value={v.profit ?? 0} valueColor={v.profit != null && v.profit >= 0 ? 'text-emerald-400' : 'text-red-400'} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center"><p className="text-sm text-secondary-500">No data</p></div>
          )}
        </ChartCard>
      </motion.div>
      <motion.div variants={item}>
        <ChartCard title="Platform Ranking" subtitle="Platforms by total revenue" loading={loading} action={<BarChart3 className="h-4 w-4 text-blue-400" />}>
          {topVehicles && topVehicles.platform_ranking.length > 0 ? (
            <div className="space-y-2">
              {topVehicles.platform_ranking.map((p, i) => (
                <RankItem key={p.platform_id} rank={i + 1} label={p.platform_name} value={p.total} valueColor="text-blue-400" index={i} />
              ))}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center"><p className="text-sm text-secondary-500">No data</p></div>
          )}
        </ChartCard>
      </motion.div>
    </div>
  );
}
