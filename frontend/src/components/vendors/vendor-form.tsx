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
import { vendorFormSchema, type VendorFormData } from '@/validation/vendor';
import { vendorService } from '@/services/vendor.service';
import { useNotification } from '@/hooks/use-notification';
import { useMasterValues } from '@/hooks/use-master-values';
import type { Vendor } from '@/types/vendor';
import { X } from 'lucide-react';

interface VendorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor?: Vendor | null;
  onSuccess: () => void;
}

export function VendorForm({ open, onOpenChange, vendor, onSuccess }: VendorFormProps) {
  const { notify } = useNotification();
  const isEditing = !!vendor;

  const { getSelectOptions: getVendorTypeOptions, loading: vendorTypeLoading } = useMasterValues('vendor_type');
  const vendorTypeOptions = getVendorTypeOptions();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorFormSchema) as unknown as Resolver<VendorFormData>,
    defaultValues: {
      name: '',
      vendor_type_id: '',
      contact_person: '',
      phone: '',
      email: '',
      gst: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      rating: '' as unknown as undefined,
      supported_services: '',
      payment_terms: '',
      is_active: true,
    },
  });

  const watchedVendorType = watch('vendor_type_id');

  useEffect(() => {
    if (vendor) {
      reset({
        name: vendor.name,
        vendor_type_id: vendor.vendor_type_id || '',
        contact_person: vendor.contact_person || '',
        phone: vendor.phone || '',
        email: vendor.email || '',
        gst: vendor.gst || '',
        address: vendor.address || '',
        city: vendor.city || '',
        state: vendor.state || '',
        pincode: vendor.pincode || '',
        rating: vendor.rating ?? ('' as unknown as undefined),
        supported_services: vendor.supported_services || '',
        payment_terms: vendor.payment_terms || '',
        is_active: vendor.is_active,
      });
    } else {
      reset({
        name: '',
        vendor_type_id: '',
        contact_person: '',
        phone: '',
        email: '',
        gst: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        rating: '' as unknown as undefined,
        supported_services: '',
        payment_terms: '',
        is_active: true,
      });
    }
  }, [vendor, reset, open]);

  const onSubmit = async (data: VendorFormData) => {
    try {
      const payload = {
        name: data.name,
        vendor_type_id: data.vendor_type_id || null,
        contact_person: data.contact_person || null,
        phone: data.phone || null,
        email: data.email || null,
        gst: data.gst || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        pincode: data.pincode || null,
        rating: data.rating ?? null,
        supported_services: data.supported_services || null,
        payment_terms: data.payment_terms || null,
        is_active: data.is_active,
      };

      if (isEditing && vendor) {
        await vendorService.update(vendor.id, payload);
        notify.success('Vendor updated successfully');
      } else {
        await vendorService.create(payload);
        notify.success('Vendor created successfully');
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
            {isEditing ? 'Edit Vendor' : 'Add Vendor'}
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
                  label="Name *"
                  placeholder="e.g. ABC Auto Parts"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <div className="space-y-1.5">
                  <Label>Vendor Type</Label>
                  <Select
                    value={watchedVendorType || ''}
                    onValueChange={(v) => setValue('vendor_type_id', v === '' ? '' : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor type" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendorTypeOptions.map((vt) => (
                        <SelectItem key={vt.value} value={vt.value}>
                          {vt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.vendor_type_id?.message && (
                    <p className="text-xs text-red-400">{errors.vendor_type_id.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Contact Person"
                  placeholder="e.g. John Doe"
                  error={errors.contact_person?.message}
                  {...register('contact_person')}
                />
                <Input
                  label="Phone"
                  placeholder="e.g. +91-9876543210"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Email"
                  type="email"
                  placeholder="e.g. contact@vendor.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Input
                  label="GST"
                  placeholder="e.g. 22AAAAA0000A1Z5"
                  error={errors.gst?.message}
                  {...register('gst')}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Address</Label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white placeholder:text-secondary-500 transition-all duration-200 focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20 resize-y"
                  placeholder="Street address..."
                  {...register('address')}
                />
                {errors.address?.message && (
                  <p className="text-xs text-red-400">{errors.address.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  label="City"
                  placeholder="e.g. Mumbai"
                  error={errors.city?.message}
                  {...register('city')}
                />
                <Input
                  label="State"
                  placeholder="e.g. Maharashtra"
                  error={errors.state?.message}
                  {...register('state')}
                />
                <Input
                  label="Pincode"
                  placeholder="e.g. 400001"
                  error={errors.pincode?.message}
                  {...register('pincode')}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Rating"
                  type="number"
                  placeholder="0-5"
                  min="0"
                  max="5"
                  step="0.1"
                  error={errors.rating?.message}
                  {...register('rating')}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Supported Services</Label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white placeholder:text-secondary-500 transition-all duration-200 focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20 resize-y"
                  placeholder="Describe supported services..."
                  {...register('supported_services')}
                />
                {errors.supported_services?.message && (
                  <p className="text-xs text-red-400">{errors.supported_services.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Payment Terms</Label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white placeholder:text-secondary-500 transition-all duration-200 focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20 resize-y"
                  placeholder="Describe payment terms..."
                  {...register('payment_terms')}
                />
                {errors.payment_terms?.message && (
                  <p className="text-xs text-red-400">{errors.payment_terms.message}</p>
                )}
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
            <Button type="submit" loading={isSubmitting || vendorTypeLoading}>
              {isEditing ? 'Update Vendor' : 'Create Vendor'}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
