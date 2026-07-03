import { getDatabase } from '../config/database';
import { parsePagination, parseSort, parseFilters } from '../utils/helpers';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import type {
  Settlement, SettlementBooking, SettlementExpense, SettlementDistribution,
  SettlementApproval, SettlementPayment, SettlementDocument,
  CreateSettlementDTO, UpdateSettlementDTO, CreateSettlementPaymentDTO,
  CreateSettlementDocumentDTO, RunPipelineDTO, SettlementDashboardMetrics,
  PaginationMeta, SettlementStatus,
} from '../types';

const ALLOWED_SORT_FIELDS = [
  'settlement_number', 'period_start', 'period_end', 'status',
  'total_gross_revenue', 'net_revenue', 'owner_share', 'marc8_share',
  'created_at', 'updated_at',
] as const;

const ALLOWED_FILTER_FIELDS = [
  'search', 'status', 'settlement_type', 'owner_id', 'vehicle_id',
  'period_start', 'period_end', 'include_deleted',
] as const;

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['calculated', 'cancelled'],
  calculated: ['pending_approval', 'draft', 'cancelled'],
  pending_approval: ['approved', 'rejected', 'cancelled'],
  approved: ['payment_initiated', 'cancelled'],
  rejected: ['draft', 'cancelled'],
  payment_initiated: ['paid', 'partially_paid', 'cancelled'],
  partially_paid: ['paid', 'payment_initiated'],
  paid: ['closed'],
  cancelled: [],
  closed: [],
};

function generateSettlementNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const random = Math.floor(Math.random() * 900000) + 100000;
  return `STL-${year}-${random}`;
}

function applyRevenueModel(
  netRevenue: number,
  totalGrossRevenue: number,
  revenueModel: string,
  config: Record<string, unknown> | null,
): { ownerShare: number; marc8Share: number; percentage: number | null } {
  const ownerPercent = (config?.owner_percentage as number) || 50;
  const fixedAmount = (config?.fixed_amount as number) || 0;

  switch (revenueModel) {
    case 'fixed_monthly':
      return { ownerShare: fixedAmount, marc8Share: Math.max(0, netRevenue - fixedAmount), percentage: null };
    case 'revenue_share_percent':
      return { ownerShare: Math.round(totalGrossRevenue * ownerPercent / 100 * 100) / 100, marc8Share: Math.round((netRevenue - totalGrossRevenue * ownerPercent / 100) * 100) / 100, percentage: ownerPercent };
    case 'profit_share_percent':
      return { ownerShare: Math.round(netRevenue * ownerPercent / 100 * 100) / 100, marc8Share: Math.round(netRevenue * (100 - ownerPercent) / 100 * 100) / 100, percentage: ownerPercent };
    case 'hybrid': {
      const shareFromProfit = netRevenue * ownerPercent / 100;
      const totalOwnerShare = fixedAmount + shareFromProfit;
      return { ownerShare: Math.round(totalOwnerShare * 100) / 100, marc8Share: Math.round(Math.max(0, netRevenue - totalOwnerShare) * 100) / 100, percentage: ownerPercent };
    }
    case 'minimum_guarantee': {
      const shareFromPercent = netRevenue * ownerPercent / 100;
      const ownerShare = Math.max(fixedAmount, shareFromPercent);
      return { ownerShare: Math.round(ownerShare * 100) / 100, marc8Share: Math.round(Math.max(0, netRevenue - ownerShare) * 100) / 100, percentage: ownerPercent };
    }
    default: {
      const share = netRevenue * 50 / 100;
      return { ownerShare: Math.round(share * 100) / 100, marc8Share: Math.round(share * 100) / 100, percentage: 50 };
    }
  }
}

