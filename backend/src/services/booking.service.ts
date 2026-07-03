import { getDatabase } from '../config/database';
import { parsePagination, parseSort, parseFilters } from '../utils/helpers';
import { NotFoundError, ConflictError } from '../utils/errors';
import { RevenueCalculator } from './revenue-calculator';
import { CreateBookingDTO, UpdateBookingDTO, PaginationMeta } from '../types';

const BOOKING_ALLOWED_SORT_FIELDS = ['booking_id', 'booking_date_time', 'gross_fare', 'net_revenue', 'status', 'created_at', 'updated_at'] as const;

export class BookingService {
  async create(data: CreateBookingDTO, createdBy?: string) {
    const db = getDatabase();

    const vehicle = await db('vehicles').where({ id: data.vehicle_id }).first();
    if (!vehicle) throw new NotFoundError('Vehicle not found');
    if (vehicle.deleted_at) throw new NotFoundError('Vehicle is deleted');

    const platform = await db('master_values').where({ id: data.platform_id, deleted_at: null }).first();
    if (!platform) throw new NotFoundError('Platform not found');

    const existing = await db('bookings').where({ booking_id: data.booking_id }).first();
    if (existing) throw new ConflictError('Booking ID already exists');

    RevenueCalculator.validateFinancials(data);
    const netRevenue = RevenueCalculator.calculateNetRevenue(
      data.gross_fare,
      data.doorstep_charges,
      data.platform_commission
    );

    const [booking] = await db('bookings').insert({
      vehicle_id: data.vehicle_id,
      platform_id: data.platform_id,
      booking_id: data.booking_id,
      booking_date_time: data.booking_date_time,
      trip_start: data.trip_start || null,
      trip_end: data.trip_end || null,
      gross_fare: data.gross_fare,
      doorstep_charges: data.doorstep_charges,
      platform_commission: data.platform_commission,
      discount: data.discount ?? 0,
      taxes: data.taxes ?? 0,
      refund: data.refund ?? 0,
      net_revenue: netRevenue,
      status: data.status || 'PENDING',
      payment_status: data.payment_status || 'PENDING',
      customer_name: data.customer_name || null,
      customer_phone: data.customer_phone || null,
      start_km: data.start_km ?? null,
      end_km: data.end_km ?? null,
      pre_check_images: data.pre_check_images ? JSON.stringify(data.pre_check_images) : null,
      post_check_images: data.post_check_images ? JSON.stringify(data.post_check_images) : null,
      fastag_amount: data.fastag_amount ?? 0,
      fuel_amount: data.fuel_amount ?? 0,
      incidents_amount: data.incidents_amount ?? 0,
      washing_amount: data.washing_amount ?? 0,
      cancellation_fee: data.cancellation_fee ?? 0,
      late_return_fee: data.late_return_fee ?? 0,
      co_driver_fee: data.co_driver_fee ?? 0,
      damage_amount: data.damage_amount ?? 0,
      doorstep_delivery_fee: data.doorstep_delivery_fee ?? 0,
      miscellaneous_amount: data.miscellaneous_amount ?? 0,
      remarks: data.remarks || null,
      created_by: createdBy || null,
      updated_by: createdBy || null,
    }).returning('*');

    return this.enrichBooking(booking);
  }

