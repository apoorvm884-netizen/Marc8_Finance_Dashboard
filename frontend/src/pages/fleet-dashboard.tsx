import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNotification } from '@/hooks/use-notification';
import { maintenanceService } from '@/services/maintenance.service';
import { schedulerService } from '@/services/scheduler.service';
import { vehicleService } from '@/services/vehicle.service';
import type { FleetHealth } from '@/types/maintenance';
import type { UpcomingServicesResult } from '@/types/scheduler';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
  RefreshCw,
  Truck,
  CheckCircle,
  Wrench,
  AlertTriangle,
  CalendarClock,
  Activity,
  FileText,
  Fuel,
  Shield,
  Gauge,
  ClipboardList,
  Building2,
  ArrowRight,
} from 'lucide-react';

function HealthScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const scoreColor = score > 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90" role="img" aria-label={`Fleet health score: ${score} out of 100`}>
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-surface-lighter"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={scoreColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-xs text-secondary-400">out of 100</span>
      </div>
    </div>
  );
}

const documentTypeConfig: {
  key: keyof FleetHealth;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { key: 'insurance_due', label: 'Insurance Due', icon: Shield, color: 'text-red-400' },
  { key: 'permit_due', label: 'Permit Due', icon: FileText, color: 'text-amber-400' },
  { key: 'fitness_due', label: 'Fitness Due', icon: Gauge, color: 'text-blue-400' },
  { key: 'pollution_due', label: 'Pollution Due', icon: Fuel, color: 'text-emerald-400' },
  { key: 'rc_due', label: 'RC Due', icon: ClipboardList, color: 'text-purple-400' },
];

const quickLinks = [
  { label: 'Fleet Master', href: '/masters/vehicles', icon: Truck },
  { label: 'Maintenance Records', href: '/maintenance', icon: Wrench },
  { label: 'Service Schedules', href: '/service-schedules', icon: CalendarClock },
  { label: 'Vendors', href: '/vendors', icon: Building2 },
];

