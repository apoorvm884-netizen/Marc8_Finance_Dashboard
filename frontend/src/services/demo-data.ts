const now = new Date().toISOString();

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
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

const owners = [
  'Rajesh Sharma', 'Priya Patel', 'Amit Singh', 'Sunil Verma',
  'Anita Gupta', 'Vikram Reddy', 'Deepa Nair', 'Suresh Iyer',
  'Meena Joshi', 'Rohan Deshmukh',
];

const ownerTypes = ['individual', 'company', 'individual', 'company', 'individual'];
const ownerPhones = [
  '+91-98765-43210', '+91-98765-43211', '+91-98765-43212', '+91-98765-43213',
  '+91-98765-43214', '+91-98765-43215', '+91-98765-43216', '+91-98765-43217',
  '+91-98765-43218', '+91-98765-43219',
];

const vehicleData = [
  { number: 'MH-01-AB-1234', brand: 'Toyota', model: 'Innova Crysta', year: 2024, fuel: 'Diesel', seats: 7, transmission: 'Manual' },
  { number: 'MH-02-CD-5678', brand: 'Honda', model: 'City ZX', year: 2023, fuel: 'Petrol', seats: 5, transmission: 'CVT' },
  { number: 'MH-03-EF-9012', brand: 'Hyundai', model: 'Creta SX', year: 2024, fuel: 'Diesel', seats: 5, transmission: 'Automatic' },
  { number: 'MH-04-GH-3456', brand: 'Maruti Suzuki', model: 'Swift VXi', year: 2023, fuel: 'Petrol', seats: 5, transmission: 'Manual' },
  { number: 'MH-05-IJ-7890', brand: 'Tata', model: 'Nexon EV', year: 2024, fuel: 'Electric', seats: 5, transmission: 'Automatic' },
  { number: 'KA-01-MN-2345', brand: 'Toyota', model: 'Fortuner', year: 2023, fuel: 'Diesel', seats: 7, transmission: 'Automatic' },
  { number: 'DL-02-OP-6789', brand: 'Honda', model: 'Amaze VX', year: 2024, fuel: 'Petrol', seats: 5, transmission: 'CVT' },
  { number: 'GJ-03-QR-1122', brand: 'Hyundai', model: 'i20 Sportz', year: 2023, fuel: 'Petrol', seats: 5, transmission: 'Manual' },
  { number: 'TN-04-ST-3344', brand: 'Mahindra', model: 'Scorpio N', year: 2024, fuel: 'Diesel', seats: 7, transmission: 'Automatic' },
  { number: 'UP-05-UV-5566', brand: 'Kia', model: 'Seltos HTX', year: 2023, fuel: 'Diesel', seats: 5, transmission: 'Automatic' },
  { number: 'WB-06-WX-7788', brand: 'Renault', model: 'Kwid Climber', year: 2024, fuel: 'Petrol', seats: 5, transmission: 'Manual' },
  { number: 'MP-07-YZ-9900', brand: 'Volkswagen', model: 'Virtus GT', year: 2023, fuel: 'Petrol', seats: 5, transmission: 'DSG' },
];

const platforms = [
  'Uber', 'Ola', 'Rapido', 'Swiggy', 'Zomato',
  'Amazon Flex', 'Dunzo', 'Porter', 'BluSmart', 'Meru',
  'Savaari', 'Intercity Taxi',
];

const expenseCategories = [
  'Fuel', 'Maintenance', 'Toll', 'Parking', 'Insurance',
  'EMI', 'Driver Salary', 'Cleaning', 'Repairs', 'Tyres',
  'Battery', 'Coolant', 'Brake Pads', 'Oil Change', 'AC Service',
];

const paymentModes = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cheque'];

const journalCategories = [
  'Booking Revenue', 'Extra KM Charges', 'Toll Reimbursement',
  'Waiting Charges', 'Night Charges', 'Cancellation Fee',
  'Platform Bonus', 'Peak Pricing', 'Deduction', 'Penalty',
];

const vehicleIds = vehicleData.map((_, i) => `v${i + 1}`);
const vehicleNumbers = vehicleData.map((d) => d.number);

const statuses = ['active', 'available', 'maintenance', 'inactive'];
const bookingStatuses = ['active', 'completed', 'cancelled', 'refunded', 'no_show'];
const expenseStatuses = ['approved', 'pending', 'rejected', 'flagged'];
const journalStatuses = ['collected', 'pending', 'overdue', 'waived'];
const outstandingStatuses = ['pending', 'overdue', 'paid', 'partially_paid'];
const priorityLevels = ['high', 'medium', 'low', 'critical'];
const settlementStatuses = ['pending', 'completed', 'in_progress', 'disputed', 'cancelled'];
const maintenanceStatuses = ['completed', 'in_progress', 'scheduled', 'cancelled'];

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86400000 * randomBetween(1, 3)).toISOString();
}

