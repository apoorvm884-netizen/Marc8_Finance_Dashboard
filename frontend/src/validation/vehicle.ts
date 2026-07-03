import { z } from 'zod';

const vehicleStatuses = ['AVAILABLE', 'BOOKED', 'MAINTENANCE', 'INACTIVE'] as const;
const fuelTypes = ['DIESEL', 'PETROL', 'CNG', 'ELECTRIC'] as const;
const transmissions = ['MANUAL', 'AUTOMATIC'] as const;
const ownershipTypes = ['OWNED', 'LEASED', 'RENTAL', 'CO_HOSTED_CLIENT'] as const;

const dateField = z.string().optional().or(z.literal(''));

export const vehicleFormSchema = z.object({
  vehicle_number: z
    .string()
    .min(1, 'Vehicle number is required')
    .max(50, 'Vehicle number must not exceed 50 characters'),
  vehicle_name: z
    .string()
    .min(1, 'Vehicle name is required')
    .max(200, 'Vehicle name must not exceed 200 characters'),
  fleet_code: z.string().max(50).optional().or(z.literal('')),
  brand: z.string().max(100).optional().or(z.literal('')),
  model: z.string().max(100).optional().or(z.literal('')),
  variant: z.string().max(100).optional().or(z.literal('')),
  year: z.coerce.number().int().min(1900, 'Year must be 1900 or later').max(2100).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  color: z.string().max(50).optional().or(z.literal('')),
  fuel_type: z.enum(fuelTypes).optional().or(z.literal('')),
  transmission: z.enum(transmissions).optional().or(z.literal('')),
  ownership_type: z.enum(ownershipTypes).optional().or(z.literal('')),
  seating_capacity: z.coerce.number().int().min(1).max(100).optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  chassis_number: z.string().max(100).optional().or(z.literal('')),
  engine_number: z.string().max(100).optional().or(z.literal('')),
  status: z.enum(vehicleStatuses).default('AVAILABLE'),
  purchase_date: dateField,
  purchase_price: z.coerce.number().min(0, 'Must be 0 or greater').optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  current_odometer: z.coerce.number().int().min(0, 'Must be 0 or greater').optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  insurance_expiry: dateField,
  permit_expiry: dateField,
  road_tax_expiry: dateField,
  pollution_expiry: dateField,
  fitness_expiry: dateField,
  rc_expiry: dateField,
  photo: z.string().max(500).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export type VehicleFormData = z.infer<typeof vehicleFormSchema>;

export const VEHICLE_STATUS_OPTIONS = vehicleStatuses;
export const FUEL_TYPE_OPTIONS = fuelTypes;
export const TRANSMISSION_OPTIONS = transmissions;
export const OWNERSHIP_TYPE_OPTIONS = ownershipTypes;
