import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { vehicleService } from '@/services/vehicle.service';
import { outstandingService } from '@/services/outstanding.service';
import type { Vehicle } from '@/types/vehicle';
import type { VehicleFinancialIntelligence } from '@/types/outstanding';
import { MetricCard } from '@/components/shared/metric-card';
import { ChartCard } from '@/components/shared/chart-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/error-state';
import {
  IndianRupee, TrendingUp, TrendingDown, ArrowLeft, Car,
  FileText, Calendar,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function VehicleFinancialsPage() {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [financials, setFinancials] = useState<VehicleFinancialIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      vehicleService.findById(id),
      outstandingService.getVehicleFinancialIntelligence(id),
    ]).then(([v, f]) => {
      setVehicle(v as unknown as Vehicle);
      setFinancials(f as unknown as VehicleFinancialIntelligence);
    }).catch((err) => {
      setError(err instanceof Error ? err.message : 'Failed to load');
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-container space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl bg-surface-light" />)}
        </div>
        <Skeleton className="h-80 rounded-xl bg-surface-light" />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="page-container">
        <ErrorState title="Failed to load" message={error || 'Vehicle not found'} />
      </div>
    );
  }

  const docItems = [
    { label: 'Insurance', date: financials?.documents_due.insurance },
    { label: 'Permit', date: financials?.documents_due.permit },
    { label: 'Road Tax', date: financials?.documents_due.road_tax },
    { label: 'Fitness', date: financials?.documents_due.fitness },
    { label: 'Pollution', date: financials?.documents_due.pollution },
    { label: 'RC', date: financials?.documents_due.rc },
  ];

  const isDocExpired = (date: string | null | undefined) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const revenueData = financials?.revenue_trend.map(r => r.total) || [];
  const expenseData = financials?.expense_trend.map(r => r.total) || [];

  return (
    <div className="page-container">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/masters/vehicles">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <Car className="h-6 w-6 text-accent-500" />
            <h1 className="text-2xl font-bold text-white">{vehicle.vehicle_number}</h1>
            <Badge variant="info">{vehicle.vehicle_name}</Badge>
          </div>
          <p className="text-sm text-secondary-400 mt-1">
            {vehicle.brand} {vehicle.model} {vehicle.year} &middot; {vehicle.fuel_type} &middot; {vehicle.transmission}
          </p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={<IndianRupee className="h-5 w-5 text-emerald-500" />}
            label="Total Revenue"
            value={`₹${(financials?.revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          />
          <MetricCard
            icon={<IndianRupee className="h-5 w-5 text-red-500" />}
            label="Total Expense"
            value={`₹${(financials?.expense || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          />
          <MetricCard
            icon={<IndianRupee className="h-5 w-5 text-orange-500" />}
            label="Outstanding"
            value={`₹${(financials?.outstanding || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          />
          <MetricCard
            icon={financials && financials.profit >= 0 ? <TrendingUp className="h-5 w-5 text-emerald-500" /> : <TrendingDown className="h-5 w-5 text-red-500" />}
            label="Net Profit"
            value={`₹${(financials?.profit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            subtitle={`Net Margin: ${(financials?.net_margin || 0).toFixed(2)}%`}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Revenue Trend" loading={!financials}>
            {financials && (
              <div className="space-y-2">
                {financials.revenue_trend.slice(-6).map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <span className="text-sm text-secondary-400">{r.month}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-emerald-500/30" style={{ width: `${Math.max(4, (r.total / Math.max(...revenueData)) * 100)}px` }} />
                      <span className="text-sm font-medium text-white">₹{r.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>

          <ChartCard title="Expense Trend" loading={!financials}>
            {financials && (
              <div className="space-y-2">
                {financials.expense_trend.slice(-6).map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <span className="text-sm text-secondary-400">{r.month}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-red-500/30" style={{ width: `${Math.max(4, (r.total / Math.max(...expenseData)) * 100)}px` }} />
                      <span className="text-sm font-medium text-white">₹{r.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-secondary-400" />
            Documents & Compliance
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {docItems.map((doc) => {
              const expired = isDocExpired(doc.date);
              return (
                <div key={doc.label} className="flex items-center justify-between rounded-lg border border-border bg-surface-light p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className={`h-4 w-4 ${expired ? 'text-red-500' : 'text-emerald-500'}`} />
                    <div>
                      <p className="text-sm text-secondary-300">{doc.label}</p>
                      <p className={`text-xs ${expired ? 'text-red-400' : 'text-secondary-500'}`}>
                        {doc.date ? formatDate(doc.date) : 'Not set'}
                      </p>
                    </div>
                  </div>
                  {expired && <Badge variant="destructive" size="sm">Expired</Badge>}
                  {doc.date && !expired && new Date(doc.date) > new Date() && (
                    <Badge variant="success" size="sm">Valid</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
