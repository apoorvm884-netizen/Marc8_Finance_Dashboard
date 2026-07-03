import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useNotification } from '@/hooks/use-notification';
import { settingsService } from '@/services/settings.service';
import { ROLES } from '@/config/constants';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Save, RotateCcw, Building2, LayoutDashboard, IndianRupee, Bell, UserCog, Shield } from 'lucide-react';
import type { CompanyProfile, DashboardSettings, FinancialSettings, NotificationSettings, UserPreferences, SecuritySettings } from '@/types/settings';

const TIMEZONES = [
  'Asia/Kolkata', 'Asia/Dubai', 'Asia/Dhaka', 'Asia/Karachi', 'Asia/Colombo', 'Asia/Kathmandu',
  'Asia/Singapore', 'Asia/Hong_Kong', 'Asia/Shanghai', 'Asia/Tokyo',
  'Europe/London', 'Europe/Berlin', 'Europe/Paris', 'Europe/Moscow',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Australia/Sydney', 'Australia/Melbourne', 'Pacific/Auckland', 'UTC',
];

const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD.MM.YYYY'];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD'];
const THEMES = ['dark', 'light', 'system'];
const LANGUAGES = ['en', 'hi', 'gu', 'mr', 'ta', 'te', 'bn'];
const TABLE_DENSITIES = ['compact', 'comfortable', 'spacious'];
const SIDEBAR_STATES = ['expanded', 'collapsed'];
const DASHBOARD_LAYOUTS = ['grid', 'list', 'custom'];
const DATE_RANGES = ['today', 'yesterday', 'last_7_days', 'last_30_days', 'last_90_days', 'this_month', 'last_month', 'this_year', 'custom'];
const DEFAULT_DASHBOARDS = ['executive', 'financial', 'operations', 'fleet'];
const PAGE_SIZES = [10, 20, 25, 50, 100];
const CHART_TYPES = [
  { key: 'revenue_trend', label: 'Revenue Trend' },
  { key: 'expense_breakdown', label: 'Expense Breakdown' },
  { key: 'profit_overview', label: 'Profit Overview' },
  { key: 'fleet_performance', label: 'Fleet Performance' },
  { key: 'cash_flow', label: 'Cash Flow' },
  { key: 'platform_comparison', label: 'Platform Comparison' },
];

const WIDGETS = [
  { key: 'kpi_cards', label: 'KPI Cards' },
  { key: 'trend_charts', label: 'Trend Charts' },
  { key: 'breakdown_charts', label: 'Breakdown Charts' },
  { key: 'recent_activity', label: 'Recent Activity' },
  { key: 'top_vehicles', label: 'Top Vehicles' },
  { key: 'alerts', label: 'Alerts' },
];

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const aKeys = Object.keys(aObj);
    const bKeys = Object.keys(bObj);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((k) => deepEqual(aObj[k], bObj[k]));
  }
  return false;
}

type SettingsTab = 'company' | 'dashboard' | 'financial' | 'notifications' | 'preferences' | 'security';

