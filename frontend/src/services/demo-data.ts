const now = new Date().toISOString();

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatCurrency(amount: number) {
  return Math.round(amount * 100) / 100;
}

export const demoUser = {
  id: 'guest-001',
  username: 'guest',
  email: 'guest@demo.com',
  first_name: 'Demo',
  last_name: 'User',
  role: 'super_admin',
  is_active: true,
  is_first_login: false,
  last_login_at: now,
  created_at: now,
  updated_at: now,
};

const vehicleNumbers = ['MH-01-AB-1234', 'MH-02-CD-5678', 'MH-03-EF-9012', 'MH-04-GH-3456', 'MH-05-IJ-7890'];
const vehicleIds = ['v1', 'v2', 'v3', 'v4', 'v5'];
const platformNames = ['Uber', 'Ola', 'Rapido', 'Shuttle', 'Outstation'];
const categoryNames = ['Fuel', 'Maintenance', 'Toll', 'Parking', 'Insurance'];

function generateVehicles() {
  return vehicleNumbers.map((num, i) => ({
    id: vehicleIds[i],
    vehicle_number: num,
    brand: ['Toyota', 'Honda', 'Hyundai', 'Maruti', 'Tata'][i],
    model: ['Innova', 'City', 'Creta', 'Swift', 'Nexon'][i],
    year: 2022 + i,
    variant: 'ZXI',
    fuel_type: ['Petrol', 'Diesel', 'Petrol', 'Diesel', 'Electric'][i],
    seating_capacity: 7,
    transmission: 'Manual',
    owner_name: 'Demo Owner',
    status: i < 3 ? 'active' : 'available',
    is_active: true,
    created_at: now,
    updated_at: now,
  }));
}

function generateBookings() {
  const statuses = ['active', 'completed', 'cancelled'];
  return Array.from({ length: 15 }, (_, i) => ({
    id: `b${i + 1}`,
    booking_id: `BK-${String(i + 1).padStart(4, '0')}`,
    vehicle_id: vehicleIds[i % 5],
    vehicle_number: vehicleNumbers[i % 5],
    platform_id: `p${(i % 5) + 1}`,
    platform_name: platformNames[i % 5],
    net_revenue: formatCurrency(randomBetween(500, 5000)),
    total_amount: formatCurrency(randomBetween(1000, 7000)),
    status: statuses[i % 3],
    created_at: new Date(Date.now() - i * 3600000).toISOString(),
    updated_at: now,
  }));
}

function generateExpenses() {
  return Array.from({ length: 12 }, (_, i) => ({
    id: `e${i + 1}`,
    vehicle_id: vehicleIds[i % 5],
    vehicle_number: vehicleNumbers[i % 5],
    category_name: categoryNames[i % 5],
    amount: formatCurrency(randomBetween(200, 8000)),
    status: ['approved', 'pending', 'approved'][i % 3],
    vendor: `Vendor ${i + 1}`,
    payment_mode_name: ['Cash', 'UPI', 'Card'][i % 3],
    created_at: new Date(Date.now() - i * 7200000).toISOString(),
    updated_at: now,
  }));
}

function generateJournal() {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `j${i + 1}`,
    vehicle_id: vehicleIds[i % 5],
    vehicle_number: vehicleNumbers[i % 5],
    category_name: ['Booking Revenue', 'Extra KM', 'Toll', 'Waiting'][i % 4],
    amount_collected: formatCurrency(randomBetween(1000, 10000)),
    total_amount: formatCurrency(randomBetween(1000, 12000)),
    status: ['collected', 'pending', 'collected'][i % 3],
    created_at: new Date(Date.now() - i * 5400000).toISOString(),
    updated_at: now,
  }));
}

function generateOutstandings() {
  return Array.from({ length: 8 }, (_, i) => ({
    id: `o${i + 1}`,
    vehicle_number: vehicleNumbers[i % 5],
    platform_name: platformNames[i % 5],
    amount: formatCurrency(randomBetween(5000, 50000)),
    status: ['pending', 'overdue', 'paid'][i % 3],
    priority: ['high', 'medium', 'low'][i % 3],
    due_date: new Date(Date.now() + (i - 2) * 86400000).toISOString(),
    created_at: now,
    updated_at: now,
  }));
}

