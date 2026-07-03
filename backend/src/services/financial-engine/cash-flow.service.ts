import { getDatabase } from '../../config/database';

export class CashFlowService {
  async getCashFlowSummary(): Promise<{
    total_inflow: number;
    total_outflow: number;
    net_cash_flow: number;
  }> {
    const db = getDatabase();

    const inflowResult = await db('journal_entries')
      .whereNull('deleted_at')
      .whereIn('status', ['COMPLETED'])
      .sum('amount_collected as total')
      .first();
    const totalInflow = Math.round(Number(inflowResult?.total ?? 0) * 100) / 100;

    const outflowResult = await db('expenses')
      .whereNull('deleted_at')
      .whereIn('status', ['APPROVED', 'REIMBURSED'])
      .sum('amount as total')
      .first();
    const totalOutflow = Math.round(Number(outflowResult?.total ?? 0) * 100) / 100;

    return {
      total_inflow: totalInflow,
      total_outflow: totalOutflow,
      net_cash_flow: Math.round((totalInflow - totalOutflow) * 100) / 100,
    };
  }

  async getMonthlyCashFlow(): Promise<{
    inflows: { month: string; total: number }[];
    outflows: { month: string; total: number }[];
  }> {
    const db = getDatabase();

    const inflows = await db('journal_entries')
      .whereNull('deleted_at')
      .whereIn('status', ['COMPLETED'])
      .groupBy(db.raw("to_char(created_at, 'YYYY-MM')"))
      .select(db.raw("to_char(created_at, 'YYYY-MM') as month"))
      .sum('amount_collected as total')
      .orderBy('month', 'asc')
      .limit(12);

    const outflows = await db('expenses')
      .whereNull('deleted_at')
      .whereIn('status', ['APPROVED', 'REIMBURSED'])
      .groupBy(db.raw("to_char(expense_date, 'YYYY-MM')"))
      .select(db.raw("to_char(expense_date, 'YYYY-MM') as month"))
      .sum('amount as total')
      .orderBy('month', 'asc')
      .limit(12);

    return {
      inflows: inflows.map((r: any) => ({ month: r.month, total: Math.round(Number(r.total ?? 0) * 100) / 100 })),
      outflows: outflows.map((r: any) => ({ month: r.month, total: Math.round(Number(r.total ?? 0) * 100) / 100 })),
    };
  }

  async calculateJournalBalance(): Promise<{ total_collected: number; total_outstanding: number }> {
    const db = getDatabase();

    const collected = await db('journal_entries')
      .whereNull('deleted_at')
      .whereIn('status', ['COMPLETED'])
      .sum('amount_collected as total')
      .first();
    const totalCollected = Math.round(Number((collected as any)?.total ?? 0) * 100) / 100;

    const [outstanding] = await db.raw(
      `SELECT COALESCE(SUM(total_amount - amount_collected), 0) as total
       FROM journal_entries
       WHERE deleted_at IS NULL AND status = 'PENDING'`
    );
    const totalOutstanding = Math.round(Number(outstanding?.total ?? 0) * 100) / 100;

    return { total_collected: totalCollected, total_outstanding: totalOutstanding };
  }

  async getOutstandingCollections(): Promise<number> {
    const db = getDatabase();
    const [result] = await db.raw(
      `SELECT COALESCE(SUM(total_amount - amount_collected), 0) as total
       FROM journal_entries
       WHERE deleted_at IS NULL AND status = 'PENDING'`
    );
    return Math.round(Number(result?.total ?? 0) * 100) / 100;
  }

  async getCashFlowTrend(months: number = 12): Promise<{ month: string; inflow: number; outflow: number; net: number }[]> {
    const { inflows, outflows } = await this.getMonthlyCashFlow();
    const monthMap = new Map<string, { inflow: number; outflow: number }>();
    for (const i of inflows) {
      if (!monthMap.has(i.month)) monthMap.set(i.month, { inflow: 0, outflow: 0 });
      monthMap.get(i.month)!.inflow = i.total;
    }
    for (const o of outflows) {
      if (!monthMap.has(o.month)) monthMap.set(o.month, { inflow: 0, outflow: 0 });
      monthMap.get(o.month)!.outflow = o.total;
    }
    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-months)
      .map(([month, vals]) => ({
        month,
        inflow: vals.inflow,
        outflow: vals.outflow,
        net: Math.round((vals.inflow - vals.outflow) * 100) / 100,
      }));
  }
}

export const cashFlowService = new CashFlowService();