export default function SettingsPage() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [activeTab, setActiveTab] = useState<SettingsTab>('company');

  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [dashboard, setDashboard] = useState<DashboardSettings | null>(null);
  const [financial, setFinancial] = useState<FinancialSettings | null>(null);
  const [notifications, setNotifications] = useState<NotificationSettings | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [security, setSecurity] = useState<SecuritySettings | null>(null);

  const [original, setOriginal] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canEdit = !!user?.role && ([ROLES.SUPER_ADMIN, ROLES.ADMIN] as string[]).includes(user.role);

  const tabsRef = useRef<SettingsTab>(activeTab);

  useEffect(() => {
    tabsRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty()) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [company, dashboard, financial, notifications, preferences, security]);

  const isDirty = useCallback(() => {
    const tab = tabsRef.current;
    const orig = original[tab] as Record<string, unknown> | undefined;
    const current = getCurrent(tab) as Record<string, unknown> | undefined;
    return !deepEqual(orig, current);
  }, [original, tabsRef]);

  const getCurrent = useCallback((tab: SettingsTab): unknown => {
    switch (tab) {
      case 'company': return company;
      case 'dashboard': return dashboard;
      case 'financial': return financial;
      case 'notifications': return notifications;
      case 'preferences': return preferences;
      case 'security': return security;
    }
  }, [company, dashboard, financial, notifications, preferences, security]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await settingsService.getAll();
      const data = {
        company: all.company,
        dashboard: all.dashboard,
        financial: all.financial,
        notifications: all.notifications,
        preferences: all.preferences,
        security: all.security,
      };
      setCompany(data.company);
      setDashboard(data.dashboard);
      setFinancial(data.financial);
      setNotifications(data.notifications);
      setPreferences(data.preferences);
      setSecurity(data.security);
      setOriginal({ company: all.company, dashboard: all.dashboard, financial: all.financial, notifications: all.notifications, preferences: all.preferences, security: all.security } as Record<string, unknown>);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load settings';
      setError(msg);
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSave = useCallback(async (tab: SettingsTab) => {
    if (!canEdit) { notify.error('You do not have permission to update settings'); return; }
    setSaving(true);
    try {
      let updated: unknown;
      switch (tab) {
        case 'company':
          updated = await settingsService.updateCompany(company!);
          setCompany(updated as CompanyProfile);
          break;
        case 'dashboard': {
          const payload: Record<string, unknown> = { ...dashboard };
          payload.default_charts = dashboard?.default_charts;
          payload.widget_visibility = dashboard?.widget_visibility;
          payload.dashboard_layout = dashboard?.dashboard_layout;
          updated = await settingsService.updateDashboard(payload as unknown as Parameters<typeof settingsService.updateDashboard>[0]);
          setDashboard(updated as DashboardSettings);
          break;
        }
        case 'financial':
          updated = await settingsService.updateFinancial(financial!);
          setFinancial(updated as FinancialSettings);
          break;
        case 'notifications':
          updated = await settingsService.updateNotifications(notifications!);
          setNotifications(updated as NotificationSettings);
          break;
        case 'preferences':
          updated = await settingsService.updatePreferences(preferences!);
          setPreferences(updated as UserPreferences);
          break;
        case 'security':
          updated = await settingsService.updateSecurity(security!);
          setSecurity(updated as SecuritySettings);
          break;
      }
      setOriginal((prev) => ({ ...prev, [tab]: updated }));
      notify.success(`${tab.charAt(0).toUpperCase() + tab.slice(1)} settings saved`);
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }, [canEdit, company, dashboard, financial, notifications, preferences, security, notify]);

  const handleReset = useCallback((tab: SettingsTab) => {
    const orig = original[tab] as Record<string, unknown> | undefined;
    if (!orig) return;
    switch (tab) {
      case 'company': setCompany(orig as unknown as CompanyProfile); break;
      case 'dashboard': setDashboard(orig as unknown as DashboardSettings); break;
      case 'financial': setFinancial(orig as unknown as FinancialSettings); break;
      case 'notifications': setNotifications(orig as unknown as NotificationSettings); break;
      case 'preferences': setPreferences(orig as unknown as UserPreferences); break;
      case 'security': setSecurity(orig as unknown as SecuritySettings); break;
    }
  }, [original]);

  const updateCompanyField = (key: keyof CompanyProfile, value: string | null) => {
    setCompany((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const updateDashboardField = (key: keyof DashboardSettings, value: unknown) => {
    setDashboard((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const updateFinancialField = (key: keyof FinancialSettings, value: unknown) => {
    setFinancial((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const updateNotificationField = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const updatePreferenceField = (key: keyof UserPreferences, value: unknown) => {
    setPreferences((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const updateSecurityField = (key: keyof SecuritySettings, value: unknown) => {
    setSecurity((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const updatePasswordPolicy = (key: string, value: unknown) => {
    if (!security) return;
    setSecurity({
      ...security,
      password_policy: { ...security.password_policy, [key]: value },
    });
  };

  const updateWidgetVisibility = (key: string, value: boolean) => {
    if (!dashboard) return;
    setDashboard({
      ...dashboard,
      widget_visibility: { ...(dashboard.widget_visibility as Record<string, boolean>), [key]: value },
    });
  };

  const toggleChart = (chartKey: string) => {
    if (!dashboard) return;
    const charts = (dashboard.default_charts as unknown as string[]) || [];
    const updated = charts.includes(chartKey)
      ? charts.filter((c) => c !== chartKey)
      : [...charts, chartKey];
    setDashboard({ ...dashboard, default_charts: updated as unknown as DashboardSettings['default_charts'] });
  };

  if (loading) {
    return (
      <div className="page-container">
        <PageHeader title="Settings" description="System configuration" />
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-secondary-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error && !company) {
    return (
      <div className="page-container">
        <PageHeader title="Settings" description="System configuration" />
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Settings"
        description="Configure system-wide settings and preferences"
      />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SettingsTab)}>
          <TabsList className="mb-8 flex-wrap">
            <TabsTrigger value="company" className="gap-2">
              <Building2 className="h-4 w-4" /> Company
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="financial" className="gap-2">
              <IndianRupee className="h-4 w-4" /> Financial
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <UserCog className="h-4 w-4" /> Preferences
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" /> Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="company">
            <SettingsForm
              title="Company Profile"
              description="Manage your company information and regional preferences"
              dirty={!deepEqual(original.company, company)}
              canEdit={canEdit}
              saving={saving}
              onSave={() => handleSave('company')}
              onReset={() => handleReset('company')}
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input value={company?.company_name || ''} onChange={(e) => updateCompanyField('company_name', e.target.value || null)} placeholder="Enter company name" />
                </div>
                <div className="space-y-2">
                  <Label>Logo URL</Label>
                  <Input value={company?.logo_url || ''} onChange={(e) => updateCompanyField('logo_url', e.target.value || null)} placeholder="https://example.com/logo.png" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Address</Label>
                  <textarea
                    className="flex min-h-20 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white placeholder:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                    value={company?.address || ''}
                    onChange={(e) => updateCompanyField('address', e.target.value || null)}
                    placeholder="Enter company address"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={company?.phone || ''} onChange={(e) => updateCompanyField('phone', e.target.value || null)} placeholder="+91-1234567890" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={company?.email || ''} onChange={(e) => updateCompanyField('email', e.target.value || null)} placeholder="info@company.com" />
                </div>
                <div className="space-y-2">
                  <Label>GST Number</Label>
                  <Input value={company?.gst_number || ''} onChange={(e) => updateCompanyField('gst_number', e.target.value || null)} placeholder="22AAAAA0000A1Z5" />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={company?.currency || 'INR'} onValueChange={(v) => updateCompanyField('currency', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={company?.timezone || 'Asia/Kolkata'} onValueChange={(v) => updateCompanyField('timezone', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (<SelectItem key={tz} value={tz}>{tz}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select value={company?.date_format || 'DD/MM/YYYY'} onValueChange={(v) => updateCompanyField('date_format', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DATE_FORMATS.map((f) => (<SelectItem key={f} value={f}>{f}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Financial Year Start</Label>
                  <Input value={company?.financial_year_start || '01-04'} onChange={(e) => updateCompanyField('financial_year_start', e.target.value)} placeholder="DD-MM" />
                  <p className="text-xs text-secondary-500">Format: DD-MM (e.g., 01-04 for April 1st)</p>
                </div>
              </div>
            </SettingsForm>
          </TabsContent>

          <TabsContent value="dashboard">
            <SettingsForm
              title="Dashboard Settings"
              description="Configure default dashboard view and widget visibility"
              dirty={!deepEqual(original.dashboard, dashboard)}
              canEdit={canEdit}
              saving={saving}
              onSave={() => handleSave('dashboard')}
              onReset={() => handleReset('dashboard')}
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Default Dashboard</Label>
                  <Select value={dashboard?.default_dashboard || 'executive'} onValueChange={(v) => updateDashboardField('default_dashboard', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DEFAULT_DASHBOARDS.map((d) => (<SelectItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Date Range</Label>
                  <Select value={dashboard?.default_date_range || 'last_30_days'} onValueChange={(v) => updateDashboardField('default_date_range', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DATE_RANGES.map((r) => (<SelectItem key={r} value={r}>{r.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dashboard Layout</Label>
                  <Select
                    value={(dashboard?.dashboard_layout as Record<string, string>)?.layout || 'grid'}
                    onValueChange={(v) => updateDashboardField('dashboard_layout', { ...(dashboard?.dashboard_layout as Record<string, unknown> || {}), layout: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DASHBOARD_LAYOUTS.map((l) => (<SelectItem key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Layout Columns</Label>
                  <Input
                    type="number"
                    min={1}
                    max={4}
                    value={(dashboard?.dashboard_layout as Record<string, number>)?.columns || 2}
                    onChange={(e) => updateDashboardField('dashboard_layout', { ...(dashboard?.dashboard_layout as Record<string, unknown> || {}), columns: parseInt(e.target.value) || 2 })}
                  />
                </div>
              </div>

              <div className="mt-6">
                <Label className="mb-3 block">Default Charts</Label>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {CHART_TYPES.map((chart) => {
                    const charts = (dashboard?.default_charts as unknown as string[]) || [];
                    const active = charts.includes(chart.key);
                    return (
                      <label key={chart.key} className="flex items-center gap-3 rounded-lg border border-border bg-surface-light p-3 cursor-pointer hover:border-accent-500/30 transition-colors">
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => toggleChart(chart.key)}
                          className="h-4 w-4 rounded border-border bg-surface text-accent-500 focus:ring-accent-500"
                          disabled={!canEdit}
                        />
                        <span className="text-sm text-secondary-300">{chart.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <Label className="mb-3 block">Widget Visibility</Label>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {WIDGETS.map((widget) => (
                    <div key={widget.key} className="flex items-center justify-between rounded-lg border border-border bg-surface-light p-3">
                      <span className="text-sm text-secondary-300">{widget.label}</span>
                      <Switch
                        checked={!!(dashboard?.widget_visibility as Record<string, boolean>)?.[widget.key]}
                        onCheckedChange={(v) => updateWidgetVisibility(widget.key, v)}
                        disabled={!canEdit}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </SettingsForm>
          </TabsContent>

          <TabsContent value="financial">
            <SettingsForm
              title="Financial Settings"
              description="Configure currency, tax, and document numbering"
              dirty={!deepEqual(original.financial, financial)}
              canEdit={canEdit}
              saving={saving}
              onSave={() => handleSave('financial')}
              onReset={() => handleReset('financial')}
            >
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Select value={financial?.default_currency || 'INR'} onValueChange={(v) => updateFinancialField('default_currency', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Currency Symbol</Label>
                  <Input value={financial?.currency_symbol || '₹'} onChange={(e) => updateFinancialField('currency_symbol', e.target.value)} maxLength={5} />
                </div>
                <div className="space-y-2">
                  <Label>Decimal Precision</Label>
                  <Input type="number" min={0} max={10} value={financial?.decimal_precision ?? 2} onChange={(e) => updateFinancialField('decimal_precision', parseInt(e.target.value) || 2)} />
                </div>
                <div className="space-y-2">
                  <Label>Tax Percentage (%)</Label>
                  <Input type="number" min={0} max={100} step={0.01} value={financial?.tax_percentage ?? 18} onChange={(e) => updateFinancialField('tax_percentage', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>Invoice Prefix</Label>
                  <Input value={financial?.invoice_prefix || 'INV-'} onChange={(e) => updateFinancialField('invoice_prefix', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Booking Prefix</Label>
                  <Input value={financial?.booking_prefix || 'BKG-'} onChange={(e) => updateFinancialField('booking_prefix', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Journal Prefix</Label>
                  <Input value={financial?.journal_prefix || 'JRN-'} onChange={(e) => updateFinancialField('journal_prefix', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Expense Prefix</Label>
                  <Input value={financial?.expense_prefix || 'EXP-'} onChange={(e) => updateFinancialField('expense_prefix', e.target.value)} />
                </div>
              </div>
            </SettingsForm>
          </TabsContent>

          <TabsContent value="notifications">
            <SettingsForm
              title="Notification Settings"
              description="Configure system notifications and summary emails"
              dirty={!deepEqual(original.notifications, notifications)}
              canEdit={canEdit}
              saving={saving}
              onSave={() => handleSave('notifications')}
              onReset={() => handleReset('notifications')}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface-light p-4">
                  <div>
                    <p className="text-sm font-medium text-white">Email Notifications</p>
                    <p className="text-xs text-secondary-400">Receive system notifications via email</p>
                  </div>
                  <Switch checked={notifications?.email_notifications ?? true} onCheckedChange={(v) => updateNotificationField('email_notifications', v)} disabled={!canEdit} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface-light p-4">
                  <div>
                    <p className="text-sm font-medium text-white">Browser Notifications</p>
                    <p className="text-xs text-secondary-400">Receive in-app browser notifications</p>
                  </div>
                  <Switch checked={notifications?.browser_notifications ?? true} onCheckedChange={(v) => updateNotificationField('browser_notifications', v)} disabled={!canEdit} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface-light p-4">
                  <div>
                    <p className="text-sm font-medium text-white">Reminder Settings</p>
                    <p className="text-xs text-secondary-400">Send reminders for pending tasks</p>
                  </div>
                  <Switch checked={notifications?.reminder_settings ?? true} onCheckedChange={(v) => updateNotificationField('reminder_settings', v)} disabled={!canEdit} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface-light p-4">
                  <div>
                    <p className="text-sm font-medium text-white">Daily Summary</p>
                    <p className="text-xs text-secondary-400">Receive daily performance summary</p>
                  </div>
                  <Switch checked={notifications?.daily_summary ?? false} onCheckedChange={(v) => updateNotificationField('daily_summary', v)} disabled={!canEdit} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface-light p-4">
                  <div>
                    <p className="text-sm font-medium text-white">Weekly Summary</p>
                    <p className="text-xs text-secondary-400">Receive weekly performance summary</p>
                  </div>
                  <Switch checked={notifications?.weekly_summary ?? false} onCheckedChange={(v) => updateNotificationField('weekly_summary', v)} disabled={!canEdit} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface-light p-4">
                  <div>
                    <p className="text-sm font-medium text-white">Monthly Summary</p>
                    <p className="text-xs text-secondary-400">Receive monthly performance summary</p>
                  </div>
                  <Switch checked={notifications?.monthly_summary ?? false} onCheckedChange={(v) => updateNotificationField('monthly_summary', v)} disabled={!canEdit} />
                </div>
              </div>
            </SettingsForm>
          </TabsContent>

          <TabsContent value="preferences">
            <SettingsForm
              title="User Preferences"
              description="Configure default user interface preferences"
              dirty={!deepEqual(original.preferences, preferences)}
              canEdit={canEdit}
              saving={saving}
              onSave={() => handleSave('preferences')}
              onReset={() => handleReset('preferences')}
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Default Theme</Label>
                  <Select value={preferences?.theme || 'dark'} onValueChange={(v) => updatePreferenceField('theme', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {THEMES.map((t) => (<SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Sidebar State</Label>
                  <Select value={preferences?.sidebar_state || 'expanded'} onValueChange={(v) => updatePreferenceField('sidebar_state', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SIDEBAR_STATES.map((s) => (<SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Language</Label>
                  <Select value={preferences?.language || 'en'} onValueChange={(v) => updatePreferenceField('language', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((l) => (<SelectItem key={l} value={l}>{l.toUpperCase()}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Table Density</Label>
                  <Select value={preferences?.table_density || 'comfortable'} onValueChange={(v) => updatePreferenceField('table_density', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TABLE_DENSITIES.map((d) => (<SelectItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Page Size</Label>
                  <Select value={String(preferences?.default_page_size ?? 10)} onValueChange={(v) => updatePreferenceField('default_page_size', parseInt(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZES.map((s) => (<SelectItem key={s} value={String(s)}>{s}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SettingsForm>
          </TabsContent>

          <TabsContent value="security">
            <SettingsForm
              title="Security Settings"
              description="Configure password policy, session, and authentication settings"
              dirty={!deepEqual(original.security, security)}
              canEdit={canEdit}
              saving={saving}
              onSave={() => handleSave('security')}
              onReset={() => handleReset('security')}
            >
              <div className="mb-6">
                <Label className="mb-3 block">Password Policy</Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Minimum Length</Label>
                    <Input type="number" min={4} max={64} value={security?.password_policy?.min_length ?? 8} onChange={(e) => updatePasswordPolicy('min_length', parseInt(e.target.value) || 8)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Login Attempts</Label>
                    <Input type="number" min={1} max={100} value={security?.max_login_attempts ?? 5} onChange={(e) => updateSecurityField('max_login_attempts', parseInt(e.target.value) || 5)} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border bg-surface-light p-3">
                    <div>
                      <p className="text-sm font-medium text-white">Require Uppercase</p>
                      <p className="text-xs text-secondary-400">At least one uppercase letter</p>
                    </div>
                    <Switch checked={security?.password_policy?.require_uppercase ?? true} onCheckedChange={(v) => updatePasswordPolicy('require_uppercase', v)} disabled={!canEdit} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border bg-surface-light p-3">
                    <div>
                      <p className="text-sm font-medium text-white">Require Lowercase</p>
                      <p className="text-xs text-secondary-400">At least one lowercase letter</p>
                    </div>
                    <Switch checked={security?.password_policy?.require_lowercase ?? true} onCheckedChange={(v) => updatePasswordPolicy('require_lowercase', v)} disabled={!canEdit} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border bg-surface-light p-3">
                    <div>
                      <p className="text-sm font-medium text-white">Require Numbers</p>
                      <p className="text-xs text-secondary-400">At least one numeric digit</p>
                    </div>
                    <Switch checked={security?.password_policy?.require_numbers ?? true} onCheckedChange={(v) => updatePasswordPolicy('require_numbers', v)} disabled={!canEdit} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border bg-surface-light p-3">
                    <div>
                      <p className="text-sm font-medium text-white">Require Special</p>
                      <p className="text-xs text-secondary-400">At least one special character</p>
                    </div>
                    <Switch checked={security?.password_policy?.require_special ?? false} onCheckedChange={(v) => updatePasswordPolicy('require_special', v)} disabled={!canEdit} />
                  </div>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Session Timeout (minutes)</Label>
                  <Input type="number" min={1} max={1440} value={security?.session_timeout_minutes ?? 60} onChange={(e) => updateSecurityField('session_timeout_minutes', parseInt(e.target.value) || 60)} />
                  <p className="text-xs text-secondary-500">Automatically log out inactive users after this many minutes</p>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface-light p-4">
                  <div>
                    <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
                    <p className="text-xs text-secondary-400">Enable 2FA for all users (requires setup)</p>
                  </div>
                  <Switch checked={security?.two_factor_enabled ?? false} onCheckedChange={(v) => updateSecurityField('two_factor_enabled', v)} disabled={!canEdit} />
                </div>
              </div>
            </SettingsForm>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

function SettingsForm({
  title,
  description,
  dirty,
  canEdit,
  saving,
  onSave,
  onReset,
  children,
}: {
  title: string;
  description: string;
  dirty: boolean;
  canEdit: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-secondary-400">{description}</p>
      </div>
      {children}
      <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
        <p className="text-xs text-secondary-500">
          {dirty ? 'You have unsaved changes' : 'All changes saved'}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<RotateCcw className="h-4 w-4" />}
            onClick={onReset}
            disabled={!dirty || saving || !canEdit}
          >
            Reset
          </Button>
          <Button
            size="sm"
            icon={<Save className="h-4 w-4" />}
            onClick={onSave}
            loading={saving}
            disabled={!dirty || !canEdit}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