  async findAll(query: {
    page?: string;
    limit?: string;
    sort_by?: string;
    sort_order?: string;
    status?: string;
    search?: string;
    vehicle_id?: string;
    platform_id?: string;
    date_from?: string;
    date_to?: string;
    include_deleted?: string;
  }) {
    const db = getDatabase();
    const pagination = parsePagination(query);
    const sort = parseSort(query, [...BOOKING_ALLOWED_SORT_FIELDS]);
    const filters = parseFilters(query, ['status', 'payment_status', 'search', 'vehicle_id', 'platform_id']);

    let queryBuilder = db('bookings')
      .leftJoin('vehicles', 'bookings.vehicle_id', 'vehicles.id')
      .leftJoin('master_values as platforms', 'bookings.platform_id', 'platforms.id')
      .select(
        'bookings.*',
        'vehicles.vehicle_number',
        'vehicles.vehicle_name',
        'platforms.name as platform_name',
        'platforms.color as platform_color'
      );

    if (query.include_deleted !== 'true') {
      queryBuilder = queryBuilder.whereNull('bookings.deleted_at');
    }

    if (filters.status) {
      queryBuilder = queryBuilder.where('bookings.status', filters.status);
    }

    if (filters.payment_status) {
      queryBuilder = queryBuilder.where('bookings.payment_status', filters.payment_status);
    }

    if (filters.vehicle_id) {
      queryBuilder = queryBuilder.where('bookings.vehicle_id', filters.vehicle_id);
    }

    if (filters.platform_id) {
      queryBuilder = queryBuilder.where('bookings.platform_id', filters.platform_id);
    }

    if (query.date_from) {
      queryBuilder = queryBuilder.where('bookings.booking_date_time', '>=', query.date_from);
    }

    if (query.date_to) {
      queryBuilder = queryBuilder.where('bookings.booking_date_time', '<=', query.date_to);
    }

    if (filters.search) {
      queryBuilder = queryBuilder.where(function () {
        this.where('bookings.booking_id', 'ilike', `%${filters.search}%`)
          .orWhere('vehicles.vehicle_number', 'ilike', `%${filters.search}%`)
          .orWhere('vehicles.vehicle_name', 'ilike', `%${filters.search}%`);
      });
    }

    const countQuery = queryBuilder.clone();
    const countResult = await countQuery.count('* as count').first() as { count: string | number } | undefined;
    const total = Number(countResult?.count ?? 0);

    const bookings = await queryBuilder
      .orderBy(sort.column, sort.order)
      .limit(pagination.limit)
      .offset(pagination.offset);

    const meta: PaginationMeta = {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
      hasNextPage: pagination.page * pagination.limit < total,
      hasPreviousPage: pagination.page > 1,
    };

    return { data: bookings, meta };
  }

  async findById(id: string) {
    const db = getDatabase();

    const booking = await db('bookings')
      .leftJoin('vehicles', 'bookings.vehicle_id', 'vehicles.id')
      .leftJoin('master_values as platforms', 'bookings.platform_id', 'platforms.id')
      .select(
        'bookings.*',
        'vehicles.vehicle_number',
        'vehicles.vehicle_name',
        'platforms.name as platform_name',
        'platforms.color as platform_color'
      )
      .where('bookings.id', id)
      .whereNull('bookings.deleted_at')
      .first();

    if (!booking) throw new NotFoundError('Booking not found');

    return booking;
  }

