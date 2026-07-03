import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Drawer, DrawerContent, DrawerClose } from '@/components/shared/drawer';
import { DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { maintenanceFormSchema, type MaintenanceFormData } from '@/validation/maintenance';
import { maintenanceService } from '@/services/maintenance.service';
import { vehicleService } from '@/services/vehicle.service';
import { vendorService } from '@/services/vendor.service';
import { useNotification } from '@/hooks/use-notification';
import { useMasterValues } from '@/hooks/use-master-values';
import type { MaintenanceRecord, CreateMaintenanceDTO } from '@/types/maintenance';
import type { Vehicle } from '@/types/vehicle';
import type { Vendor } from '@/types/vendor';
import { X, Plus, Trash2 } from 'lucide-react';

interface MaintenanceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: MaintenanceRecord | null;
  onSuccess: () => void;
}

export function MaintenanceForm({ open, onOpenChange, record, onSuccess }: MaintenanceFormProps) {
  const { notify } = useNotification();
  const isEditing = !!record;

  const { getSelectOptions: getStatusOptions, loading: statusLoading } = useMasterValues('maintenance_type');

  const statusOptions = getStatusOptions();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const dropdownLoading = statusLoading || loadingOptions;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceFormSchema) as unknown as Resolver<MaintenanceFormData>,
    defaultValues: {
      vehicle_id: '',
      vendor_id: '',
      maintenance_type_id: '',
      service_date: '',
      odometer_reading: '' as unknown as undefined,
      description: '',
      cost: '' as unknown as undefined,
      vendor_invoice: '',
      warranty_months: '' as unknown as undefined,
      status: 'completed',
      notes: '',
      parts: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'parts',
  });

  const watchedParts = watch('parts');

  const fetchOptions = useCallback(async () => {
    setLoadingOptions(true);
    try {
      const [vehiclesData, vendorsData] = await Promise.all([
        vehicleService.findAll({ limit: 200, is_active: 'true' }),
        vendorService.findAll({ limit: 200 }),
      ]);
      setVehicles((vehiclesData.data ?? []).filter((v: Vehicle) => v.is_active && !v.deleted_at));
      setVendors(vendorsData.data ?? []);
    } catch {
      notify.error('Failed to load form options');
    } finally {
      setLoadingOptions(false);
    }
  }, [notify]);

  useEffect(() => {
    if (open) {
      fetchOptions();
      if (record) {
        reset({
          vehicle_id: record.vehicle_id,
          vendor_id: record.vendor_id || '',
          maintenance_type_id: record.maintenance_type_id,
          service_date: record.service_date || '',
          odometer_reading: record.odometer_reading ?? ('' as unknown as undefined),
          description: record.description || '',
          cost: record.cost ?? ('' as unknown as undefined),
          vendor_invoice: record.vendor_invoice || '',
          warranty_months: record.warranty_months ?? ('' as unknown as undefined),
          status: record.status,
          notes: record.notes || '',
          parts: record.parts?.map((p) => ({
            part_category_id: p.part_category_id || '',
            part_name: p.part_name,
            brand: p.brand || '',
            vendor: p.vendor || '',
            quantity: p.quantity,
            unit_price: p.unit_price,
            total_price: p.total_price ?? ('' as unknown as undefined),
            warranty_months: p.warranty_months ?? ('' as unknown as undefined),
            invoice_number: p.invoice_number || '',
            notes: p.notes || '',
          })) || [],
        });
      } else {
        reset({
          vehicle_id: '',
          vendor_id: '',
          maintenance_type_id: '',
          service_date: '',
          odometer_reading: '' as unknown as undefined,
          description: '',
          cost: '' as unknown as undefined,
          vendor_invoice: '',
          warranty_months: '' as unknown as undefined,
          status: 'completed',
          notes: '',
          parts: [],
        });
      }
    }
  }, [open, record, reset, fetchOptions]);

  const onSubmit = async (data: MaintenanceFormData) => {
    try {
      const parts = (data.parts || []).map((p) => ({
        part_category_id: p.part_category_id || null,
        part_name: p.part_name,
        brand: p.brand || null,
        vendor: p.vendor || null,
        quantity: p.quantity || 1,
        unit_price: p.unit_price,
        total_price: p.unit_price * (p.quantity || 1),
        warranty_months: p.warranty_months ?? null,
        invoice_number: p.invoice_number || null,
        notes: p.notes || null,
      }));

      const payload: CreateMaintenanceDTO = {
        vehicle_id: data.vehicle_id,
        vendor_id: data.vendor_id || null,
        maintenance_type_id: data.maintenance_type_id,
        service_date: data.service_date,
        odometer_reading: data.odometer_reading ?? null,
        description: data.description || null,
        cost: data.cost,
        vendor_invoice: data.vendor_invoice || null,
        warranty_months: data.warranty_months ?? null,
        status: data.status,
        notes: data.notes || null,
        parts,
      };

      if (isEditing && record) {
        await maintenanceService.update(record.id, payload);
        notify.success('Maintenance record updated successfully');
      } else {
        await maintenanceService.create(payload);
        notify.success('Maintenance record created successfully');
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
            {isEditing ? 'Edit Maintenance Record' : 'Add Maintenance Record'}
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
                <div className="space-y-1.5">
                  <Label>Vehicle *</Label>
                  <Select
                    value={watch('vehicle_id')}
                    onValueChange={(v) => setValue('vehicle_id', v)}
                    disabled={loadingOptions}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.vehicle_number} - {v.vehicle_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.vehicle_id?.message && (
                    <p className="text-xs text-red-400">{errors.vehicle_id.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Maintenance Type *</Label>
                  <Select
                    value={watch('maintenance_type_id')}
                    onValueChange={(v) => setValue('maintenance_type_id', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.maintenance_type_id?.message && (
                    <p className="text-xs text-red-400">{errors.maintenance_type_id.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Service Date *"
                  type="date"
                  error={errors.service_date?.message}
                  {...register('service_date')}
                />

                <div className="space-y-1.5">
                  <Label>Vendor</Label>
                  <Select
                    value={watch('vendor_id')}
                    onValueChange={(v) => setValue('vendor_id', v)}
                    disabled={loadingOptions}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Vendor</SelectItem>
                      {vendors.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Odometer Reading (km)"
                  type="number"
                  placeholder="0"
                  min="0"
                  error={errors.odometer_reading?.message}
                  {...register('odometer_reading')}
                />
                <Input
                  label="Cost (₹) *"
                  type="number"
                  placeholder="0"
                  step="0.01"
                  min="0"
                  error={errors.cost?.message}
                  {...register('cost')}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Vendor Invoice"
                  placeholder="e.g. INV-001"
                  error={errors.vendor_invoice?.message}
                  {...register('vendor_invoice')}
                />
                <Input
                  label="Warranty (months)"
                  type="number"
                  placeholder="0"
                  min="0"
                  error={errors.warranty_months?.message}
                  {...register('warranty_months')}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-1">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={watch('status')}
                    onValueChange={(v) => setValue('status', v as MaintenanceFormData['status'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Description</Label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white placeholder:text-secondary-500 transition-all duration-200 focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20 resize-y"
                  placeholder="Describe the maintenance work..."
                  {...register('description')}
                />
                {errors.description?.message && (
                  <p className="text-xs text-red-400">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Notes</Label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white placeholder:text-secondary-500 transition-all duration-200 focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20 resize-y"
                  placeholder="Additional notes..."
                  {...register('notes')}
                />
                {errors.notes?.message && (
                  <p className="text-xs text-red-400">{errors.notes.message}</p>
                )}
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white">Parts</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={<Plus className="h-4 w-4" />}
                    onClick={() =>
                      append({
                        part_category_id: '',
                        part_name: '',
                        brand: '',
                        vendor: '',
                        quantity: 1,
                        unit_price: 0,
                        total_price: '' as unknown as undefined,
                        warranty_months: '' as unknown as undefined,
                        invoice_number: '',
                        notes: '',
                      })
                    }
                  >
                    Add Part
                  </Button>
                </div>
                {fields.length === 0 && (
                  <p className="text-sm text-secondary-500">No parts added yet.</p>
                )}
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="rounded-lg border border-border bg-surface p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-secondary-300">
                          Part #{index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-300"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          label="Part Name *"
                          placeholder="e.g. Brake Pad"
                          error={errors.parts?.[index]?.part_name?.message}
                          {...register(`parts.${index}.part_name`)}
                        />
                        <Input
                          label="Brand"
                          placeholder="e.g. Bosch"
                          {...register(`parts.${index}.brand`)}
                        />
                      </div>
                      <div className="mt-3 grid gap-4 sm:grid-cols-2">
                        <Input
                          label="Vendor"
                          placeholder="e.g. Auto Spares Co."
                          {...register(`parts.${index}.vendor`)}
                        />
                        <Input
                          label="Invoice Number"
                          placeholder="e.g. INV-001"
                          {...register(`parts.${index}.invoice_number`)}
                        />
                      </div>
                      <div className="mt-3 grid gap-4 sm:grid-cols-4">
                        <Input
                          label="Quantity"
                          type="number"
                          min="1"
                          placeholder="1"
                          error={errors.parts?.[index]?.quantity?.message}
                          {...register(`parts.${index}.quantity`)}
                        />
                        <Input
                          label="Unit Price"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          error={errors.parts?.[index]?.unit_price?.message}
                          {...register(`parts.${index}.unit_price`)}
                        />
                        <Input
                          label="Total Price"
                          type="number"
                          step="0.01"
                          placeholder="Auto"
                          disabled
                          value={
                            watchedParts?.[index]
                              ? (Number(watchedParts[index].unit_price || 0) * Number(watchedParts[index].quantity || 1)).toFixed(2)
                              : ''
                          }
                        />
                        <Input
                          label="Warranty (months)"
                          type="number"
                          min="0"
                          placeholder="0"
                          {...register(`parts.${index}.warranty_months`)}
                        />
                      </div>
                      <div className="mt-3 space-y-1.5">
                        <Label>Notes</Label>
                        <textarea
                          className="flex min-h-[60px] w-full rounded-lg border border-border bg-surface-lighter px-3 py-2 text-sm text-white placeholder:text-secondary-500 transition-all duration-200 focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20 resize-y"
                          placeholder="Part notes..."
                          {...register(`parts.${index}.notes`)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
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
              {isEditing ? 'Update Record' : 'Create Record'}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
