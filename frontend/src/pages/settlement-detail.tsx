import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, IndianRupee, Calendar, FileText, Car, BadgeCheck,
  Banknote, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { useNotification } from '@/hooks/use-notification';
import { useAuth } from '@/hooks/use-auth';
import { ROLES } from '@/config/constants';
import { settlementService } from '@/services/settlement.service';
import { SettlementForm } from '@/components/settlements/settlement-form';
import type { Settlement, SettlementStatus } from '@/types/settlement';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  calculated: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  pending_approval: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  approved: 'bg-green-500/10 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
  payment_initiated: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  partially_paid: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
  closed: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
};

const statusLabels: Record<string, string> = {
  draft: 'Draft', calculated: 'Calculated', pending_approval: 'Pending Approval',
  approved: 'Approved', rejected: 'Rejected', payment_initiated: 'Payment Initiated',
  paid: 'Paid', partially_paid: 'Partially Paid', cancelled: 'Cancelled', closed: 'Closed',
};

function SkeletonLayout() {
  return (
    <div className="page-container space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton variant="card" className="h-10 w-10" />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" className="h-8 w-64" />
          <Skeleton variant="text" className="h-4 w-96" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card><CardContent className="p-6"><Skeleton variant="card" className="h-48 w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton variant="card" className="h-32 w-full" /></CardContent></Card>
        </div>
        <div className="space-y-6">
          <Card><CardContent className="p-6"><Skeleton variant="card" className="h-40 w-full" /></CardContent></Card>
          <Card><CardContent className="p-6"><Skeleton variant="card" className="h-40 w-full" /></CardContent></Card>
        </div>
      </div>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return '\u20b9' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

export default function SettlementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { notify } = useNotification();

  const [settlement, setSettlement] = useState<Settlement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedBookings, setExpandedBookings] = useState(false);
  const [expandedExpenses, setExpandedExpenses] = useState(false);

  const isAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.ADMIN;
  const isManager = user?.role === ROLES.MANAGER;
  const canEdit = isAdmin || isManager;
  const canApprove = isAdmin || isManager;

  const fetchSettlement = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await settlementService.findById(id);
      setSettlement(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settlement details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchSettlement(); }, [fetchSettlement]);

  const handleStatusChange = async (newStatus: SettlementStatus) => {
    if (!id) return;
    try {
      await settlementService.updateStatus(id, { status: newStatus });
      notify.success(`Settlement status updated to ${statusLabels[newStatus]}`);
      fetchSettlement();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  if (loading) return <SkeletonLayout />;
  if (error || !settlement) return (
    <div className="page-container">
      <ErrorState
        title="Failed to load settlement"
        message={error || 'Settlement not found'}
        retry={{ onClick: fetchSettlement }}
      />
    </div>
  );

  const canTransitionTo = (status: string): { label: string; status: SettlementStatus; color: string }[] => {
    const transitions: Record<string, { label: string; status: SettlementStatus; color: string }[]> = {
      draft: [
        { label: 'Calculate', status: 'calculated', color: 'bg-blue-500 hover:bg-blue-600' },
        { label: 'Cancel', status: 'cancelled', color: 'bg-red-500/50 hover:bg-red-600' },
      ],
      calculated: [
        { label: 'Send for Approval', status: 'pending_approval', color: 'bg-orange-500 hover:bg-orange-600' },
        { label: 'Back to Draft', status: 'draft', color: 'bg-gray-500 hover:bg-gray-600' },
      ],
      pending_approval: [
        { label: 'Approve', status: 'approved', color: 'bg-green-500 hover:bg-green-600' },
        { label: 'Reject', status: 'rejected', color: 'bg-red-500 hover:bg-red-600' },
      ],
      approved: [
        { label: 'Mark Paid', status: 'paid', color: 'bg-emerald-500 hover:bg-emerald-600' },
      ],
      rejected: [
        { label: 'Back to Draft', status: 'draft', color: 'bg-gray-500 hover:bg-gray-600' },
      ],
    };
    return transitions[status] || [];
  };

  return (
    <div className="page-container">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/settlements">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <IndianRupee className="h-6 w-6 text-accent-500" />
            <h1 className="text-2xl font-bold text-white">{settlement.settlement_number}</h1>
            <Badge variant="outline" className={statusColors[settlement.status] || ''}>
              {statusLabels[settlement.status] || settlement.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-secondary-400">
            {settlement.period_start?.substring(0, 10)} to {settlement.period_end?.substring(0, 10)}
            {settlement.owner_name && ` · ${settlement.owner_name}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canApprove && canTransitionTo(settlement.status).map((action) => (
            <Button
              key={action.status}
              size="sm"
              className={action.color}
              onClick={() => handleStatusChange(action.status)}
            >
              {action.label}
            </Button>
          ))}
          {canEdit && <Button size="sm" variant="outline" onClick={() => setDrawerOpen(true)}>Edit</Button>}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Tabs defaultValue="summary">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IndianRupee className="h-5 w-5 text-accent-500" />
                      Revenue Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between py-1">
                        <span className="text-secondary-400">Gross Revenue</span>
                        <span className="text-white font-medium">{formatCurrency(settlement.total_gross_revenue)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-secondary-400">Platform Commission</span>
                        <span className="text-red-400">-{formatCurrency(settlement.total_platform_commission)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-secondary-400">Taxes</span>
                        <span className="text-red-400">-{formatCurrency(settlement.total_taxes)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-secondary-400">Adjustments</span>
                        <span className="text-red-400">-{formatCurrency(settlement.total_adjustments)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-secondary-400">Approved Expenses</span>
                        <span className="text-red-400">-{formatCurrency(settlement.total_approved_expenses)}</span>
                      </div>
                      <div className="border-t border-border pt-3 flex justify-between">
                        <span className="text-white font-semibold">Net Revenue</span>
                        <span className="text-blue-400 font-bold text-lg">{formatCurrency(settlement.net_revenue)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BadgeCheck className="h-5 w-5 text-accent-500" />
                      Distribution Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4">
                        <p className="text-sm text-emerald-400 mb-1">Owner Share</p>
                        <p className="text-2xl font-bold text-emerald-400">{formatCurrency(settlement.owner_share)}</p>
                        {settlement.owner_revenue_percentage && (
                          <p className="text-xs text-secondary-400 mt-1">{settlement.owner_revenue_percentage}% of net</p>
                        )}
                      </div>
                      <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
                        <p className="text-sm text-blue-400 mb-1">Marc8 Share</p>
                        <p className="text-2xl font-bold text-blue-400">{formatCurrency(settlement.marc8_share)}</p>
                        {settlement.owner_revenue_percentage && (
                          <p className="text-xs text-secondary-400 mt-1">{100 - settlement.owner_revenue_percentage}% of net</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {settlement.distributions?.map((d) => (
                        <Badge key={d.id} variant="outline" className="bg-secondary-800/50">
                          {d.recipient_name}: {formatCurrency(d.amount)}
                          {d.percentage !== null && ` (${d.percentage}%)`}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-accent-500" />
                      Period
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-secondary-500">Period Start</p>
                      <p className="text-sm text-white">{settlement.period_start?.substring(0, 10)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500">Period End</p>
                      <p className="text-sm text-white">{settlement.period_end?.substring(0, 10)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500">Revenue Model</p>
                      <p className="text-sm text-white capitalize">{settlement.revenue_model?.replace(/_/g, ' ')}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IndianRupee className="h-5 w-5 text-accent-500" />
                      Payment Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-secondary-400">Total Paid</span>
                      <span className="text-white font-medium">{formatCurrency(settlement.total_paid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-400">Balance Due</span>
                      <span className={`font-medium ${settlement.balance_due > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                        {formatCurrency(settlement.balance_due)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-400">Settlement Type</span>
                      <Badge variant="outline" className="capitalize">{settlement.settlement_type}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {settlement.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-accent-500" />
                        Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-secondary-300 whitespace-pre-wrap">{settlement.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-accent-500" />
                  Linked Bookings
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedBookings(!expandedBookings)}
                >
                  {expandedBookings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CardHeader>
              <CardContent>
                {!settlement.linked_bookings || settlement.linked_bookings.length === 0 ? (
                  <p className="text-sm text-secondary-500">No bookings linked to this settlement.</p>
                ) : (
                  <div className="space-y-2">
                    {settlement.linked_bookings.slice(0, expandedBookings ? undefined : 5).map((b) => (
                      <div key={b.id} className="flex items-center justify-between rounded-lg bg-secondary-800/30 p-3">
                        <div>
                          <p className="font-medium text-white">{b.external_booking_id || b.booking_id.substring(0, 8)}</p>
                          <p className="text-xs text-secondary-400">Gross: {formatCurrency(b.gross_fare)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-white">{formatCurrency(b.net_revenue)}</p>
                          <p className="text-xs text-secondary-400">Net</p>
                        </div>
                      </div>
                    ))}
                    {settlement.linked_bookings.length > 5 && !expandedBookings && (
                      <Button variant="ghost" size="sm" className="w-full" onClick={() => setExpandedBookings(true)}>
                        Show {settlement.linked_bookings.length - 5} more bookings
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent-500" />
                  Linked Expenses
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedExpenses(!expandedExpenses)}
                >
                  {expandedExpenses ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CardHeader>
              <CardContent>
                {!settlement.linked_expenses || settlement.linked_expenses.length === 0 ? (
                  <p className="text-sm text-secondary-500">No expenses linked to this settlement.</p>
                ) : (
                  <div className="space-y-2">
                    {settlement.linked_expenses.slice(0, expandedExpenses ? undefined : 5).map((e) => (
                      <div key={e.id} className="flex items-center justify-between rounded-lg bg-secondary-800/30 p-3">
                        <div>
                          <p className="font-medium text-white">{e.vendor || 'Unknown Vendor'}</p>
                          <p className="text-xs text-secondary-400 capitalize">Allocation: {e.allocation_type}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-red-400">{formatCurrency(e.amount)}</p>
                        </div>
                      </div>
                    ))}
                    {settlement.linked_expenses.length > 5 && !expandedExpenses && (
                      <Button variant="ghost" size="sm" className="w-full" onClick={() => setExpandedExpenses(true)}>
                        Show {settlement.linked_expenses.length - 5} more expenses
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-accent-500" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!settlement.payments || settlement.payments.length === 0 ? (
                  <p className="text-sm text-secondary-500">No payments recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {settlement.payments.map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg bg-secondary-800/30 p-3">
                        <div>
                          <p className="font-medium text-white capitalize">{p.payment_method.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-secondary-400">
                            {p.payment_date?.substring(0, 10)}
                            {p.reference_number && ` · Ref: ${p.reference_number}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-emerald-400">{formatCurrency(p.amount)}</p>
                          <Badge variant="outline" className="text-xs capitalize">{p.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approvals" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-accent-500" />
                  Approval History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!settlement.approvals || settlement.approvals.length === 0 ? (
                  <p className="text-sm text-secondary-500">No approval actions recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {settlement.approvals.map((a) => (
                      <div key={a.id} className="flex items-center justify-between rounded-lg bg-secondary-800/30 p-3">
                        <div>
                          <p className="font-medium text-white capitalize">{a.status}</p>
                          <p className="text-xs text-secondary-400">
                            {a.approved_by_name || a.approved_by?.substring(0, 8)}
                            {a.remarks && ` · ${a.remarks}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-secondary-400">
                            {new Date(a.approved_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      <SettlementForm
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        settlement={settlement}
        onSuccess={fetchSettlement}
      />
    </div>
  );
}