function generateSettlements() {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `s${i + 1}`,
    settlement_id: `STL-${String(i + 1).padStart(4, '0')}`,
    vehicle_number: vehicleNumbers[i % 5],
    total_amount: formatCurrency(randomBetween(10000, 100000)),
    status: ['pending', 'completed', 'in_progress'][i % 3],
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    updated_at: now,
  }));
}

function generateMaintenance() {
  return Array.from({ length: 6 }, (_, i) => ({
    id: `m${i + 1}`,
    vehicle_id: vehicleIds[i % 5],
    vehicle_number: vehicleNumbers[i % 5],
    description: ['Oil Change', 'Brake Pad', 'Tire Rotation', 'AC Service', 'Engine Check', 'Battery'][i],
    status: ['completed', 'in_progress', 'scheduled'][i % 3],
    cost: formatCurrency(randomBetween(2000, 15000)),
    created_at: now,
    updated_at: now,
  }));
}

function generateVendors() {
  return Array.from({ length: 5 }, (_, i) => ({
    id: `vd${i + 1}`,
    name: `Vendor ${i + 1}`,
    contact_person: `Person ${i + 1}`,
    phone: `+91-98765${String(i).padStart(5, '0')}`,
    email: `vendor${i + 1}@example.com`,
    is_active: true,
    created_at: now,
    updated_at: now,
  }));
}

function generateVehicleOwners() {
  return Array.from({ length: 4 }, (_, i) => ({
    id: `vo${i + 1}`,
    name: `Owner ${i + 1}`,
    phone: `+91-98765${String(i + 5).padStart(5, '0')}`,
    email: `owner${i + 1}@example.com`,
    owner_type: ['individual', 'company'][i % 2],
    is_active: true,
    created_at: now,
    updated_at: now,
  }));
}

function generateDashboardData() {
  const revenue = randomBetween(50000, 200000);
  const expense = randomBetween(30000, 100000);
  const profit = revenue - expense;
  return {
    kpis: {
      todays_revenue: formatCurrency(revenue),
      weekly_revenue: formatCurrency(revenue * 6),
      monthly_revenue: formatCurrency(revenue * 25),
      yearly_revenue: formatCurrency(revenue * 300),
      todays_expense: formatCurrency(expense),
      weekly_expense: formatCurrency(expense * 6),
      monthly_expense: formatCurrency(expense * 25),
      yearly_expense: formatCurrency(expense * 300),
      todays_profit: formatCurrency(profit),
      weekly_profit: formatCurrency(profit * 6),
      monthly_profit: formatCurrency(profit * 25),
      yearly_profit: formatCurrency(profit * 300),
      net_profit: formatCurrency(profit * 300),
      net_margin: 35.5,
      cash_flow: formatCurrency(revenue * 0.8),
      outstanding_collections: formatCurrency(randomBetween(100000, 500000)),
      total_vehicles: 5,
      active_vehicles: 3,
      available_vehicles: 2,
      booked_vehicles: 3,
      maintenance_vehicles: 1,
      utilization_rate: 72,
      avg_revenue_per_vehicle: formatCurrency(revenue / 5),
      avg_expense_per_vehicle: formatCurrency(expense / 5),
    },
    trends: {
      revenue: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => ({
        month: m,
        total: formatCurrency(randomBetween(300000, 800000)),
      })),
      expense: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => ({
        month: m,
        total: formatCurrency(randomBetween(200000, 500000)),
      })),
      profit: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => ({
        month: m,
        total: formatCurrency(randomBetween(50000, 300000)),
      })),
      cash_flow: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => ({
        month: m,
        inflows: formatCurrency(randomBetween(300000, 800000)),
        outflows: formatCurrency(randomBetween(200000, 500000)),
      })),
      revenue_growth: { monthly_growth: 12.5, quarterly_growth: 8.3, yearly_growth: 45.2 },
    },
    breakdowns: {
      revenue_by_platform: platformNames.map((n, i) => ({
        platform_id: `p${i + 1}`,
        platform_name: n,
        total: formatCurrency(randomBetween(100000, 500000)),
      })),
      expense_by_category: categoryNames.map((n, i) => ({
        category_id: `c${i + 1}`,
        category_name: n,
        total: formatCurrency(randomBetween(50000, 200000)),
      })),
      revenue_by_vehicle: vehicleNumbers.map((n, i) => ({
        vehicle_id: vehicleIds[i],
        vehicle_number: n,
        total: formatCurrency(randomBetween(100000, 400000)),
      })),
      collections_by_category: ['Booking Revenue', 'Extra KM', 'Toll', 'Waiting'].map((n, i) => ({
        category_id: `jc${i + 1}`,
        category_name: n,
        total: formatCurrency(randomBetween(50000, 300000)),
      })),
    },
    recent: {
      latest_bookings: generateBookings().slice(0, 5),
      latest_journal_entries: generateJournal().slice(0, 5),
      latest_expenses: generateExpenses().slice(0, 5),
    },
    top_vehicles: {
      top_performing: vehicleNumbers.map((n, i) => ({
        vehicle_id: vehicleIds[i],
        vehicle_number: n,
        total_revenue: formatCurrency(randomBetween(200000, 600000)),
      })),
      top_expense: vehicleNumbers.map((n, i) => ({
        vehicle_id: vehicleIds[i],
        vehicle_number: n,
        total_expense: formatCurrency(randomBetween(100000, 300000)),
      })),
      most_profitable: vehicleNumbers.map((n, i) => ({
        vehicle_id: vehicleIds[i],
        vehicle_number: n,
        profit: formatCurrency(randomBetween(50000, 300000)),
      })),
      platform_ranking: platformNames.map((n, i) => ({
        platform_id: `p${i + 1}`,
        platform_name: n,
        total: formatCurrency(randomBetween(200000, 800000)),
      })),
    },
    alerts: {
      vehicles_without_bookings: 1,
      vehicles_without_bookings_list: [{ vehicle_id: 'v5', vehicle_number: 'MH-05-IJ-7890' }],
      high_expense_vehicles: [{ vehicle_id: 'v2', vehicle_number: 'MH-02-CD-5678', total_expense: formatCurrency(250000) }],
      negative_profit_vehicles: [],
      pending_journal_entries: 3,
      pending_expenses: 2,
    },
    fleet_health: {
      health_score: 82,
      insurance_due: 1,
      permit_due: 2,
      fitness_due: 0,
      pollution_due: 1,
      rc_due: 0,
      maintenance_due: 2,
      vehicles_in_maintenance: 1,
      vehicles_without_platform: 1,
      expired_documents: 1,
    },
  };
}

