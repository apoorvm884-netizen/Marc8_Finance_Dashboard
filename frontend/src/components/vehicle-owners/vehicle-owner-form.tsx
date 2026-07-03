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
import { vehicleOwnerFormSchema, type VehicleOwnerFormData } from '@/validation/vehicle-owner';
import { vehicleOwnerService } from '@/services/vehicle-owner.service';
import { useNotification } from '@/hooks/use-notification';
import { useMasterValues } from '@/hooks/use-master-values';
import type { VehicleOwner } from '@/types/vehicle-owner';
import { X } from 'lucide-react';

interface VehicleOwnerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  owner?: VehicleOwner | null;
  onSuccess: () => void;
}

export function VehicleOwnerForm({ open, onOpenChange, owner, onSuccess }: VehicleOwnerFormProps) {
  const { notify } = useNotification();
  const isEditing = !!owner;

  const { getSelectOptions: getOwnerTypeOptions } = useMasterValues('ownership_type');
  const ownerTypeOptions = getOwnerTypeOptions();
  const { getSelectOptions: getOwnerStatusOptions } = useMasterValues('owner_status');
  const ownerStatusOptions = getOwnerStatusOptions();
  const { getSelectOptions: getAgreementStatusOptions } = useMasterValues('owner_agreement_status');
  const agreementStatusOptions = getAgreementStatusOptions();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VehicleOwnerFormData>({
    resolver: zodResolver(vehicleOwnerFormSchema) as unknown as Resolver<VehicleOwnerFormData>,
    defaultValues: {
      name: '',
      owner_type: '',
      contact_person: '',
      phone: '',
      email: '',
      pan: '',
      aadhaar: '',
      gst: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      bank_account_number: '',
      bank_name: '',
      bank_ifsc: '',
      upi_id: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      agreement_number: '',
      agreement_start_date: '',
      agreement_end_date: '',
      ownership_status: '',
      agreement_status: '',
      notes: '',
      is_active: true,
    },
  });

  const watchedOwnerType = watch('owner_type');
  const watchedOwnerStatus = watch('ownership_status');
  const watchedAgreementStatus = watch('agreement_status');

  useEffect(() => {
    if (owner) {
      reset({
        name: owner.name,
        owner_type: owner.owner_type || '',
        contact_person: owner.contact_person || '',
        phone: owner.phone || '',
        email: owner.email || '',
        pan: owner.pan || '',
        aadhaar: owner.aadhaar || '',
        gst: owner.gst || '',
        address: owner.address || '',
        city: owner.city || '',
        state: owner.state || '',
        pincode: owner.pincode || '',
        bank_account_number: owner.bank_account_number || '',
        bank_name: owner.bank_name || '',
        bank_ifsc: owner.bank_ifsc || '',
        upi_id: owner.upi_id || '',
        emergency_contact_name: owner.emergency_contact_name || '',
        emergency_contact_phone: owner.emergency_contact_phone || '',
        agreement_number: owner.agreement_number || '',
        agreement_start_date: owner.agreement_start_date || '',
        agreement_end_date: owner.agreement_end_date || '',
        ownership_status: owner.ownership_status || '',
        agreement_status: owner.agreement_status || '',
        notes: owner.notes || '',
        is_active: owner.is_active,
      });
    } else {
      reset({
        name: '',
        owner_type: '',
        contact_person: '',
        phone: '',
        email: '',
        pan: '',
        aadhaar: '',
        gst: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        bank_account_number: '',
        bank_name: '',
        bank_ifsc: '',
        upi_id: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        agreement_number: '',
        agreement_start_date: '',
        agreement_end_date: '',
        ownership_status: '',
        agreement_status: '',
        notes: '',
        is_active: true,
      });
    }
  }, [owner, reset, open]);

  const onSubmit = async (data: VehicleOwnerFormData) => {
    try {
      const payload = {
        name: data.name,
        owner_type: (data.owner_type || 'client_owned') as any,
        contact_person: data.contact_person || null,
        phone: data.phone || null,
        email: data.email || null,
        pan: data.pan || null,
        aadhaar: data.aadhaar || null,
        gst: data.gst || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        pincode: data.pincode || null,
        bank_account_number: data.bank_account_number || null,
        bank_name: data.bank_name || null,
        bank_ifsc: data.bank_ifsc || null,
        upi_id: data.upi_id || null,
        emergency_contact_name: data.emergency_contact_name || null,
        emergency_contact_phone: data.emergency_contact_phone || null,
        agreement_number: data.agreement_number || null,
        agreement_start_date: data.agreement_start_date || null,
        agreement_end_date: data.agreement_end_date || null,
        ownership_status: (data.ownership_status || 'active') as any,
        agreement_status: (data.agreement_status || 'active') as any,
        notes: data.notes || null,
        is_active: data.is_active,
      };

      if (isEditing && owner) {
        await vehicleOwnerService.update(owner.id, payload);
        notify.success('Owner updated successfully');
      } else {
        await vehicleOwnerService.create(payload);
        notify.success('Owner created successfully');
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
      <DrawerContent size="2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <DialogTitle className="text-lg">
            {isEditing ? 'Edit Vehicle Owner' : 'Add Vehicle Owner'}
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
              {/* Section: Basic Info */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-secondary-400">Basic Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Owner Name *"
                    placeholder="e.g. Rajesh Kumar"
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <div className="space-y-1.5">
                    <Label>Ownership Type</Label>
                    <Select
                      value={watchedOwnerType || ''}
                      onValueChange={(v) => setValue('owner_type', v === '' ? '' : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ownerTypeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Section: Contact */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-secondary-400">Contact Details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Contact Person" placeholder="e.g. Suresh" error={errors.contact_person?.message} {...register('contact_person')} />
                  <Input label="Phone" placeholder="e.g. +91-9876543210" error={errors.phone?.message} {...register('phone')} />
                  <Input label="Email" type="email" placeholder="e.g. owner@email.com" error={errors.email?.message} {...register('email')} />
                </div>
              </div>

              {/* Section: Identity */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-secondary-400">Government IDs</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Input label="PAN" placeholder="e.g. AAAAA0000A" error={errors.pan?.message} {...register('pan')} />
                  <Input label="Aadhaar" placeholder="e.g. 1234 5678 9012" error={errors.aadhaar?.message} {...register('aadhaar')} />
                  <Input label="GST" placeholder="e.g. 22AAAAA0000A1Z5" error={errors.gst?.message} {...register('gst')} />
                </div>
              </div>

              {/* Section: Address */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-secondary-400">Address</h3>
                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white placeholder:text-secondary-500 transition-all duration-200 focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20 resize-y"
                    placeholder="Street address..."
                    {...register('address')}
                  />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <Input label="City" placeholder="e.g. Mumbai" error={errors.city?.message} {...register('city')} />
                  <Input label="State" placeholder="e.g. Maharashtra" error={errors.state?.message} {...register('state')} />
                  <Input label="Pincode" placeholder="e.g. 400001" error={errors.pincode?.message} {...register('pincode')} />
                </div>
              </div>

              {/* Section: Bank Details */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-secondary-400">Bank Details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Account Number" placeholder="e.g. 1234567890" error={errors.bank_account_number?.message} {...register('bank_account_number')} />
                  <Input label="Bank Name" placeholder="e.g. State Bank of India" error={errors.bank_name?.message} {...register('bank_name')} />
                  <Input label="IFSC Code" placeholder="e.g. SBIN0001234" error={errors.bank_ifsc?.message} {...register('bank_ifsc')} />
                  <Input label="UPI ID" placeholder="e.g. owner@upi" error={errors.upi_id?.message} {...register('upi_id')} />
                </div>
              </div>

              {/* Section: Emergency */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-secondary-400">Emergency Contact</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Contact Name" placeholder="e.g. Priya Sharma" error={errors.emergency_contact_name?.message} {...register('emergency_contact_name')} />
                  <Input label="Phone" placeholder="e.g. +91-9988776655" error={errors.emergency_contact_phone?.message} {...register('emergency_contact_phone')} />
                </div>
              </div>

              {/* Section: Agreement */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-secondary-400">Agreement</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Agreement Number" placeholder="e.g. AGR-2024-001" error={errors.agreement_number?.message} {...register('agreement_number')} />
                  <Input label="Start Date" type="date" placeholder="YYYY-MM-DD" error={errors.agreement_start_date?.message} {...register('agreement_start_date')} />
                  <Input label="End Date" type="date" placeholder="YYYY-MM-DD" error={errors.agreement_end_date?.message} {...register('agreement_end_date')} />
                  <div className="space-y-1.5">
                    <Label>Agreement Status</Label>
                    <Select
                      value={watchedAgreementStatus || ''}
                      onValueChange={(v) => setValue('agreement_status', v === '' ? '' : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {agreementStatusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Section: Status */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-secondary-400">Status</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Owner Status</Label>
                    <Select
                      value={watchedOwnerStatus || ''}
                      onValueChange={(v) => setValue('ownership_status', v === '' ? '' : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {ownerStatusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Section: Notes */}
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white placeholder:text-secondary-500 transition-all duration-200 focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20 resize-y"
                  placeholder="Additional notes..."
                  {...register('notes')}
                />
              </div>

              <div className="hidden">
                <input type="checkbox" {...register('is_active')} />
              </div>
            </motion.div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
            <DrawerClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DrawerClose>
            <Button type="submit" loading={isSubmitting}>
              {isEditing ? 'Update Owner' : 'Create Owner'}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
