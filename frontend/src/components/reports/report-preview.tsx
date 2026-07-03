import { motion } from 'framer-motion';
import { ChartCard } from '@/components/shared/chart-card';
import type { ReportResult } from '@/types/report';
import { formatDate } from '@/lib/utils';

interface Props {
  report: ReportResult | null;
  loading: boolean;
}

const COLORS = ['bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-amber-500', 'bg-cyan-500', 'bg-rose-500'];

export function ReportPreview({ report, loading }: Props) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-sm text-secondary-500">Generating report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-sm text-secondary-500">Select a report type and generate</p>
      </div>
    );
  }

  const hasCharts = report.charts && report.charts.length > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{report.report_name}</h2>
            <p className="text-xs text-secondary-400">Generated {formatDate(report.generated_at)}</p>
          </div>
        </div>

        {report.summary && Object.keys(report.summary).length > 0 && (
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(report.summary).map(([key, value]) => (
              <div key={key} className="rounded-lg bg-surface-light p-3">
                <p className="text-xs text-secondary-400 mb-1">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                <p className="text-lg font-bold text-white">
                  {typeof value === 'number'
                    ? `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                    : String(value ?? '-')}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {report.columns.map((col) => (
                  <th key={col.key} className="px-3 py-2 text-left text-xs font-medium text-secondary-400 uppercase tracking-wider">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.rows.map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-surface-light/50 transition-colors">
                  {report.columns.map((col) => (
                    <td key={col.key} className="px-3 py-2 text-sm text-secondary-300">
                      {typeof row[col.key] === 'number'
                        ? `₹${(row[col.key] as number).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                        : String(row[col.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {hasCharts && report.charts && (
        <div className="grid gap-6 sm:grid-cols-2">
          {report.charts.map((chart, i) => (
            <ChartCard key={i} title={chart.title}>
              <div className="space-y-3">
                {chart.labels.map((label, j) => {
                  const total = chart.datasets[0]?.data.reduce((s, d) => s + d, 0) || 1;
                  const value = chart.datasets[0]?.data[j] || 0;
                  const pct = (value / total) * 100;
                  const color = COLORS[j % COLORS.length];
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full shrink-0 ${color}`} />
                      <span className="flex-1 text-sm text-secondary-300 truncate">{label}</span>
                      <div className="flex-1 h-4 bg-surface-light rounded-full overflow-hidden max-w-[100px]">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-20 text-right text-xs text-white font-mono">
                        ₹{Math.round(value).toLocaleString('en-IN')}
                      </span>
                      <span className="w-10 text-right text-xs text-secondary-500">{Math.round(pct)}%</span>
                    </div>
                  );
                })}
              </div>
            </ChartCard>
          ))}
        </div>
      )}
    </motion.div>
  );
}
