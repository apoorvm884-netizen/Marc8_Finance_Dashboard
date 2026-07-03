import { z } from 'zod';

const bookingStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REFUNDED'] as const;
const paymentStatuses = ['PENDING', 'PARTIALLY_PAID', 'PAID', 'REFUNDED'] as const;

const offlineAddonFields = {
  fastag_amount: z.number().min(0, 'Fastag amount must be 0 or greater').optional().default(0),
  fuel_amount: z.number().min(0, 'Fuel amount must be 0 or greater').optional().default(0),
  incidents_amount: z.number().min(0, 'Incidents amount must be 0 or greater').optional().default(0),
  washing_amount: z.number().min(0, 'Washing amount must be 0 or greater').optional().default(0),
  cancellation_fee: z.number().min(0, 'Cancellation fee must be 0 or greater').optional().default(0),
  late_return_fee: z.number().min(0, 'Late return fee must be 0 or greater').optional().default(0),
  co_driver_fee: z.number().min(0, 'Co-driver fee must be 0 or greater').optional().default(0),
  damage_amount: z.number().min(0, 'Damage amount must be 0 or greater').optional().default(0),
  doorstep_delivery_fee: z.number().min(0, 'Doorstep delivery fee must be 0 or greater').optional().default(0),
  miscellaneous_amount: z.number().min(0, 'Miscellaneous amount must be 0 or greater').optional().default(0),
};

export const createBookingSchema = z.object({
  vehicle_id: z.string().uuid('Invalid vehicle ID'),
  platform_id: z.string().uuid('Invalid platform ID'),
  booking_id: z.string().min(1, 'Booking ID is required').max(100, 'Booking ID must not exceed 100 characters'),
  booking_date_time: z.string().min(1, 'Booking date/time is required'),
  trip_start: z.string().optional().nullable(),
  trip_end: z.string().optional().nullable(),
  gross_fare: z.number().min(0, 'Gross fare must be 0 or greater'),
  doorstep_charges: z.number().min(0, 'Doorstep charges must be 0 or greater'),
  platform_commission: z.number().min(0, 'Platform commission must be 0 or greater'),
  discount: z.number().min(0, 'Discount must be 0 or greater').optional().default(0),
  taxes: z.number().min(0, 'Taxes must be 0 or greater').optional().default(0),
  refund: z.number().min(0, 'Refund must be 0 or greater').optional().default(0),
  status: z.enum(bookingStatuses).optional().default('PENDING'),
  payment_status: z.enum(paymentStatuses).optional().default('PENDING'),
  customer_name: z.string().max(200, 'Customer name must not exceed 200 characters').optional().nullable(),
  customer_phone: z.string().max(20, 'Customer phone must not exceed 20 characters').optional().nullable(),
  start_km: z.number().int().min(0, 'Start km must be 0 or greater').optional().nullable(),
  end_km: z.number().int().min(0, 'End km must be 0 or greater').optional().nullable(),
  pre_check_images: z.array(z.string()).optional().nullable(),
  post_check_images: z.array(z.string()).optional().nullable(),
  ...offlineAddonFields,
  remarks: z.string().max(2000, 'Remarks must not exceed 2000 characters').optional().nullable(),
});

export const updateBookingSchema = z.object({
  vehicle_id: z.string().uuid('Invalid vehicle ID').optional(),
  platform_id: z.string().uuid('Invalid platform ID').optional(),
  booking_id: z.string().min(1, 'Booking ID is required').max(100).optional(),
  booking_date_time: z.string().optional(),
  trip_start: z.string().optional().nullable(),
  trip_end: z.string().optional().nullable(),
  gross_fare: z.number().min(0, 'Gross fare must be 0 or greater').optional(),
  doorstep_charges: z.number().min(0, 'Doorstep charges must be 0 or greater').optional(),
  platform_commission: z.number().min(0, 'Platform commission must be 0 or greater').optional(),
  discount: z.number().min(0, 'Discount must be 0 or greater').optional(),
  taxes: z.number().min(0, 'Taxes must be 0 or greater').optional(),
  refund: z.number().min(0, 'Refund must be 0 or greater').optional(),
  status: z.enum(bookingStatuses).optional(),
  payment_status: z.enum(paymentStatuses).optional(),
  customer_name: z.string().max(200).optional().nullable(),
  customer_phone: z.string().max(20).optional().nullable(),
  start_km: z.number().int().min(0).optional().nullable(),
  end_km: z.number().int().min(0).optional().nullable(),
  pre_check_images: z.array(z.string()).optional().nullable(),
  post_check_images: z.array(z.string()).optional().nullable(),
  ...Object.fromEntries(
    Object.entries(offlineAddonFields).map(([key, schema]) => [key, (schema as z.ZodTypeAny).optional()])
  ),
  remarks: z.string().max(2000).optional().nullable(),
});

export const bookingIdParamsSchema = z.object({
  id: z.string().uuid('Invalid booking ID'),
});

export const bookingQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  status: z.enum(bookingStatuses).optional(),
  payment_status: z.enum(paymentStatuses).optional(),
  search: z.string().optional(),
  vehicle_id: z.string().uuid().optional(),
  platform_id: z.string().uuid().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  customer_phone: z.string().optional(),
});