function generateVehicles() {
  return vehicleData.map((d, i) => ({
    id: vehicleIds[i],
    vehicle_number: d.number,
    brand: d.brand,
    model: d.model,
    year: d.year,
    variant: 'ZXI',
    fuel_type: d.fuel,
    seating_capacity: d.seats,
    transmission: d.transmission,
    owner_name: owners[i % owners.length],
    owner_type: ownerTypes[i % ownerTypes.length],
    status: statuses[i % statuses.length],
    is_active: i < 8,
    created_at: daysAgo(randomBetween(30, 365)),
    updated_at: now,
  }));
}

function generateBookings() {
  return Array.from({ length: 35 }, (_, i) => {
    const vi = i % vehicleIds.length;
    const amt = formatCurrency(randomBetween(500, 12000));
    return {
      id: `b${i + 1}`,
      booking_id: `BK-${String(i + 1).padStart(4, '0')}`,
      vehicle_id: vehicleIds[vi],
      vehicle_number: vehicleNumbers[vi],
      vehicle_name: `${vehicleData[vi].brand} ${vehicleData[vi].model}`,
      platform_id: `p${(i % platforms.length) + 1}`,
      platform_name: platforms[i % platforms.length],
      net_revenue: amt,
      total_amount: formatCurrency(amt + randomBetween(100, 2000)),
      platform_commission: formatCurrency(randomBetween(50, 500)),
      driver_name: pick(owners),
      customer_name: `Customer ${i + 1}`,
      pickup_location: pick(['Mumbai Airport', 'Andheri Station', 'Bandra Kurla', 'Colaba', 'Thane', 'Navi Mumbai', 'Powai', 'Juhu']),
      drop_location: pick(['Airport T2', 'Churchgate', 'Borivali', 'Vashi', 'Panvel', 'Kalyan', 'Dadar', 'Malad']),
      distance_km: randomBetween(5, 150),
      status: pick(bookingStatuses),
      created_at: daysAgo(i),
      updated_at: now,
    };
  });
}

function generateExpenses() {
  return Array.from({ length: 25 }, (_, i) => {
    const vi = i % vehicleIds.length;
    return {
      id: `e${i + 1}`,
      vehicle_id: vehicleIds[vi],
      vehicle_number: vehicleNumbers[vi],
      vehicle_name: `${vehicleData[vi].brand} ${vehicleData[vi].model}`,
      category_name: pick(expenseCategories),
      amount: formatCurrency(randomBetween(200, 15000)),
      status: pick(expenseStatuses),
      vendor: pick(['Bharat Petroleum', 'Shell Garage', 'MRF Tyres', 'AutoZone', 'ServicePoint', 'QuickFix Garage', 'BatteryWorld', 'CoolTech AC']),
      payment_mode_name: pick(paymentModes),
      description: pick(['Regular maintenance', 'Emergency repair', 'Scheduled service', 'Part replacement', 'Routine checkup']),
      invoice_number: `INV-${String(randomBetween(1000, 9999))}`,
      created_at: daysAgo(i),
      updated_at: now,
    };
  });
}

function generateJournal() {
  return Array.from({ length: 20 }, (_, i) => {
    const vi = i % vehicleIds.length;
    return {
      id: `j${i + 1}`,
      vehicle_id: vehicleIds[vi],
      vehicle_number: vehicleNumbers[vi],
      vehicle_name: `${vehicleData[vi].brand} ${vehicleData[vi].model}`,
      category_name: pick(journalCategories),
      amount_collected: formatCurrency(randomBetween(500, 15000)),
      total_amount: formatCurrency(randomBetween(800, 18000)),
      platform_name: pick(platforms),
      status: pick(journalStatuses),
      booking_id: `BK-${String(randomBetween(1, 9999)).padStart(4, '0')}`,
      collected_by: pick(['Cash', 'UPI', 'Bank Transfer']),
      created_at: daysAgo(i),
      updated_at: now,
    };
  });
}