function generateMasterData() {
  return {
    expense_categories: categoryNames.map((n, i) => ({ id: `c${i + 1}`, name: n, type: 'expense_category' })),
    platforms: platformNames.map((n, i) => ({ id: `p${i + 1}`, name: n, type: 'platform' })),
    payment_modes: ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque'].map((n, i) => ({ id: `pm${i + 1}`, name: n, type: 'payment_mode' })),
    fuel_types: ['Petrol', 'Diesel', 'Electric', 'CNG'].map((n, i) => ({ id: `ft${i + 1}`, name: n, type: 'fuel_type' })),
  };
}

function generateSettings() {
  return {
    company: { name: 'Demo Fleet Corp', address: '123, Business Street, Mumbai - 400001', gst: '27ABCDE1234F1Z5', pan: 'ABCDE1234F' },
    dashboard: { default_view: 'daily', refresh_interval: 30, show_charts: true },
    financial: { currency: 'INR', fiscal_year_start: '2026-04-01', tax_rate: 18 },
    notification: { email_alerts: true, push_notifications: false, sms_alerts: false },
    preferences: { language: 'en-IN', date_format: 'dd/MM/yyyy', time_format: '24h' },
    security: { two_factor: false, session_timeout: 60, password_policy: 'strong' },
  };
}

