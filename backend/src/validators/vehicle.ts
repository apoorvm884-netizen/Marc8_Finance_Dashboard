import { z } from 'zod';
import { VEHICLE_STATUSES, FUEL_TYPES, TRANSMISSIONS, OWNERSHIP_TYPES } from '../config/constants';

// Define vehicle-specific constants inline to avoid circular deps
const vehicleStatuses = ['AVAILABLE', 'BOOKED', 'MAINTENANCE', 'INACTIVE'] as const;
const fuelTypes = ['DIESEL', 'PETROL', 'CNG', 'ELECTRIC'] as const;
const transmissions = ['MANUAL', 'AUTOMATIC'] as const;
const ownershipTypes = ['OWNED', 'LEASED', 'RENTAL', 'CO_HOSTED_CLIENT'] as const;

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const dateOrEmpty = () => z.string().regex(dateRegex, 'Invalid date format (YYYY-MM-DD)').optional().nullable();

export const createVehicleSchema = z.object({
  vehicle_number: z.string().min(1, 'Vehicle number is required').max(50, 'Vehicle number must not exceed 50 characters'),
  vehicle_name: z.string().min(1, 'Vehicle name is required').max(200, 'Vehicle name must not exceed 200 characters'),
  fleet_code: z.string().max(50, 'Fleet code must not exceed 50 characters').optional().nullable(),
  brand: z.string().max(100, 'Brand must not exceed 100 characters').optional().nullable(),
  model: z.string().max(100, 'Model must not exceed 100 characters').optional().nullable(),
  variant: z.string().max(100, 'Variant must not exceed 100 characters').optional().nullable(),
  year: z.number().int().min(1900, 'Year must be 1900 or later').max(2100, 'Year must be 2100 or earlier').optional().nullable(),
  color: z.string().max(50, 'Color must not exceed 50 characters').optional().nullable(),
  fuel_type: z.enum(fuelTypes).optional().nullable(),
  transmission: z.enum(transmissions).optional().nullable(),
  ownership_type: z.enum(ownershipTypes).optional().nullable(),
  seating_capacity: z.number().int().min(1, 'Seating capacity must be at least 1').max(100, 'Seating capacity must not exceed 100').optional().nullable(),
  chassis_number: z.string().max(100, 'Chassis number must not exceed 100 characters').optional().nullable(),
  engine_number: z.string().max(100, 'Engine number must not exceed 100 characters').optional().nullable(),
  status: z.enum(vehicleStatuses).optional().default('AVAILABLE'),
  active_platform_id: z.string().uuid().optional().nullable(),
  purchase_date: dateOrEmpty(),
  purchase_price: z.number().min(0, 'Purchase price must be 0 or greater').optional().nullable(),
  current_odometer: z.number().int().min(0, 'Odometer must be 0 or greater').optional().nullable(),
  insurance_expiry: dateOrEmpty(),
  permit_expiry: dateOrEmpty(),
  road_tax_expiry: dateOrEmpty(),
  pollution_expiry: dateOrEmpty(),
  fitness_expiry: dateOrEmpty(),
  rc_expiry: dateOrEmpty(),
  photo: z.string().max(500, 'Photo URL must not exceed 500 characters').optional().nullable(),
  notes: z.string().max(2000, 'Notes must not exceed 2000 characters').optional().nullable(),
});

export const updateVehicleSchema = z.object({
  vehicle_number: z.string().min(1, 'Vehicle number is required').max(50, 'Vehicle number must not exceed 50 characters').optional(),
  vehicle_name: z.string().min(1, 'Vehicle name is required').max(200, 'Vehicle name must not exceed 200 characters').optional(),
  fleet_code: z.string().max(50, 'Fleet code must not exceed 50 characters').optional().nullable(),
  brand: z.string().max(100, 'Brand must not exceed 100 characters').optional().nullable(),
  model: z.string().max(100, 'Model must not exceed 100 characters').optional().nullable(),
  variant: z.string().max(100, 'Variant must not exceed 100 characters').optional().nullable(),
  year: z.number().int().min(1900, 'Year must be 1900 or later').max(2100, 'Year must be 2100 or earlier').optional().nullable(),
  color: z.string().max(50, 'Color must not exceed 50 characters').optional().nullable(),
  fuel_type: z.enum(fuelTypes).optional().nullable(),
  transmission: z.enum(transmissions).optional().nullable(),
  ownership_type: z.enum(ownershipTypes).optional().nullable(),
  seating_capacity: z.number().int().min(1, 'Seating capacity must be at least 1').max(100, 'Seating capacity must not exceed 100').optional().nullable(),
  chassis_number: z.string().max(100, 'Chassis number must not exceed 100 characters').optional().nullable(),
  engine_number: z.string().max(100, 'Engine number must not exceed 100 characters').optional().nullable(),
  status: z.enum(vehicleStatuses).optional(),
  active_platform_id: z.string().uuid().optional().nullable(),
  purchase_date: dateOrEmpty(),
  purchase_price: z.number().min(0, 'Purchase price must be 0 or greater').optional().nullable(),
  current_odometer: z.number().int().min(0, 'Odometer must be 0 or greater').optional().nullable(),
  insurance_expiry: dateOrEmpty(),
  permit_expiry: dateOrEmpty(),
  road_tax_expiry: dateOrEmpty(),
  pollution_expiry: dateOrEmpty(),
  fitness_expiry: dateOrEmpty(),
  rc_expiry: dateOrEmpty(),
  photo: z.string().max(500, 'Photo URL must not exceed 500 characters').optional().nullable(),
  notes: z.string().max(2000, 'Notes must not exceed 2000 characters').optional().nullable(),
  is_active: z.boolean().optional(),
});

export const vehicleIdParamsSchema = z.object({
  id: z.string().min(1, 'Vehicle ID is required').uuid('Invalid vehicle ID format'),
});

export const vehicleQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  status: z.enum(vehicleStatuses).optional(),
  search: z.string().optional(),
  fuel_type: z.enum(fuelTypes).optional(),
  transmission: z.enum(transmissions).optional(),
  ownership_type: z.enum(ownershipTypes).optional(),
  is_active: z.string().optional(),
  include_deleted: z.string().optional(),
  insurance_expiring_soon: z.string().optional(),
  fitness_expiring_soon: z.string().optional(),
  pollution_expiring_soon: z.string().optional(),
});