export class SettlementService {
  async findAll(query: Record<string, string | undefined>): Promise<{ data: Settlement[]; meta: PaginationMeta }> {
    const db = getDatabase();
    const pagination = parsePagination(query);
    const sort = parseSort(query, [...ALLOWED_SORT_FIELDS]);
    const filters = parseFilters(query, [...ALLOWED_FILTER_FIELDS]);

    let baseQuery = db('settlements')
      .leftJoin('vehicle_owners', 'settlements.owner_id', 'vehicle_owners.id');

    const includeDeleted = filters.include_deleted === 'true';
    if (!includeDeleted) {
      baseQuery = baseQuery.whereNull('settlements.deleted_at');
    }

    if (filters.search) {
      baseQuery = baseQuery.where(function () {
        this.where('settlements.settlement_number', 'ilike', `%${filters.search}%`)
          .orWhere('vehicle_owners.name', 'ilike', `%${filters.search}%`);
      });
    }
    if (filters.status) {
      baseQuery = baseQuery.where('settlements.status', filters.status);
    }
    if (filters.settlement_type) {
      baseQuery = baseQuery.where('settlements.settlement_type', filters.settlement_type);
    }
    if (filters.owner_id) {
      baseQuery = baseQuery.where('settlements.owner_id', filters.owner_id);
    }
    if (filters.vehicle_id) {
      baseQuery = baseQuery.where('settlements.vehicle_id', filters.vehicle_id);
    }
    if (filters.period_start) {
      baseQuery = baseQuery.where('settlements.period_start', '>=', filters.period_start);
    }
    if (filters.period_end) {
      baseQuery = baseQuery.where('settlements.period_end', '<=', filters.period_end);
    }

    const countQuery = baseQuery.clone();
    const [{ count }] = await countQuery.count('settlements.id as count');
    const total = parseInt(count as string, 10);

    const data = await baseQuery
      .select(
        'settlements.*',
        'vehicle_owners.name as owner_name',
      )
      .orderBy(sort.column, sort.order)
      .limit(pagination.limit)
      .offset(pagination.offset);

    return {
      data: data as Settlement[],
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
        hasNextPage: pagination.page < Math.ceil(total / pagination.limit),
        hasPreviousPage: pagination.page > 1,
      },
    };
  }

  async findById(id: string): Promise<Settlement & { owner_name?: string; linked_bookings?: SettlementBooking[]; linked_expenses?: SettlementExpense[]; distributions?: SettlementDistribution[]; approvals?: SettlementApproval[]; payments?: SettlementPayment[]; documents?: SettlementDocument[] }> {
    const db = getDatabase();
    const settlement = await db('settlements')
      .leftJoin('vehicle_owners', 'settlements.owner_id', 'vehicle_owners.id')
      .select('settlements.*', 'vehicle_owners.name as owner_name')
      .where('settlements.id', id)
      .whereNull('settlements.deleted_at')
      .first();

    if (!settlement) {
      throw new NotFoundError('Settlement not found');
    }

    const linkedBookings = await db('settlement_bookings')
      .leftJoin('bookings', 'settlement_bookings.booking_id', 'bookings.id')
      .where('settlement_bookings.settlement_id', id)
      .select(
        'settlement_bookings.*',
        'bookings.booking_id as external_booking_id',
        'bookings.vehicle_id',
      );

    const linkedExpenses = await db('settlement_expenses')
      .leftJoin('expenses', 'settlement_expenses.expense_id', 'expenses.id')
      .where('settlement_expenses.settlement_id', id)
      .select(
        'settlement_expenses.*',
        'expenses.expense_category_id',
        'expenses.vendor',
      );

    const distributions = await db('settlement_distributions')
      .where('settlement_id', id);

    const approvals = await db('settlement_approvals')
      .leftJoin('users', 'settlement_approvals.approved_by', 'users.id')
      .where('settlement_approvals.settlement_id', id)
      .select(
        'settlement_approvals.*',
        'users.username as approved_by_name',
      )
      .orderBy('settlement_approvals.created_at', 'desc');

    const payments = await db('settlement_payments')
      .where('settlement_id', id)
      .orderBy('created_at', 'desc');

    const documents = await db('settlement_documents')
      .where('settlement_id', id)
      .orderBy('created_at', 'desc');

    return {
      ...settlement,
      linked_bookings: linkedBookings,
      linked_expenses: linkedExpenses,
      distributions,
      approvals,
      payments,
      documents,
    };
  }

  async create(data: CreateSettlementDTO, createdBy?: string): Promise<Settlement> {
    const db = getDatabase();
    let settlementNumber = generateSettlementNumber();
    let attempts = 0;
    while (await db('settlements').where({ settlement_number: settlementNumber }).first()) {
      settlementNumber = generateSettlementNumber();
      attempts++;
      if (attempts > 10) {
        throw new ConflictError('Unable to generate unique settlement number');
      }
    }

    if (data.owner_id) {
      const owner = await db('vehicle_owners').where('id', data.owner_id).whereNull('deleted_at').first();
      if (!owner) throw new NotFoundError('Owner not found');
    }

    const [settlement] = await db('settlements').insert({
      settlement_number: settlementNumber,
      period_start: data.period_start,
      period_end: data.period_end,
      owner_id: data.owner_id || null,
      vehicle_id: data.vehicle_id || null,
      platform_id: data.platform_id || null,
      settlement_type: data.settlement_type || 'owner',
      revenue_model: data.revenue_model || 'profit_share_percent',
      status: 'draft',
      notes: data.notes || null,
      created_by: createdBy || null,
      updated_by: createdBy || null,
    }).returning('*');

    return settlement;
  }

  async update(id: string, data: UpdateSettlementDTO, updatedBy?: string): Promise<Settlement> {
    const db = getDatabase();
    const existing = await db('settlements').where('id', id).whereNull('deleted_at').first();
    if (!existing) throw new NotFoundError('Settlement not found');

    if (data.status && data.status !== existing.status) {
      const allowed = VALID_TRANSITIONS[existing.status] || [];
      if (!allowed.includes(data.status)) {
        throw new ValidationError(`Cannot transition from '${existing.status}' to '${data.status}'. Allowed: ${allowed.join(', ') || 'none'}`);
      }
    }

    const updateData: Record<string, unknown> = {
      ...data,
      updated_at: db.fn.now(),
      updated_by: updatedBy || null,
    };
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    const [settlement] = await db('settlements').where('id', id).update(updateData).returning('*');
    return settlement;
  }

  async delete(id: string, deletedBy?: string): Promise<void> {
    const db = getDatabase();
    const existing = await db('settlements').where('id', id).whereNull('deleted_at').first();
    if (!existing) throw new NotFoundError('Settlement not found');

    await db('settlements').where('id', id).update({
      deleted_at: db.fn.now(),
      deleted_by: deletedBy || null,
      updated_at: db.fn.now(),
      updated_by: deletedBy || null,
    });
  }

  async restore(id: string, updatedBy?: string): Promise<Settlement> {
    const db = getDatabase();
    const existing = await db('settlements').where('id', id).first();
    if (!existing) throw new NotFoundError('Settlement not found');

    await db('settlements').where('id', id).update({
      deleted_at: null,
      deleted_by: null,
      updated_at: db.fn.now(),
      updated_by: updatedBy || null,
    });

    return this.findById(id);
  }

  async updateStatus(id: string, status: SettlementStatus, remarks: string | null, userId?: string): Promise<Settlement> {
    const db = getDatabase();
    const existing = await db('settlements').where('id', id).whereNull('deleted_at').first();
    if (!existing) throw new NotFoundError('Settlement not found');

    const allowed = VALID_TRANSITIONS[existing.status] || [];
    if (!allowed.includes(status)) {
      throw new ValidationError(`Cannot transition from '${existing.status}' to '${status}'. Allowed: ${allowed.join(', ') || 'none'}`);
    }

    const balanceDue = status === 'paid' ? 0 : existing.net_revenue - (existing.total_paid || 0);
    const totalPaid = status === 'paid' ? existing.net_revenue : existing.total_paid;

    await db('settlement_approvals').insert({
      settlement_id: id,
      approved_by: userId || null,
      status: status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : status,
      remarks: remarks || null,
    });

    const [settlement] = await db('settlements').where('id', id).update({
      status,
      total_paid: totalPaid,
      balance_due: balanceDue,
      updated_at: db.fn.now(),
      updated_by: userId || null,
    }).returning('*');

    return settlement;
  }

  async runPipeline(data: RunPipelineDTO, createdBy?: string): Promise<Settlement> {
    const db = getDatabase();

    const bookings = await db('bookings')
      .where('status', 'COMPLETED')
      .where('booking_date_time', '>=', data.period_start)
      .where('booking_date_time', '<=', `${data.period_end}T23:59:59.999Z`)
      .whereNull('deleted_at');

    if (data.vehicle_id) {
      bookings.filter(b => b.vehicle_id === data.vehicle_id);
    }
    if (data.owner_id) {
      const ownerVehicles = await db('vehicles').where('current_owner_id', data.owner_id);
      const vehicleIds = ownerVehicles.map(v => v.id);
      bookings.filter(b => vehicleIds.includes(b.vehicle_id));
    }

    let settlementNumber = generateSettlementNumber();
    let attempts = 0;
    while (await db('settlements').where({ settlement_number: settlementNumber }).first()) {
      settlementNumber = generateSettlementNumber();
      attempts++;
      if (attempts > 10) throw new ConflictError('Unable to generate unique settlement number');
    }

    let ownerConfig: Record<string, unknown> | null = null;
    let revenueModel = data.revenue_model || 'profit_share_percent';
    if (data.owner_id) {
      const owner = await db('vehicle_owners').where('id', data.owner_id).whereNull('deleted_at').first();
      if (owner) {
        revenueModel = owner.revenue_model_type || revenueModel;
        ownerConfig = owner.revenue_model_config || null;
      }
    }

    const totalGrossRevenue = bookings.reduce((sum, b) => sum + Number(b.gross_fare || 0), 0);
    const totalPlatformCommission = bookings.reduce((sum, b) => sum + Number(b.platform_commission || 0), 0);
    const totalTaxes = bookings.reduce((sum, b) => sum + Number(b.taxes || 0), 0);
    const totalAdjustments = bookings.reduce((sum, b) => sum + Number(b.refund || 0), 0);

    let expensesQuery = db('expenses')
      .whereIn('status', ['APPROVED', 'REIMBURSED'])
      .where('expense_date', '>=', data.period_start)
      .where('expense_date', '<=', data.period_end)
      .whereNull('deleted_at');

    if (data.vehicle_id) {
      expensesQuery = expensesQuery.where('vehicle_id', data.vehicle_id);
    } else if (data.owner_id) {
      const ownerVehicles = await db('vehicles').where('current_owner_id', data.owner_id);
      const vehicleIds = ownerVehicles.map(v => v.id);
      if (vehicleIds.length > 0) {
        expensesQuery = expensesQuery.whereIn('vehicle_id', vehicleIds);
      }
    }

    const expenses = await expensesQuery;
    const totalApprovedExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const netRevenue = Math.round((
      totalGrossRevenue
      - totalPlatformCommission
      - totalTaxes
      - totalAdjustments
      - totalApprovedExpenses
    ) * 100) / 100;

    const { ownerShare, marc8Share, percentage } = applyRevenueModel(
      netRevenue, totalGrossRevenue, revenueModel, ownerConfig,
    );

    const [settlement] = await db('settlements').insert({
      settlement_number: settlementNumber,
      period_start: data.period_start,
      period_end: data.period_end,
      owner_id: data.owner_id || null,
      vehicle_id: data.vehicle_id || null,
      platform_id: data.platform_id || null,
      settlement_type: data.owner_id ? 'owner' : 'platform',
      total_gross_revenue: totalGrossRevenue,
      total_platform_commission: totalPlatformCommission,
      total_taxes: totalTaxes,
      total_adjustments: totalAdjustments,
      total_approved_expenses: totalApprovedExpenses,
      net_revenue: netRevenue,
      owner_share: ownerShare,
      marc8_share: marc8Share,
      revenue_model: revenueModel,
      owner_revenue_percentage: percentage,
      status: 'calculated',
      balance_due: ownerShare,
      notes: data.notes || null,
      created_by: createdBy || null,
      updated_by: createdBy || null,
    }).returning('*');

    if (bookings.length > 0) {
      const bookingLinks = bookings.map(b => ({
        settlement_id: settlement.id,
        booking_id: b.id,
        gross_fare: b.gross_fare || 0,
        doorstep_charges: b.doorstep_charges || 0,
        platform_commission: b.platform_commission || 0,
        discount: b.discount || 0,
        taxes: b.taxes || 0,
        net_revenue: b.net_revenue || 0,
      }));
      await db('settlement_bookings').insert(bookingLinks);
    }

    if (expenses.length > 0) {
      const expenseLinks = expenses.map(e => ({
        settlement_id: settlement.id,
        expense_id: e.id,
        allocation_type: 'vehicle',
        amount: e.amount || 0,
      }));
      await db('settlement_expenses').insert(expenseLinks);
    }

    await db('settlement_distributions').insert([
      {
        settlement_id: settlement.id,
        recipient_type: 'owner',
        recipient_name: 'Owner',
        amount: ownerShare,
        percentage: percentage,
        description: `Owner distribution based on ${revenueModel} model`,
      },
      {
        settlement_id: settlement.id,
        recipient_type: 'marc8',
        recipient_name: 'Marc8',
        amount: marc8Share,
        percentage: percentage ? 100 - percentage : null,
        description: `Marc8 distribution based on ${revenueModel} model`,
      },
    ]);

    return this.findById(settlement.id);
  }

  async createPayment(settlementId: string, data: CreateSettlementPaymentDTO, createdBy?: string): Promise<SettlementPayment> {
    const db = getDatabase();
    const settlement = await db('settlements').where('id', settlementId).whereNull('deleted_at').first();
    if (!settlement) throw new NotFoundError('Settlement not found');

    const [payment] = await db('settlement_payments').insert({
      settlement_id: settlementId,
      payment_method: data.payment_method,
      amount: data.amount,
      payment_date: data.payment_date,
      reference_number: data.reference_number || null,
      transaction_id: data.transaction_id || null,
      remarks: data.remarks || null,
      created_by: createdBy || null,
    }).returning('*');

    const totalPaid = Number(settlement.total_paid || 0) + Number(data.amount);
    const balanceDue = Math.max(0, Number(settlement.net_revenue) - totalPaid);

    let newStatus: string = settlement.status;
    if (settlement.status === 'approved' || settlement.status === 'draft' || settlement.status === 'calculated') {
      newStatus = balanceDue <= 0 ? 'paid' : 'payment_initiated';
    } else if (settlement.status === 'payment_initiated') {
      newStatus = balanceDue <= 0 ? 'paid' : 'payment_initiated';
    } else if (settlement.status === 'partially_paid') {
      newStatus = balanceDue <= 0 ? 'paid' : 'partially_paid';
    }

    await db('settlements').where('id', settlementId).update({
      total_paid: totalPaid,
      balance_due: balanceDue,
      status: newStatus,
      updated_at: db.fn.now(),
      updated_by: createdBy || null,
    });

    return payment;
  }

  async getPayments(settlementId: string): Promise<SettlementPayment[]> {
    const db = getDatabase();
    return db('settlement_payments').where('settlement_id', settlementId).orderBy('created_at', 'desc');
  }

  async deletePayment(settlementId: string, paymentId: string): Promise<void> {
    const db = getDatabase();
    const payment = await db('settlement_payments').where('id', paymentId).where('settlement_id', settlementId).first();
    if (!payment) throw new NotFoundError('Payment not found');

    const settlement = await db('settlements').where('id', settlementId).first();

    const totalPaid = Number(settlement.total_paid || 0) - Number(payment.amount);
    const balanceDue = Math.max(0, Number(settlement.net_revenue) - totalPaid);

    await db('settlements').where('id', settlementId).update({
      total_paid: totalPaid,
      balance_due: balanceDue,
      updated_at: db.fn.now(),
    });

    await db('settlement_payments').where('id', paymentId).del();
  }

  async getDocuments(settlementId: string): Promise<SettlementDocument[]> {
    const db = getDatabase();
    return db('settlement_documents').where('settlement_id', settlementId).orderBy('created_at', 'desc');
  }

  async addDocument(settlementId: string, data: CreateSettlementDocumentDTO, createdBy?: string): Promise<SettlementDocument> {
    const db = getDatabase();
    const settlement = await db('settlements').where('id', settlementId).whereNull('deleted_at').first();
    if (!settlement) throw new NotFoundError('Settlement not found');

    const [doc] = await db('settlement_documents').insert({
      settlement_id: settlementId,
      document_name: data.document_name,
      file_url: data.file_url || null,
      document_type: data.document_type || null,
      notes: data.notes || null,
      created_by: createdBy || null,
    }).returning('*');

    return doc;
  }

  async deleteDocument(settlementId: string, documentId: string): Promise<void> {
    const db = getDatabase();
    const doc = await db('settlement_documents').where('id', documentId).where('settlement_id', settlementId).first();
    if (!doc) throw new NotFoundError('Document not found');

    await db('settlement_documents').where('id', documentId).del();
  }

  async getDashboardMetrics(): Promise<SettlementDashboardMetrics> {
    const db = getDatabase();

    const settlements = await db('settlements').whereNull('deleted_at');

    const totalSettlements = settlements.length;
    const settlementDueAmount = settlements
      .filter(s => ['draft', 'calculated', 'pending_approval', 'approved'].includes(s.status))
      .reduce((sum, s) => sum + Number(s.balance_due || 0), 0);
    const settlementPaidAmount = settlements
      .filter(s => ['paid', 'partially_paid', 'closed'].includes(s.status))
      .reduce((sum, s) => sum + Number(s.total_paid || 0), 0);
    const pendingApprovals = settlements.filter(s => s.status === 'pending_approval').length;
    const upcomingPayouts = settlements
      .filter(s => ['approved', 'payment_initiated'].includes(s.status))
      .reduce((sum, s) => sum + Number(s.balance_due || 0), 0);
    const ownerLiability = settlements
      .filter(s => ['draft', 'calculated', 'pending_approval', 'approved', 'payment_initiated'].includes(s.status))
      .reduce((sum, s) => sum + Number(s.owner_share || 0), 0);
    const platformLiability = settlements
      .filter(s => ['draft', 'calculated', 'pending_approval', 'approved', 'payment_initiated'].includes(s.status))
      .reduce((sum, s) => sum + Number(s.marc8_share || 0), 0);
    const cashRequirement = settlementDueAmount;

    const monthlyMap: Record<string, number> = {};
    for (const s of settlements) {
      const month = s.period_start.substring(0, 7);
      monthlyMap[month] = (monthlyMap[month] || 0) + Number(s.net_revenue || 0);
    }
    const monthlyDistribution = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({ month, amount: Math.round(amount * 100) / 100 }));

    const ownerMap: Record<string, { name: string; amount: number }> = {};
    const ownerSettlements = settlements.filter(s => s.owner_id);
    for (const s of ownerSettlements) {
      const key = s.owner_id!;
      if (!ownerMap[key]) {
        const owner = await db('vehicle_owners').where('id', key).select('name').first();
        ownerMap[key] = { name: owner?.name || 'Unknown', amount: 0 };
      }
      ownerMap[key].amount += Number(s.owner_share || 0);
    }
    const topOwners = Object.entries(ownerMap)
      .sort(([, a], [, b]) => b.amount - a.amount)
      .slice(0, 10)
      .map(([ownerId, info]) => ({
        owner_id: ownerId,
        owner_name: info.name,
        total_amount: Math.round(info.amount * 100) / 100,
      }));

    const trendMap: Record<string, { owner: number; marc8: number }> = {};
    for (const s of settlements) {
      const month = s.period_start.substring(0, 7);
      if (!trendMap[month]) trendMap[month] = { owner: 0, marc8: 0 };
      trendMap[month].owner += Number(s.owner_share || 0);
      trendMap[month].marc8 += Number(s.marc8_share || 0);
    }
    const distributionTrends = Object.entries(trendMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, val]) => ({
        month,
        owner_share: Math.round(val.owner * 100) / 100,
        marc8_share: Math.round(val.marc8 * 100) / 100,
      }));

    return {
      total_settlements: totalSettlements,
      settlement_due_amount: Math.round(settlementDueAmount * 100) / 100,
      settlement_paid_amount: Math.round(settlementPaidAmount * 100) / 100,
      pending_approvals: pendingApprovals,
      upcoming_payouts: Math.round(upcomingPayouts * 100) / 100,
      owner_liability: Math.round(ownerLiability * 100) / 100,
      platform_liability: Math.round(platformLiability * 100) / 100,
      cash_requirement: Math.round(cashRequirement * 100) / 100,
      monthly_distribution: monthlyDistribution,
      top_owners: topOwners,
      distribution_trends: distributionTrends,
    };
  }
}

export const settlementService = new SettlementService();