  async update(id: string, data: UpdateBookingDTO, updatedBy?: string) {
    const db = getDatabase();

    const booking = await db('bookings').where({ id }).first();
    if (!booking) throw new NotFoundError('Booking not found');

    if (data.vehicle_id) {
      const vehicle = await db('vehicles').where({ id: data.vehicle_id }).first();
      if (!vehicle) throw new NotFoundError('Vehicle not found');
    }

    if (data.platform_id) {
      const platform = await db('master_values').where({ id: data.platform_id, deleted_at: null }).first();
      if (!platform) throw new NotFoundError('Platform not found');
    }

    if (data.booking_id && data.booking_id !== booking.booking_id) {
      const existing = await db('bookings').where({ booking_id: data.booking_id }).whereNot({ id }).first();
      if (existing) throw new ConflictError('Booking ID already exists');
    }

    const grossFare = data.gross_fare ?? Number(booking.gross_fare);
    const doorstepCharges = data.doorstep_charges ?? Number(booking.doorstep_charges);
    const platformCommission = data.platform_commission ?? Number(booking.platform_commission);

    RevenueCalculator.validateFinancials({ gross_fare: grossFare, doorstep_charges: doorstepCharges, platform_commission: platformCommission });
    const netRevenue = RevenueCalculator.calculateNetRevenue(grossFare, doorstepCharges, platformCommission);

    const updateData: Record<string, unknown> = {
      updated_at: db.fn.now(),
      updated_by: updatedBy || null,
      net_revenue: netRevenue,
    };

    const fields: (keyof UpdateBookingDTO)[] = [
      'vehicle_id', 'platform_id', 'booking_id', 'booking_date_time',
      'trip_start', 'trip_end', 'gross_fare', 'doorstep_charges',
      'platform_commission', 'discount', 'taxes', 'refund',
      'status', 'payment_status', 'customer_name', 'customer_phone',
      'start_km', 'end_km',
      'fastag_amount', 'fuel_amount', 'incidents_amount', 'washing_amount',
      'cancellation_fee', 'late_return_fee', 'co_driver_fee', 'damage_amount',
      'doorstep_delivery_fee', 'miscellaneous_amount',
      'remarks',
    ];

    for (const field of fields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    if (data.pre_check_images !== undefined) {
      updateData.pre_check_images = JSON.stringify(data.pre_check_images);
    }
    if (data.post_check_images !== undefined) {
      updateData.post_check_images = JSON.stringify(data.post_check_images);
    }

    await db('bookings').where({ id }).update(updateData);

    return this.findById(id);
  }

  async delete(id: string, deletedBy?: string) {
    const db = getDatabase();
    const booking = await db('bookings').where({ id }).first();
    if (!booking) throw new NotFoundError('Booking not found');

    await db('bookings').where({ id }).update({
      deleted_at: db.fn.now(),
      deleted_by: deletedBy || null,
      updated_at: db.fn.now(),
    });

    return { message: 'Booking deleted successfully' };
  }

  async restore(id: string, updatedBy?: string) {
    const db = getDatabase();
    const booking = await db('bookings').where({ id }).first();
    if (!booking) throw new NotFoundError('Booking not found');

    await db('bookings').where({ id }).update({
      deleted_at: null,
      deleted_by: null,
      updated_by: updatedBy || null,
      updated_at: db.fn.now(),
    });

    return this.findById(id);
  }

  async duplicate(id: string, createdBy?: string) {
    const db = getDatabase();
    const booking = await db('bookings').where({ id }).first();
    if (!booking) throw new NotFoundError('Booking not found');

    const newBookingId = `${booking.booking_id}-copy`;
    const [duplicated] = await db('bookings').insert({
      vehicle_id: booking.vehicle_id,
      platform_id: booking.platform_id,
      booking_id: newBookingId,
      booking_date_time: booking.booking_date_time,
      trip_start: booking.trip_start,
      trip_end: booking.trip_end,
      gross_fare: booking.gross_fare,
      doorstep_charges: booking.doorstep_charges,
      platform_commission: booking.platform_commission,
      net_revenue: booking.net_revenue,
      discount: booking.discount,
      taxes: booking.taxes,
      refund: 0,
      status: 'PENDING',
      payment_status: 'PENDING',
      customer_name: booking.customer_name,
      customer_phone: booking.customer_phone,
      start_km: booking.start_km,
      end_km: booking.end_km,
      pre_check_images: booking.pre_check_images,
      post_check_images: booking.post_check_images,
      fastag_amount: booking.fastag_amount ?? 0,
      fuel_amount: booking.fuel_amount ?? 0,
      incidents_amount: booking.incidents_amount ?? 0,
      washing_amount: booking.washing_amount ?? 0,
      cancellation_fee: booking.cancellation_fee ?? 0,
      late_return_fee: booking.late_return_fee ?? 0,
      co_driver_fee: booking.co_driver_fee ?? 0,
      damage_amount: booking.damage_amount ?? 0,
      doorstep_delivery_fee: booking.doorstep_delivery_fee ?? 0,
      miscellaneous_amount: booking.miscellaneous_amount ?? 0,
      remarks: `Duplicated from ${booking.booking_id}`,
      created_by: createdBy || null,
      updated_by: createdBy || null,
    }).returning('*');

    return this.findById(duplicated.id);
  }

  async getDashboardMetrics() {
    const db = getDatabase();

    const bookings = await db('bookings')
      .leftJoin('vehicles', 'bookings.vehicle_id', 'vehicles.id')
      .leftJoin('master_values as platforms', 'bookings.platform_id', 'platforms.id')
      .select(
        'bookings.*',
        'vehicles.vehicle_number',
        'platforms.name as platform_name'
      )
      .whereNull('bookings.deleted_at')
      .whereIn('bookings.status', ['COMPLETED', 'CONFIRMED']);

    const metrics = RevenueCalculator.calculateDashboardMetrics(bookings);

    const latestBookings = await db('bookings')
      .leftJoin('vehicles', 'bookings.vehicle_id', 'vehicles.id')
      .leftJoin('master_values as platforms', 'bookings.platform_id', 'platforms.id')
      .select(
        'bookings.*',
        'vehicles.vehicle_number',
        'vehicles.vehicle_name',
        'platforms.name as platform_name'
      )
      .whereNull('bookings.deleted_at')
      .orderBy('bookings.created_at', 'desc')
      .limit(5);

    return {
      ...metrics,
      latest_bookings: latestBookings,
    };
  }

  private async enrichBooking(booking: any): Promise<any> {
    const db = getDatabase();
    const vehicle = await db('vehicles').where({ id: booking.vehicle_id }).select('vehicle_number', 'vehicle_name').first();
    const platform = await db('master_values').where({ id: booking.platform_id }).select('name', 'color').first();
    return {
      ...booking,
      vehicle_number: vehicle?.vehicle_number || null,
      vehicle_name: vehicle?.vehicle_name || null,
      platform_name: platform?.name || null,
      platform_color: platform?.color || null,
    };
  }
}

export const bookingService = new BookingService();
