import { z } from 'zod';

const bookingStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REFUNDED'] as const;
const paymentStatuses = ['PENDING', 'PARTIALLY_PAID', 'PAID', 'REFUNDED'] as const;

export const bookingFormSchema = z.object({
  vehicle_id: z.string().min(1, 'Vehicle is required'),
  platform_id: z.string().min(1, 'Platform is required'),
  booking_id: z
    .string()
    .min(1, 'Booking ID is required')
    .max(100, 'Booking ID must not exceed 100 characters'),
  booking_date_time: z.string().min(1, 'Booking date/time is required'),
  trip_start: z.string().optional().or(z.literal('')),
  trip_end: z.string().optional().or(z.literal('')),
  gross_fare: z.coerce.number().min(0, 'Gross fare must be 0 or greater').default(0),
  doorstep_charges: z.coerce.number().min(0, 'Doorstep charges must be 0 or greater').default(0),
  platform_commission: z.coerce.number().min(0, 'Platform commission must be 0 or greater').default(0),
  discount: z.coerce.number().min(0, 'Discount must be 0 or greater').default(0),
  taxes: z.coerce.number().min(0, 'Taxes must be 0 or greater').default(0),
  refund: z.coerce.number().min(0, 'Refund must be 0 or greater').default(0),
  status: z.enum(bookingStatuses).default('PENDING'),
  payment_status: z.enum(paymentStatuses).default('PENDING'),
  customer_name: z.string().max(200).optional().or(z.literal('')),
  remarks: z.string().max(2000).optional().or(z.literal('')),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;
