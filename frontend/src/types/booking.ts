export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';

export interface Booking {
  id: string;
  vehicle_id: string;
  platform_id: string;
  booking_id: string;
  booking_date_time: string;
  trip_start: string | null;
  trip_end: string | null;
  gross_fare: number;
  doorstep_charges: number;
  platform_commission: number;
  discount: number;
  taxes: number;
  refund: number;
  net_revenue: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  customer_name: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
  // Joined fields from API
  vehicle_number?: string;
  vehicle_name?: string;
  platform_name?: string;
  platform_color?: string;
}

export interface CreateBookingDTO {
  vehicle_id: string;
  platform_id: string;
  booking_id: string;
  booking_date_time: string;
  trip_start?: string | null;
  trip_end?: string | null;
  gross_fare: number;
  doorstep_charges: number;
  platform_commission: number;
  discount?: number;
  taxes?: number;
  refund?: number;
  status?: BookingStatus;
  payment_status?: PaymentStatus;
  customer_name?: string | null;
  remarks?: string | null;
}

export interface UpdateBookingDTO {
  vehicle_id?: string;
  platform_id?: string;
  booking_id?: string;
  booking_date_time?: string;
  trip_start?: string | null;
  trip_end?: string | null;
  gross_fare?: number;
  doorstep_charges?: number;
  platform_commission?: number;
  discount?: number;
  taxes?: number;
  refund?: number;
  status?: BookingStatus;
  payment_status?: PaymentStatus;
  customer_name?: string | null;
  remarks?: string | null;
}

export interface BookingDashboardMetrics {
  todays_revenue: number;
  monthly_revenue: number;
  revenue_by_platform: { platform_id: string; platform_name: string; total: number }[];
  revenue_by_vehicle: { vehicle_id: string; vehicle_number: string; total: number }[];
  latest_bookings: Booking[];
}