function generateSettlementDashboard() {
  return {
    total_pending: randomBetween(200000, 500000),
    total_completed: randomBetween(1000000, 3000000),
    total_in_progress: randomBetween(100000, 300000),
    count_pending: randomBetween(5, 15),
    count_completed: randomBetween(20, 50),
    count_in_progress: randomBetween(3, 8),
    monthly_trend: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m) => ({
      month: m,
      settled: formatCurrency(randomBetween(200000, 600000)),
      pending: formatCurrency(randomBetween(50000, 200000)),
    })),
    platform_wise: platformNames.map((n, i) => ({
      platform: n,
      settled: formatCurrency(randomBetween(200000, 800000)),
      pending: formatCurrency(randomBetween(50000, 150000)),
    })),
    aging: [
      { bucket: '0-30 days', amount: formatCurrency(randomBetween(50000, 150000)) },
      { bucket: '31-60 days', amount: formatCurrency(randomBetween(30000, 100000)) },
      { bucket: '61-90 days', amount: formatCurrency(randomBetween(10000, 50000)) },
      { bucket: '90+ days', amount: formatCurrency(randomBetween(5000, 20000)) },
    ],
  };
}

const demoStore: Record<string, unknown> = {};

export function getDemoData(url: string, method: string, body?: unknown): unknown {
  const key = `${method}:${url}`;

  if (key.includes('/auth/login')) {
    return { data: { user: demoUser, token: 'demo-token-guest-access', isFirstLogin: false } };
  }

  if (key.includes('/auth/profile')) {
    return { data: demoUser };
  }

  if (key.includes('/dashboard')) {
    return { data: generateDashboardData() };
  }

  if (key.includes('/settlements/dashboard') || key.includes('/settlement-dashboard')) {
    return { data: generateSettlementDashboard() };
  }

  if (key.includes('/settlements') && !key.includes('/dashboard') && !key.includes('/detail')) {
    const data = generateSettlements();
    const page = url.includes('page=') ? parseInt(url.match(/page=(\d+)/)?.[1] || '1') : 1;
    const limit = url.includes('limit=') ? parseInt(url.match(/limit=(\d+)/)?.[1] || '10') : 10;
    return { data: data.slice((page - 1) * limit, page * limit), total: data.length, page, limit, totalPages: Math.ceil(data.length / limit) };
  }

  if (key.includes('/vehicles') && !key.includes('/vehicle-')) {
    const data = generateVehicles();
    return { data, total: data.length, page: 1, limit: 10, totalPages: 1 };
  }

  if (key.includes('/bookings')) {
    const data = generateBookings();
    return { data, total: data.length, page: 1, limit: 10, totalPages: 1 };
  }

  if (key.includes('/expenses')) {
    const data = generateExpenses();
    return { data, total: data.length, page: 1, limit: 10, totalPages: 1 };
  }

  if (key.includes('/journal')) {
    const data = generateJournal();
    return { data, total: data.length, page: 1, limit: 10, totalPages: 1 };
  }

  if (key.includes('/outstandings')) {
    const data = generateOutstandings();
    return { data, total: data.length, page: 1, limit: 10, totalPages: 1 };
  }

  if (key.includes('/maintenance')) {
    const data = generateMaintenance();
    return { data, total: data.length, page: 1, limit: 10, totalPages: 1 };
  }

  if (key.includes('/vendors')) {
    const data = generateVendors();
    return { data, total: data.length, page: 1, limit: 10, totalPages: 1 };
  }

  if (key.includes('/vehicle-owners') || key.includes('/vehicle_owners')) {
    const data = generateVehicleOwners();
    return { data, total: data.length, page: 1, limit: 10, totalPages: 1 };
  }

  if (key.includes('/analytics')) {
    return {
      data: {
        revenue: generateDashboardData().trends.revenue,
        expenses: generateDashboardData().trends.expense,
        utilization: 72,
      },
    };
  }

  if (key.includes('/reports')) {
    return { data: { report_url: '#', generated_at: now, rows: generateBookings().slice(0, 5) } };
  }

  if (key.includes('/masters') || key.includes('/master')) {
    return { data: generateMasterData() };
  }

  if (key.includes('/settings')) {
    return { data: generateSettings() };
  }

  if (key.includes('/notifications')) {
    return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
  }

  if (key.includes('/activity')) {
    return { data: [] };
  }

  if (method === 'POST') {
    const id = `demo-${Date.now()}`;
    const record = { ...(body as Record<string, unknown>), id, created_at: now, updated_at: now };
    demoStore[id] = record;
    return { data: record };
  }

  if (method === 'PUT') {
    return { data: { ...(body as Record<string, unknown>), updated_at: now } };
  }

  if (method === 'DELETE') {
    return { data: { success: true } };
  }

  return { data: [] };
}
