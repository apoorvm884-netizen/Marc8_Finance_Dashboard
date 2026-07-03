import { motion } from 'framer-motion';
import { REPORT_TYPE_LABELS } from '@/types/report';
import type { ReportType } from '@/types/report';
import { Calendar, CalendarDays, CalendarRange, CalendarCheck, CalendarClock, SlidersHorizontal, Truck, Building2, Percent, LineChart, BookOpen, Tags, CreditCard, Gauge, TrendingUp, IndianRupee, Clock, FileText, BarChart3, PieChart } from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode | undefined> = {
  Calendar: <Calendar className="h-5 w-5" />,
  CalendarDays: <CalendarDays className="h-5 w-5" />,
  CalendarRange: <CalendarRange className="h-5 w-5" />,
  CalendarCheck: <CalendarCheck className="h-5 w-5" />,
  CalendarClock: <CalendarClock className="h-5 w-5" />,
  SlidersHorizontal: <SlidersHorizontal className="h-5 w-5" />,
  Truck: <Truck className="h-5 w-5" />,
  Building2: <Building2 className="h-5 w-5" />,
  Percent: <Percent className="h-5 w-5" />,
  LineChart: <LineChart className="h-5 w-5" />,
  BookOpen: <BookOpen className="h-5 w-5" />,
  Tags: <Tags className="h-5 w-5" />,
  CreditCard: <CreditCard className="h-5 w-5" />,
  Gauge: <Gauge className="h-5 w-5" />,
  TrendingUp: <TrendingUp className="h-5 w-5" />,
  IndianRupee: <IndianRupee className="h-5 w-5" />,
  Clock: <Clock className="h-5 w-5" />,
  FileText: <FileText className="h-5 w-5" />,
  BarChart3: <BarChart3 className="h-5 w-5" />,
  PieChart: <PieChart className="h-5 w-5" />,
};

const CATEGORIES = [
  { label: 'Financial Overview', types: ['daily_financial', 'weekly_financial', 'monthly_financial', 'yearly_financial', 'custom_range'] as ReportType[] },
  { label: 'Vehicle Reports', types: ['vehicle_revenue', 'vehicle_expense', 'vehicle_profit', 'vehicle_profitability'] as ReportType[] },
  { label: 'Platform Reports', types: ['platform_revenue', 'platform_commission', 'platform_net_revenue', 'platform_profitability', 'revenue_by_platform', 'revenue_by_category'] as ReportType[] },
  { label: 'Outstanding Reports', types: ['outstanding_collection', 'outstanding_report', 'upcoming_payment', 'cash_requirement', 'outstanding_ageing', 'payment_calendar'] as ReportType[] },
  { label: 'Transaction Reports', types: ['journal_collection', 'expense_category', 'expense_payment_mode'] as ReportType[] },
  { label: 'Fleet Reports', types: ['fleet_performance', 'fleet_utilization'] as ReportType[] },
  { label: 'Executive Reports', types: ['profit_loss', 'executive_summary'] as ReportType[] },
];

const IMPORTED_ICONS: Record<string, string> = {
  daily_financial: 'Calendar',
  weekly_financial: 'CalendarDays',
  monthly_financial: 'CalendarRange',
  yearly_financial: 'CalendarCheck',
  custom_range: 'SlidersHorizontal',
  vehicle_revenue: 'Truck',
  vehicle_expense: 'Truck',
  vehicle_profit: 'Truck',
  platform_revenue: 'Building2',
  platform_commission: 'Percent',
  platform_net_revenue: 'LineChart',
  journal_collection: 'BookOpen',
  expense_category: 'Tags',
  expense_payment_mode: 'CreditCard',
  fleet_performance: 'Gauge',
  profit_loss: 'LineChart',
  fleet_utilization: 'Gauge',
  outstanding_collection: 'BookOpen',
  outstanding_report: 'CalendarClock',
  upcoming_payment: 'CalendarCheck',
  vehicle_profitability: 'TrendingUp',
  platform_profitability: 'Building2',
  cash_requirement: 'IndianRupee',
  outstanding_ageing: 'Clock',
  payment_calendar: 'CalendarDays',
  revenue_by_platform: 'BarChart3',
  revenue_by_category: 'PieChart',
  executive_summary: 'FileText',
};

interface Props {
  selected: ReportType | null;
  onSelect: (type: ReportType) => void;
}

export function ReportTypeSelector({ selected, onSelect }: Props) {
  return (
    <div className="space-y-6">
      {CATEGORIES.map((cat) => (
        <div key={cat.label}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-secondary-400">{cat.label}</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {cat.types.map((type) => {
              const isSelected = selected === type;
              return (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(type)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    isSelected
                      ? 'border-accent-500/50 bg-accent-500/10 text-white'
                      : 'border-border bg-card text-secondary-300 hover:border-accent-500/30 hover:text-white'
                  }`}
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isSelected ? 'bg-accent-500/20 text-accent-400' : 'bg-surface-light text-secondary-400'
                  }`}>
                    {ICON_MAP[IMPORTED_ICONS[type] ?? '']}
                  </div>
                  <span className="text-sm font-medium">{REPORT_TYPE_LABELS[type]}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