function generateOutstandings() {
  return Array.from({ length: 15 }, (_, i) => {
    const vi = i % vehicleIds.length;
    return {
      id: `o${i + 1}`,
      vehicle_id: vehicleIds[vi],
      vehicle_number: vehicleNumbers[vi],
      vehicle_name: `${vehicleData[vi].brand} ${vehicleData[vi].model}`,
      platform_name: pick(platforms),
      amount: formatCurrency(randomBetween(5000, 150000)),
      paid_amount: formatCurrency(randomBetween(0, 50000)),
      status: pick(outstandingStatuses),
      priority: pick(priorityLevels),
      due_date: daysAgo(randomBetween(-15, 30)),
      description: pick(['Pending settlement', 'Partial payment received', 'Disputed amount', 'Awaiting confirmation']),
      created_at: daysAgo(randomBetween(10, 90)),
      updated_at: now,
    };
  });
}

function generateSettlements() {
  return Array.from({ length: 20 }, (_, i) => {
    const vi = i % vehicleIds.length;
    return {
      id: `s${i + 1}`,
      settlement_id: `STL-${String(i + 1).padStart(4, '0')}`,
      vehicle_id: vehicleIds[vi],
      vehicle_number: vehicleNumbers[vi],
      vehicle_name: `${vehicleData[vi].brand} ${vehicleData[vi].model}`,
      platform_name: pick(platforms),
      total_amount: formatCurrency(randomBetween(25000, 500000)),
      settled_amount: formatCurrency(randomBetween(20000, 450000)),
      commission: formatCurrency(randomBetween(2000, 25000)),
      tds: formatCurrency(randomBetween(500, 5000)),
      net_amount: formatCurrency(randomBetween(18000, 420000)),
      status: pick(settlementStatuses),
      settlement_date: daysAgo(randomBetween(1, 60)),
      period_start: daysAgo(randomBetween(15, 45)),
      period_end: daysAgo(randomBetween(1, 14)),
      created_at: daysAgo(randomBetween(30, 90)),
      updated_at: now,
    };
  });
}

function generateMaintenance() {
  return Array.from({ length: 12 }, (_, i) => {
    const vi = i % vehicleIds.length;
    const parts = [
      { name: 'Engine Oil', quantity: 1, unit_price: 2500 },
      { name: 'Oil Filter', quantity: 1, unit_price: 350 },
      { name: 'Air Filter', quantity: 1, unit_price: 800 },
    ];
    return {
      id: `m${i + 1}`,
      vehicle_id: vehicleIds[vi],
      vehicle_number: vehicleNumbers[vi],
      vehicle_name: `${vehicleData[vi].brand} ${vehicleData[vi].model}`,
      service_type: pick(['Regular Service', 'Major Service', 'Accident Repair', 'Part Replacement', 'AC Service', 'Tyre Change', 'Brake Replacement', 'Battery Replacement']),
      description: pick([
        'Oil change + filter replacement',
        'Complete engine overhaul',
        'Brake pad replacement + disc check',
        'AC gas refill + condenser cleaning',
        'Tyre rotation + wheel alignment',
        'Battery replacement + terminal cleaning',
        'Clutch plate replacement',
        'Timing belt replacement',
        'Coolant flush + refill',
        'Full body polish + waxing',
        'Suspension check + repair',
        'Electrical system diagnostics',
      ]),
      status: pick(maintenanceStatuses),
      cost: formatCurrency(randomBetween(2000, 35000)),
      parts,
      vendor_name: pick(['AutoCare Service', 'QuickFix Garage', 'ProMech Motors', 'Service King', 'CarClinic', 'AutoSpa']),
      odometer_km: randomBetween(5000, 85000),
      scheduled_date: daysAgo(randomBetween(-10, 30)),
      completed_date: pick([null, daysAgo(randomBetween(1, 20))]),
      created_at: daysAgo(randomBetween(10, 120)),
      updated_at: now,
    };
  });
}