export default function FleetDashboardPage() {
  const { notify } = useNotification();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<FleetHealth | null>(null);
  const [upcomingData, setUpcomingData] = useState<UpcomingServicesResult | null>(null);
  const [vehiclesTotal, setVehiclesTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthRes, servicesRes, vehiclesRes] = await Promise.all([
        maintenanceService.getFleetHealth(),
        schedulerService.getUpcomingServices(),
        vehicleService.findAll({ page: 1, limit: 1 }),
      ]);
      setDashboardData(healthRes.data);
      setUpcomingData(servicesRes.data);
      setVehiclesTotal(vehiclesRes.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load fleet data';
      setError(message);
      notify.error(message);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const statCards: { label: string; value: string | number; icon: React.ElementType; color: string }[] = [
    { label: 'Total Vehicles', value: dashboardData?.total_vehicles ?? vehiclesTotal, icon: Truck, color: 'text-blue-400' },
    { label: 'Active Vehicles', value: dashboardData?.active ?? 0, icon: CheckCircle, color: 'text-emerald-400' },
    { label: 'In Maintenance', value: dashboardData?.in_maintenance ?? 0, icon: Wrench, color: 'text-amber-400' },
    { label: 'Expired Documents', value: dashboardData?.expired_documents ?? 0, icon: AlertTriangle, color: 'text-red-400' },
    { label: 'Upcoming Services', value: upcomingData?.next_30_days ?? 0, icon: CalendarClock, color: 'text-purple-400' },
    { label: 'Health Score', value: dashboardData ? `${dashboardData.health_score}%` : '-', icon: Activity, color: 'text-accent-400' },
  ];

  const upcomingList = (upcomingData?.upcoming ?? []) as any[];
  const overdueList = (upcomingData?.overdue ?? []) as any[];

  return (
    <div className="page-container">
      <PageHeader
        title="Fleet Operations Dashboard"
        description="Real-time fleet health, maintenance intelligence, and service scheduling"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={fetchData}
              loading={loading}
            >
              Refresh
            </Button>
          </div>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {loading && !dashboardData ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Fleet Health Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="flex items-center gap-4 pt-6">
                    <div className="h-12 w-12 animate-pulse rounded-lg bg-surface-lighter" />
                    <div className="space-y-2">
                      <div className="h-6 w-16 animate-pulse rounded bg-surface-lighter" />
                      <div className="h-3 w-24 animate-pulse rounded bg-surface-lighter" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : error && !dashboardData ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <AlertTriangle className="h-12 w-12 text-red-400" />
              <p className="text-sm text-secondary-400">{error}</p>
              <Button variant="outline" onClick={fetchData} loading={loading}>
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Fleet Health Score</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData ? (
                  <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                    <HealthScoreRing score={dashboardData.health_score} />
                    <div className="grid grid-cols-3 gap-8">
                      <div className="flex flex-col items-center sm:items-start">
                        <span className="text-2xl font-bold text-emerald-400">{dashboardData.active}</span>
                        <span className="text-xs text-secondary-400">Active Vehicles</span>
                      </div>
                      <div className="flex flex-col items-center sm:items-start">
                        <span className="text-2xl font-bold text-amber-400">{dashboardData.in_maintenance}</span>
                        <span className="text-xs text-secondary-400">In Maintenance</span>
                      </div>
                      <div className="flex flex-col items-center sm:items-start">
                        <span className="text-2xl font-bold text-secondary-400">{dashboardData.inactive}</span>
                        <span className="text-xs text-secondary-400">Inactive</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} hover>
                    <CardContent className="flex items-center gap-4 pt-6">
                      <div className={`rounded-lg bg-surface-light p-3 ${stat.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-secondary-400">{stat.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div>
              <h2 className="mb-4 text-lg font-semibold text-white">Documents Due</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {documentTypeConfig.map((doc) => {
                  const Icon = doc.icon;
                  const count = dashboardData ? dashboardData[doc.key] : 0;
                  return (
                    <Card key={doc.key}>
                      <CardContent className="flex items-center gap-3 pt-6">
                        <div className={`rounded-lg bg-surface-light p-2.5 ${doc.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-white">{count}</p>
                          <p className="text-xs text-secondary-400">{doc.label}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarClock className="h-5 w-5 text-emerald-400" />
                    Upcoming Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingList.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingList.map((service: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg bg-surface-light p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white">
                              {service.vehicle_number || 'Unknown'}
                            </p>
                            <p className="text-xs text-secondary-400">{service.service_type}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            {service.days_remaining != null && (
                              <Badge variant={service.days_remaining <= 7 ? 'warning' : 'success'} size="sm">
                                {service.days_remaining}d remaining
                              </Badge>
                            )}
                            {service.km_remaining != null && (
                              <span className="text-xs text-secondary-400">
                                {service.km_remaining.toLocaleString()} km
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-8">
                      <CalendarClock className="h-8 w-8 text-secondary-500" />
                      <p className="text-sm text-secondary-400">No upcoming services</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    Overdue Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {overdueList.length > 0 ? (
                    <div className="space-y-3">
                      {overdueList.map((service: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg bg-surface-light p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white">
                              {service.vehicle_number || 'Unknown'}
                            </p>
                            <p className="text-xs text-secondary-400">{service.service_type}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            {service.days_overdue != null && (
                              <Badge variant="destructive" size="sm">
                                {service.days_overdue}d overdue
                              </Badge>
                            )}
                            {service.km_overdue != null && (
                              <span className="text-xs text-secondary-400">
                                {service.km_overdue.toLocaleString()} km
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-8">
                      <CheckCircle className="h-8 w-8 text-emerald-400" />
                      <p className="text-sm text-secondary-400">No overdue services</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-semibold text-white">Quick Links</h2>
              <div className="flex flex-wrap gap-3">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Button
                      key={link.href}
                      variant="outline"
                      icon={<Icon className="h-4 w-4" />}
                      onClick={() => navigate(link.href)}
                    >
                      {link.label}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
