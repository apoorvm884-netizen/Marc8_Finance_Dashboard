import { getDatabase } from '../config/database';

export class JournalMetricsService {
  async getMetrics(): Promise<any> {
    const db = getDatabase();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const entries = await db('journal_entries')
      .leftJoin('vehicles', 'journal_entries.vehicle_id', 'vehicles.id')
      .leftJoin('master_values as categories', 'journal_entries.ledger_category_id', 'categories.id')
      .select(
        'journal_entries.*',
        'vehicles.vehicle_number',
        'categories.name as category_name'
      )
      .whereNull('journal_entries.deleted_at')
      .whereIn('journal_entries.status', ['COMPLETED', 'PENDING']);

    let todaysCollections = 0;
    let monthlyCollections = 0;
    const categoryMap = new Map<string, { category_id: string; category_name: string; total: number }>();
    const vehicleMap = new Map<string, { vehicle_id: string; vehicle_number: string; total: number }>();

    for (const entry of entries) {
      const amount = Number(entry.amount_collected) || 0;
      const createdAt = entry.created_at;

      if (createdAt >= todayStart) todaysCollections += amount;
      if (createdAt >= monthStart) monthlyCollections += amount;

      const catId = entry.ledger_category_id;
      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, { category_id: catId, category_name: entry.category_name || 'Unknown', total: 0 });
      }
      categoryMap.get(catId)!.total += amount;

      const vehId = entry.vehicle_id;
      if (!vehicleMap.has(vehId)) {
        vehicleMap.set(vehId, { vehicle_id: vehId, vehicle_number: entry.vehicle_number || 'Unknown', total: 0 });
      }
      vehicleMap.get(vehId)!.total += amount;
    }

    const recentEntries = await db('journal_entries')
      .leftJoin('vehicles', 'journal_entries.vehicle_id', 'vehicles.id')
      .leftJoin('master_values as categories', 'journal_entries.ledger_category_id', 'categories.id')
      .select(
        'journal_entries.*',
        'vehicles.vehicle_number',
        'vehicles.vehicle_name',
        'categories.name as category_name'
      )
      .whereNull('journal_entries.deleted_at')
      .orderBy('journal_entries.created_at', 'desc')
      .limit(5);

    return {
      todays_collections: Math.round(todaysCollections * 100) / 100,
      monthly_collections: Math.round(monthlyCollections * 100) / 100,
      collections_by_category: Array.from(categoryMap.values()),
      collections_by_vehicle: Array.from(vehicleMap.values()),
      recent_entries: recentEntries,
    };
  }
}

export const journalMetricsService = new JournalMetricsService();
