import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Drawer, DrawerContent, DrawerClose } from '@/components/shared/drawer';
import { DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { vehicleFormSchema, type VehicleFormData } from '@/validation/vehicle';
import { vehicleService } from '@/services/vehicle.service';
import { useNotification } from '@/hooks/use-notification';
import { useMasterValues } from '@/hooks/use-master-values';
import type { Vehicle } from '@/types/vehicle';
import { X, Camera } from 'lucide-react';

interface VehicleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: Vehicle | null;
  onSuccess: () => void;
}

export function VehicleForm({ open, onOpenChange, vehicle, onSuccess }: VehicleFormProps) {
  const { notify } = useNotification();
  const isEditing = !!vehicle;

  const { getSelectOptions: getStatusOptions, loading: statusLoading } = useMasterValues('vehicle_status');
  const { getSelectOptions: getFuelOptions, loading: fuelLoading } = useMasterValues('fuel_type');
  const { getSelectOptions: getTransmissionOptions, loading: transmissionLoading } = useMasterValues('transmission_type');
  const { getSelectOptions: getOwnershipOptions, loading: ownershipLoading } = useMasterValues('ownership_type');

  const statusOptions = getStatusOptions();
  const fuelOptions = getFuelOptions();
  const transmissionOptions = getTransmissionOptions();
  const ownershipOptions = getOwnershipOptions();

  const dropdownLoading = statusLoading || fuelLoading || transmissionLoading || ownershipLoading;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema) as unknown as Resolver<VehicleFormData>,
    defaultValues: {
      vehicle_number: '',
      vehicle_name: '',
      fleet_code: '',
      brand: '',
      model: '',
      variant: '',
      year: '' as unknown as undefined,
      color: '',
      fuel_type: '' as unknown as undefined,
      transmission: '' as unknown as undefined,
      ownership_type: '' as unknown as undefined,
      seating_capacity: '' as unknown as undefined,
      chassis_number: '',
      engine_number: '',
      status: 'AVAILABLE',
      purchase_date: '',
      purchase_price: '' as unknown as undefined,
      current_odometer: '' as unknown as undefined,
      insurance_expiry: '',
      permit_expiry: '',
      road_tax_expiry: '',
      pollution_expiry: '',
      fitness_expiry: '',
      rc_expiry: '',
      photo: '',
      notes: '',
    },
  });

  const watchedStatus = watch('status');
  const watchedFuelType = watch('fuel_type');
  const watchedTransmission = watch('transmission');
  const watchedOwnership = watch('ownership_type');

  useEffect(() => {
    if (vehicle) {
      reset({
        vehicle_number: vehicle.vehicle_number,
        vehicle_name: vehicle.vehicle_name,
        fleet_code: vehicle.fleet_code || '',
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        variant: vehicle.variant || '',
        year: vehicle.year ?? ('' as unknown as undefined),
        color: vehicle.color || '',
        fuel_type: (vehicle.fuel_type as VehicleFormData['fuel_type']) || undefined,
        transmission: (vehicle.transmission as VehicleFormData['transmission']) || undefined,
        ownership_type: (vehicle.ownership_type as VehicleFormData['ownership_type']) || undefined,
        seating_capacity: vehicle.seating_capacity ?? ('' as unknown as undefined),
        chassis_number: vehicle.chassis_number || '',
        engine_number: vehicle.engine_number || '',
        status: vehicle.status,
        purchase_date: vehicle.purchase_date || '',
        purchase_price: vehicle.purchase_price ?? ('' as unknown as undefined),
        current_odometer: vehicle.current_odometer ?? ('' as unknown as undefined),
        insurance_expiry: vehicle.insurance_expiry || '',
        permit_expiry: vehicle.permit_expiry || '',
        road_tax_expiry: vehicle.road_tax_expiry || '',
        pollution_expiry: vehicle.pollution_expiry || '',
        fitness_expiry: vehicle.fitness_expiry || '',
        rc_expiry: vehicle.rc_expiry || '',
        photo: vehicle.photo || '',
        notes: vehicle.notes || '',
      });
    } else {
      reset({
        vehicle_number: '',
        vehicle_name: '',
        fleet_code: '',
        brand: '',
        model: '',
        variant: '',
        year: '' as unknown as undefined,
        color: '',
        fuel_type: '' as unknown as undefined,
        transmission: '' as unknown as undefined,
        ownership_type: '' as unknown as undefined,
        seating_capacity: '' as unknown as undefined,
        chassis_number: '',
        engine_number: '',
        status: 'AVAILABLE',
        purchase_date: '',
        purchase_price: '' as unknown as undefined,
        current_odometer: '' as unknown as undefined,
        insurance_expiry: '',
        permit_expiry: '',
        road_tax_expiry: '',
        pollution_expiry: '',
        fitness_expiry: '',
        rc_expiry: '',
        photo: '',
        notes: '',
      });
    }
  }, [vehicle, reset, open]);

  const onSubmit = async (data: VehicleFormData) => {
    try {
      const payload = {
        vehicle_number: data.vehicle_number,
        vehicle_name: data.vehicle_name,
        fleet_code: data.fleet_code || null,
        brand: data.brand || null,
        model: data.model || null,
        variant: data.variant || null,
        year: data.year ?? null,
        color: data.color || null,
        fuel_type: (data.fuel_type as VehicleFormData['fuel_type']) || null,
        transmission: (data.transmission as VehicleFormData['transmission']) || null,
        ownership_type: (data.ownership_type as VehicleFormData['ownership_type']) || null,
        seating_capacity: data.seating_capacity ?? null,
        chassis_number: data.chassis_number || null,
        engine_number: data.engine_number || null,
        status: data.status,
        purchase_date: data.purchase_date || null,
        purchase_price: data.purchase_price ?? null,
        current_odometer: data.current_odometer ?? null,
        insurance_expiry: data.insurance_expiry || null,
        permit_expiry: data.permit_expiry || null,
        road_tax_expiry: data.road_tax_expiry || null,
        pollution_expiry: data.pollution_expiry || null,
        fitness_expiry: data.fitness_expiry || null,
        rc_expiry: data.rc_expiry || null,
        photo: data.photo || null,
        notes: data.notes || null,
      };

      if (isEditing && vehicle) {
        await vehicleService.update(vehicle.id, payload);
        notify.success('Vehicle updated successfully');
      } else {
        await vehicleService.create(payload);
        notify.success('Vehicle created successfully');
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Operation failed';
      notify.error(message);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent size="lg">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <DialogTitle className="text-lg">
            {isEditing ? 'Edit Vehicle' : 'Add Vehicle'}
          </DialogTitle>
          <DrawerClose className="rounded-md p-1 text-secondary-400 opacity-70 transition-opacity hover:opacity-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent-500">
            <X className="h-5 w-5" />
          </DrawerClose>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Vehicle Number *"
                  placeholder="e.g. MH-01-AB-1234"
                  error={errors.vehicle_number?.message}
                  {...register('vehicle_number')}
                />
                <Input
                  label="Vehicle Name *"
                  placeholder="e.g. Tata 407"
                  error={errors.vehicle_name?.message}
                  {...register('vehicle_name')}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Fleet Code"
                  placeholder="e.g. FLEET-001"
                  error={errors.fleet_code?.message}
                  {...register('fleet_code')}
                />
                <Input
                  label="Variant"
                  placeholder="e.g. LX, VX, ZX"
                  error={errors.variant?.message}
                  {...register('variant')}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <Input
                  label="Brand"
                  placeholder="e.g. Tata"
                  error={errors.brand?.message}
                  {...register('brand')}
                />
                <Input
                  label="Model"
                  placeholder="e.g. 407"
                  error={errors.model?.message}
                  {...register('model')}
                />
                <Input
                  label="Year"
                  type="number"
                  placeholder="e.g. 2024"
                  error={errors.year?.message}
                  {...register('year')}
                />
                <Input
                  label="Color"
                  placeholder="e.g. White"
                  error={errors.color?.message}
                  {...register('color')}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-1.5">
                  <Label>Fuel Type</Label>
                  <Select
                    value={watchedFuelType || ''}
                    onValueChange={(v) => setValue('fuel_type', v === '' ? undefined : v as VehicleFormData['fuel_type'])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      {fuelOptions.map((ft) => (
                        <SelectItem key={ft.value} value={ft.value}>
                          {ft.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.fuel_type?.message && (
                    <p className="text-xs text-red-400">{errors.fuel_type.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Transmission</Label>
                  <Select
                    value={watchedTransmission || ''}
                    onValueChange={(v) => setValue('transmission', v === '' ? undefined : v as VehicleFormData['transmission'])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select transmission" />
                    </SelectTrigger>
                    <SelectContent>
                      {transmissionOptions.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Ownership</Label>
                  <Select
                    value={watchedOwnership || ''}
                    onValueChange={(v) => setValue('ownership_type', v === '' ? undefined : v as VehicleFormData['ownership_type'])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ownership" />
                    </SelectTrigger>
                    <SelectContent>
                      {ownershipOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={watchedStatus}
                    onValueChange={(v) => setValue('status', v as VehicleFormData['status'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.length > 0 ? statusOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      )) : (
                        <SelectItem value="AVAILABLE">Available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  label="Seating Capacity"
                  type="number"
                  placeholder="e.g. 4"
                  min="1"
                  max="100"
                  error={errors.seating_capacity?.message}
                  {...register('seating_capacity')}
                />
                <Input
                  label="Chassis Number"
                  placeholder="Chassis number"
                  error={errors.chassis_number?.message}
                  {...register('chassis_number')}
                />
                <Input
                  label="Engine Number"
                  placeholder="Engine number"
                  error={errors.engine_number?.message}
                  {...register('engine_number')}
                />
              </div>

              <div>
                <h3 className="mb-3 text-sm font-medium text-white">Financial Details</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input
                    label="Purchase Date"
                    type="date"
                    error={errors.purchase_date?.message}
                    {...register('purchase_date')}
                  />
                  <Input
                    label="Purchase Price"
                    type="number"
                    placeholder="0"
                    step="0.01"
                    min="0"
                    error={errors.purchase_price?.message}
                    {...register('purchase_price')}
                  />
                  <Input
                    label="Current Odometer (km)"
                    type="number"
                    placeholder="0"
                    min="0"
                    error={errors.current_odometer?.message}
                    {...register('current_odometer')}
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-medium text-white">Document Expiry Dates</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input
                    label="Insurance Expiry"
                    type="date"
                    error={errors.insurance_expiry?.message}
                    {...register('insurance_expiry')}
                  />
                  <Input
                    label="Permit Expiry"
                    type="date"
                    error={errors.permit_expiry?.message}
                    {...register('permit_expiry')}
                  />
                  <Input
                    label="Road Tax Expiry"
                    type="date"
                    error={errors.road_tax_expiry?.message}
                    {...register('road_tax_expiry')}
                  />
                  <Input
                    label="Pollution Expiry"
                    type="date"
                    error={errors.pollution_expiry?.message}
                    {...register('pollution_expiry')}
                  />
                  <Input
                    label="Fitness Expiry"
                    type="date"
                    error={errors.fitness_expiry?.message}
                    {...register('fitness_expiry')}
                  />
                  <Input
                    label="RC Expiry"
                    type="date"
                    error={errors.rc_expiry?.message}
                    {...register('rc_expiry')}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Photo URL</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="https://example.com/vehicle-photo.jpg"
                      error={errors.photo?.message}
                      {...register('photo')}
                    />
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-secondary-400">
                    <Camera className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Notes</Label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white placeholder:text-secondary-500 transition-all duration-200 focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20 resize-y"
                  placeholder="Additional notes..."
                  {...register('notes')}
                />
                {errors.notes?.message && (
                  <p className="text-xs text-red-400">{errors.notes.message}</p>
                )}
              </div>
            </motion.div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
            <DrawerClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DrawerClose>
            <Button type="submit" loading={isSubmitting || dropdownLoading}>
              {isEditing ? 'Update Vehicle' : 'Create Vehicle'}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