function generateVendors() {
  const vendorData = [
    { name: 'Bharat Petroleum', contact: 'Rajesh Kumar', phone: '+91-98765-43210', email: 'rajesh@bharatpetroleum.in', category: 'Fuel', gst: '27AABCU1234F1Z5' },
    { name: 'AutoZone Spares', contact: 'Sneha Patel', phone: '+91-98765-43211', email: 'sneha@autozone.in', category: 'Spare Parts', gst: '27AABCU1234F2Z6' },
    { name: 'Service King Workshop', contact: 'Vijay Singh', phone: '+91-98765-43212', email: 'vijay@serviceking.in', category: 'Service', gst: '27AABCU1234F3Z7' },
    { name: 'MRF Tyre World', contact: 'Amit Jain', phone: '+91-98765-43213', email: 'amit@mrftyres.in', category: 'Tyres', gst: '27AABCU1234F4Z8' },
    { name: 'QuickFix Garage', contact: 'Sandeep Reddy', phone: '+91-98765-43214', email: 'sandeep@quickfix.in', category: 'Repairs', gst: '27AABCU1234F5Z9' },
    { name: 'CoolTech AC Solutions', contact: 'Ankur Gupta', phone: '+91-98765-43215', email: 'ankur@cooltech.in', category: 'AC Service', gst: '27AABCU1234F6Z1' },
    { name: 'BatteryWorld India', contact: 'Neha Sharma', phone: '+91-98765-43216', email: 'neha@batteryworld.in', category: 'Batteries', gst: '27AABCU1234F7Z2' },
    { name: 'ProMech Motors', contact: 'Ravi Verma', phone: '+91-98765-43217', email: 'ravi@promech.in', category: 'Engine', gst: '27AABCU1234F8Z3' },
  ];
  return vendorData.map((d, i) => ({
    id: `vd${i + 1}`,
    name: d.name,
    contact_person: d.contact,
    phone: d.phone,
    email: d.email,
    category: d.category,
    gst_number: d.gst,
    address: pick(['Mumbai', 'Pune', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai']),
    is_active: i < 7,
    created_at: daysAgo(randomBetween(60, 365)),
    updated_at: now,
  }));
}

function generateVehicleOwners() {
  const ownerData = [
    { name: 'Rajesh Sharma', type: 'individual', pan: 'ABCDE1234F', aadhar: '1234-5678-9012', vehicles: 3 },
    { name: 'Priya Patel', type: 'individual', pan: 'BCDEF2345G', aadhar: '2345-6789-0123', vehicles: 2 },
    { name: 'Sharma Fleet Services', type: 'company', pan: 'CDEFG3456H', gst: '27AABCU1234F1Z5', vehicles: 8 },
    { name: 'Amit Singh', type: 'individual', pan: 'DEFGH4567I', aadhar: '3456-7890-1234', vehicles: 1 },
    { name: 'Patel Transport Co.', type: 'company', pan: 'EFGHI5678J', gst: '27AABCU1234F2Z6', vehicles: 5 },
    { name: 'Sunil Verma', type: 'individual', pan: 'FGHIJ6789K', aadhar: '4567-8901-2345', vehicles: 2 },
    { name: 'Anita Gupta', type: 'individual', pan: 'GHIJK7890L', aadhar: '5678-9012-3456', vehicles: 1 },
    { name: 'Reddy Logistic Solutions', type: 'company', pan: 'HIJKL8901M', gst: '27AABCU1234F3Z7', vehicles: 6 },
  ];
  return ownerData.map((d, i) => ({
    id: `vo${i + 1}`,
    name: d.name,
    phone: ownerPhones[i % ownerPhones.length],
    email: `${d.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    owner_type: d.type,
    pan_number: 'pan' in d ? d.pan : undefined,
    aadhar_number: 'aadhar' in d ? d.aadhar : undefined,
    gst_number: 'gst' in d ? d.gst : undefined,
    total_vehicles: d.vehicles,
    is_active: true,
    created_at: daysAgo(randomBetween(60, 365)),
    updated_at: now,
  }));
}

function generateSchedules() {
  const types = ['Oil Change', 'Full Service', 'Tyre Rotation', 'AC Check', 'Brake Inspection', 'Battery Check', 'Coolant Flush', 'Wheel Alignment'];
  return Array.from({ length: 10 }, (_, i) => {
    const vi = i % vehicleIds.length;
    return {
      id: `sch${i + 1}`,
      vehicle_id: vehicleIds[vi],
      vehicle_number: vehicleNumbers[vi],
      service_type: pick(types),
      description: pick(['Routine maintenance', 'As per schedule', 'Mileage based service', 'Time based service']),
      scheduled_date: daysAgo(randomBetween(-5, 45)),
      status: pick(['scheduled', 'overdue', 'completed']),
      odometer_km: randomBetween(5000, 80000),
      assigned_to: pick(owners),
      estimated_cost: formatCurrency(randomBetween(2000, 12000)),
      created_at: daysAgo(randomBetween(30, 90)),
      updated_at: now,
    };
  });
}

function generateNotifications() {
  const messages = [
    { title: 'Insurance Expiring Soon', desc: 'MH-01-AB-1234 insurance expires in 7 days' },
    { title: 'Settlement Pending', desc: '₹45,000 pending from Uber for March week 3' },
    { title: 'Maintenance Due', desc: 'KA-01-MN-2345 is due for 30,000 km service' },
    { title: 'Payment Received', desc: '₹12,500 received from Ola for Trip #BK-0342' },
    { title: 'Document Expiry', desc: 'Pollution certificate expired for DL-02-OP-6789' },
    { title: 'High Expense Alert', desc: 'MH-02-CD-5678 exceeded monthly expense budget by 45%' },
    { title: 'Booking Cancelled', desc: 'Trip BK-0456 cancelled by customer - penalty applied' },
    { title: 'Vehicle Inactive', desc: 'MH-05-IJ-7890 has been inactive for 14 days' },
  ];
  return Array.from({ length: 8 }, (_, i) => ({
    id: `n${i + 1}`,
    title: messages[i].title,
    description: messages[i].desc,
    type: pick(['info', 'warning', 'success', 'error']),
    is_read: i > 2,
    created_at: daysAgo(i),
  }));
}

function generateDashboardData() {
  const dailyRevenue = randomBetween(35000, 95000);
  const dailyExpense = randomBetween(18000, 55000);
  const profit = dailyRevenue - dailyExpense;
  return {
    kpis: {
      todays_revenue: formatCurrency(dailyRevenue),
      weekly_revenue: formatCurrency(dailyRevenue * 6),
      monthly_revenue: formatCurrency(dailyRevenue * 26),
      yearly_revenue: formatCurrency(dailyRevenue * 312),
      todays_expense: formatCurrency(dailyExpense),
      weekly_expense: formatCurrency(dailyExpense * 6),
      monthly_expense: formatCurrency(dailyExpense * 26),
      yearly_expense: formatCurrency(dailyExpense * 312),
      todays_profit: formatCurrency(profit),
      weekly_profit: formatCurrency(profit * 6),
      monthly_profit: formatCurrency(profit * 26),
      yearly_profit: formatCurrency(profit * 312),
      net_profit: formatCurrency(profit * 312),
      net_margin: formatCurrency((profit / dailyRevenue) * 100),
      cash_flow: formatCurrency(dailyRevenue * 0.82),
      outstanding_collections: formatCurrency(randomBetween(250000, 850000)),
      total_vehicles: vehicleIds.length,
      active_vehicles: 8,
      available_vehicles: 3,
      booked_vehicles: 5,
      maintenance_vehicles: 2,
      utilization_rate: randomBetween(60, 85),
      avg_revenue_per_vehicle: formatCurrency(dailyRevenue / vehicleIds.length),
      avg_expense_per_vehicle: formatCurrency(dailyExpense / vehicleIds.length),
    },
    trends: {
      revenue: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => ({
        month: m,
        total: formatCurrency(randomBetween(800000, 2800000)),
      })),
      expense: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => ({
        month: m,
        total: formatCurrency(randomBetween(400000, 1600000)),
      })),
      profit: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => ({
        month: m,
        total: formatCurrency(randomBetween(200000, 1200000)),
      })),
      cash_flow: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => ({
        month: m,
        inflows: formatCurrency(randomBetween(800000, 2800000)),
        outflows: formatCurrency(randomBetween(400000, 1600000)),
      })),
      revenue_growth: { monthly_growth: formatCurrency(randomBetween(5, 25)), quarterly_growth: formatCurrency(randomBetween(8, 35)), yearly_growth: formatCurrency(randomBetween(30, 70)) },
    },
    breakdowns: {
      revenue_by_platform: platforms.slice(0, 8).map((n, i) => ({
        platform_id: `p${i + 1}`,
        platform_name: n,
        total: formatCurrency(randomBetween(150000, 1200000)),
      })),
      expense_by_category: expenseCategories.slice(0, 8).map((n, i) => ({
        category_id: `c${i + 1}`,
        category_name: n,
        total: formatCurrency(randomBetween(50000, 400000)),
      })),
      revenue_by_vehicle: vehicleIds.map((id, i) => ({
        vehicle_id: id,
        vehicle_number: vehicleNumbers[i],
        total: formatCurrency(randomBetween(200000, 1500000)),
      })),
      collections_by_category: journalCategories.slice(0, 6).map((n, i) => ({
        category_id: `jc${i + 1}`,
        category_name: n,
        total: formatCurrency(randomBetween(50000, 600000)),
      })),
    },
    recent: {
      latest_bookings: generateBookings().slice(0, 8),
      latest_journal_entries: generateJournal().slice(0, 8),
      latest_expenses: generateExpenses().slice(0, 8),
    },
    top_vehicles: {
      top_performing: vehicleIds.map((id, i) => ({
        vehicle_id: id,
        vehicle_number: vehicleNumbers[i],
        total_revenue: formatCurrency(randomBetween(500000, 2500000)),
      })),
      top_expense: vehicleIds.map((id, i) => ({
        vehicle_id: id,
        vehicle_number: vehicleNumbers[i],
        total_expense: formatCurrency(randomBetween(200000, 1200000)),
      })),
      most_profitable: vehicleIds.map((id, i) => ({
        vehicle_id: id,
        vehicle_number: vehicleNumbers[i],
        profit: formatCurrency(randomBetween(200000, 1300000)),
        margin: formatCurrency(randomBetween(20, 55)),
      })),
      platform_ranking: platforms.slice(0, 8).map((n, i) => ({
        platform_id: `p${i + 1}`,
        platform_name: n,
        total: formatCurrency(randomBetween(500000, 3000000)),
      })),
    },
    alerts: {
      vehicles_without_bookings: 2,
      vehicles_without_bookings_list: [
        { vehicle_id: 'v11', vehicle_number: 'WB-06-WX-7788' },
        { vehicle_id: 'v12', vehicle_number: 'MP-07-YZ-9900' },
      ],
      high_expense_vehicles: [
        { vehicle_id: 'v2', vehicle_number: 'MH-02-CD-5678', total_expense: formatCurrency(650000) },
        { vehicle_id: 'v6', vehicle_number: 'KA-01-MN-2345', total_expense: formatCurrency(520000) },
      ],
      negative_profit_vehicles: [],
      pending_journal_entries: 4,
      pending_expenses: 3,
    },
    fleet_health: {
      health_score: randomBetween(65, 92),
      insurance_due: 2,
      permit_due: 3,
      fitness_due: 1,
      pollution_due: 2,
      rc_due: 0,
      maintenance_due: 3,
      vehicles_in_maintenance: 2,
      vehicles_without_platform: 1,
      expired_documents: 2,
    },
  };
}

function generateMasterData() {
  return {
    expense_categories: expenseCategories.map((n, i) => ({ id: `c${i + 1}`, name: n, type: 'expense_category' })),
    platforms: platforms.map((n, i) => ({ id: `p${i + 1}`, name: n, type: 'platform' })),
    payment_modes: paymentModes.map((n, i) => ({ id: `pm${i + 1}`, name: n, type: 'payment_mode' })),
    fuel_types: ['Petrol', 'Diesel', 'Electric', 'CNG', 'LPG'].map((n, i) => ({ id: `ft${i + 1}`, name: n, type: 'fuel_type' })),
    owner_types: ['Individual', 'Company', 'Partnership', 'Trust', 'HUF'].map((n, i) => ({ id: `ot${i + 1}`, name: n, type: 'owner_type' })),
    vehicle_statuses: ['Active', 'Available', 'Maintenance', 'Inactive', 'Sold'].map((n, i) => ({ id: `vs${i + 1}`, name: n, type: 'vehicle_status' })),
  };
}

function generateSettings() {
  return {
    company: {
      name: 'Marc8 Fleet Solutions Pvt Ltd',
      address: '42, Tech Park Road, Andheri East, Mumbai - 400093',
      gst: '27AABCU1234F1Z5',
      pan: 'AABCU1234F',
      cin: 'U74999MH2024PTC123456',
      contact_email: 'info@marc8fleet.in',
      contact_phone: '+91-22-6789-1234',
    },
    dashboard: { default_view: 'daily', refresh_interval: 30, show_charts: true, show_alerts: true, compact_mode: false },
    financial: { currency: 'INR', fiscal_year_start: '2026-04-01', tax_rate: 18, tds_rate: 1, commission_rate: 12 },
    notification: { email_alerts: true, push_notifications: true, sms_alerts: false, daily_summary: true, weekly_report: true },
    preferences: { language: 'en-IN', date_format: 'dd/MM/yyyy', time_format: '24h', timezone: 'Asia/Kolkata', theme: 'dark' },
    security: { two_factor: false, session_timeout: 60, password_policy: 'strong', ip_whitelist: [], login_notifications: true },
  };
}

function generateSettlementDashboard() {
  return {
    total_pending: formatCurrency(randomBetween(300000, 1500000)),
    total_completed: formatCurrency(randomBetween(2000000, 8000000)),
    total_in_progress: formatCurrency(randomBetween(150000, 600000)),
    count_pending: randomBetween(8, 25),
    count_completed: randomBetween(30, 80),
    count_in_progress: randomBetween(4, 12),
    monthly_trend: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((m) => ({
      month: m,
      settled: formatCurrency(randomBetween(300000, 1500000)),
      pending: formatCurrency(randomBetween(100000, 400000)),
    })),
    platform_wise: platforms.slice(0, 8).map((n) => ({
      platform: n,
      settled: formatCurrency(randomBetween(400000, 2000000)),
      pending: formatCurrency(randomBetween(50000, 300000)),
    })),
    aging: [
      { bucket: '0-15 days', amount: formatCurrency(randomBetween(100000, 400000)) },
      { bucket: '16-30 days', amount: formatCurrency(randomBetween(50000, 200000)) },
      { bucket: '31-45 days', amount: formatCurrency(randomBetween(30000, 100000)) },
      { bucket: '46-60 days', amount: formatCurrency(randomBetween(15000, 50000)) },
      { bucket: '60+ days', amount: formatCurrency(randomBetween(5000, 25000)) },
    ],
  };
}

function generateAnalytics() {
  return {
    revenue: generateDashboardData().trends.revenue,
    expenses: generateDashboardData().trends.expense,
    profit: generateDashboardData().trends.profit,
    utilization: Array.from({ length: 12 }, (_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      rate: randomBetween(55, 90),
      total_vehicles: vehicleIds.length,
      active_vehicles: randomBetween(6, 10),
    })),
    top_platforms: platforms.slice(0, 6).map((n, i) => ({
      name: n,
      revenue: formatCurrency(randomBetween(500000, 3000000)),
      bookings: randomBetween(50, 500),
      growth: formatCurrency(randomBetween(5, 40)),
    })),
    cost_breakdown: expenseCategories.slice(0, 8).map((n, i) => ({
      category: n,
      amount: formatCurrency(randomBetween(50000, 500000)),
      percentage: formatCurrency(randomBetween(3, 25)),
    })),
  };
}

function generateReports() {
  return Array.from({ length: 6 }, (_, i) => ({
    id: `r${i + 1}`,
    type: pick(['Profit & Loss', 'Revenue Summary', 'Expense Report', 'Fleet Utilization', 'Settlement Report', 'Tax Summary']),
    generated_at: daysAgo(i * 7),
    period: `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]} 2026`,
    total_rows: randomBetween(10, 50),
    status: pick(['completed', 'completed', 'completed', 'failed']),
  }));
}

function generateFleetDashboard() {
  const vehicles = generateVehicles();
  return {
    fleet_health: generateDashboardData().fleet_health,
    vehicles: vehicles.map((v) => ({
      ...v,
      health_score: randomBetween(45, 98),
      last_service: daysAgo(randomBetween(15, 90)),
      next_service: daysAgo(randomBetween(-15, 45)),
      total_revenue_ytd: formatCurrency(randomBetween(200000, 2500000)),
      total_expense_ytd: formatCurrency(randomBetween(100000, 1000000)),
      profit_ytd: formatCurrency(randomBetween(50000, 1500000)),
      documents: {
        insurance_valid: pick([true, true, true, false]),
        pollution_valid: pick([true, true, false, false]),
        fitness_valid: pick([true, true, true, true, false]),
        permit_valid: pick([true, true, true, false]),
      },
    })),
    upcoming_services: generateSchedules().filter(() => Math.random() > 0.5).slice(0, 5),
    alerts: [
      { type: 'warning', message: 'Insurance expiring for 2 vehicles this month', vehicle: '' },
      { type: 'error', message: 'MH-02-CD-5678 missed scheduled maintenance', vehicle: 'MH-02-CD-5678' },
      { type: 'info', message: '3 vehicles due for 30,000 km service', vehicle: '' },
      { type: 'success', message: 'All pollution certificates updated for active fleet', vehicle: '' },
    ],
  };
}

const demoStore: Record<string, unknown> = {};

export function getDemoData(url: string, method: string, body?: unknown): unknown {
  if (url.includes('/auth/login')) {
    return { data: { user: demoUser, token: 'demo-token-guest-access', isFirstLogin: false } };
  }

  if (url.includes('/auth/profile') || url.includes('/auth/me')) {
    return { data: demoUser };
  }

  if (url.includes('/fleet-dashboard') || (url.includes('/dashboard') && !url.includes('/detail') && !url.includes('/owner'))) {
    if (url.includes('fleet')) {
      return { data: generateFleetDashboard() };
    }
    return { data: generateDashboardData() };
  }

  if (url.includes('/settlements/dashboard') || url.includes('/settlement-dashboard')) {
    return { data: generateSettlementDashboard() };
  }

  if (url.includes('/settlements') && !url.includes('/dashboard') && url.includes('/detail')) {
    const s = generateSettlements();
    return { data: s[0] };
  }

  if (url.includes('/settlements')) {
    const data = generateSettlements();
    const page = url.includes('page=') ? parseInt(url.match(/page=(\d+)/)?.[1] || '1') : 1;
    const limit = url.includes('limit=') ? parseInt(url.match(/limit=(\d+)/)?.[1] || '10') : 10;
    return { data: data.slice((page - 1) * limit, page * limit), total: data.length, page, limit, totalPages: Math.ceil(data.length / limit) };
  }

  if (url.includes('/vehicles') && !url.includes('/vehicle-owner') && !url.includes('/vehicle-lifecycle') && !url.includes('/vehicle-financials')) {
    const data = generateVehicles();
    return { data, total: data.length, page: 1, limit: 10, totalPages: 1 };
  }

  if (url.includes('/vehicle-owners') || url.includes('/vehicle_owners')) {
    const data = generateVehicleOwners();
    return { data, total: data.length, page: 1, limit: 10, totalPages: 1 };
  }

  if (url.includes('/vehicle-financials')) {
    return { data: { vehicle: generateVehicles()[0], metrics: { revenue: formatCurrency(850000), expense: formatCurrency(320000), profit: formatCurrency(530000), margin: 62.4 } } };
  }

  if (url.includes('/bookings')) {
    const data = generateBookings();
    return { data, total: data.length, page: 1, limit: 10, totalPages: Math.ceil(data.length / 10) };
  }

  if (url.includes('/expenses')) {
    const data = generateExpenses();
    return { data, total: data.length, page: 1, limit: 10, totalPages: 1 };
  }

  if (url.includes('/journal')) {
    const data = generateJournal();
    return { data, total: data.length, page: 1, limit: 10, totalPages: 1 };
  }

  if (url.includes('/outstandings')) {
    const data = generateOutstandings();
    return { data, total: data.length, page: 1, limit: 10, totalPages: 1 };
  }

  if (url.includes('/maintenance')) {
    const data = generateMaintenance();
    return { data, total: data.length, page: 1, limit: 10, totalPages: 1 };
  }

  if (url.includes('/vendors')) {
    const data = generateVendors();
    return { data, total: data.length, page: 1, limit: 10, totalPages: 1 };
  }

  if (url.includes('/service-schedules') || url.includes('/scheduler')) {
    const data = generateSchedules();
    return { data, total: data.length, page: 1, limit: 10, totalPages: 1 };
  }

  if (url.includes('/notifications')) {
    const data = generateNotifications();
    return { data, total: data.length, page: 1, limit: 10, totalPages: 1 };
  }

  if (url.includes('/analytics')) {
    return { data: generateAnalytics() };
  }

  if (url.includes('/reports')) {
    const data = generateReports();
    return { data, total: data.length, page: 1, limit: 10, totalPages: 1 };
  }

  if (url.includes('/masters') || url.includes('/master-data')) {
    return { data: generateMasterData() };
  }

  if (url.includes('/settings')) {
    return { data: generateSettings() };
  }

  if (url.includes('/activity')) {
    return { data: generateNotifications().slice(0, 5) };
  }

  if (url.includes('/tasks')) {
    return { data: Array.from({ length: 5 }, (_, i) => ({
      id: `t${i + 1}`,
      title: pick(['Verify settlement amounts', 'Update vehicle documents', 'Review expense report', 'Schedule maintenance', 'Approve pending payments', 'Reconcile platform earnings']),
      status: pick(['pending', 'in_progress', 'completed']),
      priority: pick(priorityLevels),
      assigned_to: pick(owners),
      due_date: daysAgo(randomBetween(-5, 14)),
      created_at: daysAgo(randomBetween(10, 30)),
    })) };
  }

  if (url.includes('/approvals') || url.includes('/workflows')) {
    return { data: [] };
  }

  if (url.includes('/automation') || url.includes('/intelligence')) {
    return { data: [] };
  }

  if (url.includes('/sla') || url.includes('/escalation')) {
    return { data: [] };
  }

  if (url.includes('/health')) {
    return { data: { status: 'ok', database: 'connected', uptime: '72h' } };
  }

  if (method === 'POST') {
    const id = `demo-${Date.now()}`;
    const record = { ...(body as Record<string, unknown>), id, created_at: now, updated_at: now };
    demoStore[id] = record;
    return { data: record };
  }

  if (method === 'PUT' || method === 'PATCH') {
    return { data: { ...(body as Record<string, unknown>), updated_at: now } };
  }

  if (method === 'DELETE') {
    return { data: { success: true } };
  }

  return { data: [] };
}
