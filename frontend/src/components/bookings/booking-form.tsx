import { useState, useEffect, useCallback } from 'react';
import { Drawer, DrawerContent, DrawerClose } from '@/components/shared/drawer';
import { DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { vehicleService } from '@/services/vehicle.service';
import { masterService } from '@/services/master.service';
import { bookingService } from '@/services/booking.service';
import { useNotification } from '@/hooks/use-notification';
import type { Booking, CreateBookingDTO } from '@/types/booking';
import type { Vehicle } from '@/types/vehicle';
import type { MasterValue } from '@/types/master';
import { X } from 'lucide-react';

interface BookingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking?: Booking | null;
  onSuccess: () => void;
}

interface FormState {
  vehicle_id: string;
  platform_id: string;
  booking_id: string;
  booking_date_time: string;
  trip_start: string;
  trip_end: string;
  gross_fare: string;
  doorstep_charges: string;
  platform_commission: string;
  discount: string;
  taxes: string;
  refund: string;
  status: string;
  payment_status: string;
  customer_name: string;
  remarks: string;
}

const emptyForm: FormState = {
  vehicle_id: '',
  platform_id: '',
  booking_id: '',
  booking_date_time: '',
  trip_start: '',
  trip_end: '',
  gross_fare: '0',
  doorstep_charges: '0',
  platform_commission: '0',
  discount: '0',
  taxes: '0',
  refund: '0',
  status: 'PENDING',
  payment_status: 'PENDING',
  customer_name: '',
  remarks: '',
};

export function BookingForm({ open, onOpenChange, booking, onSuccess }: BookingFormProps) {
  const { notify } = useNotification();
  const isEditing = !!booking;

  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [platforms, setPlatforms] = useState<MasterValue[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const gross = parseFloat(form.gross_fare) || 0;
  const doorstep = parseFloat(form.doorstep_charges) || 0;
  const commission = parseFloat(form.platform_commission) || 0;

  const fetchOptions = useCallback(async () => {
    setLoadingOptions(true);
    try {
      const [vehiclesData, platformsData] = await Promise.all([
        vehicleService.findAll({ limit: 200, is_active: 'true' }),
        masterService.getValues('platform', { limit: 100, sort_by: 'display_order', sort_order: 'asc' }),
      ]);
      setVehicles((vehiclesData.data ?? []).filter((v: Vehicle) => v.is_active && !v.deleted_at));
      setPlatforms((platformsData.data ?? []).filter((p: MasterValue) => p.is_active && !p.deleted_at));
    } catch {
      notify.error('Failed to load form options');
    } finally {
      setLoadingOptions(false);
    }
  }, [notify]);

  useEffect(() => {
    if (open) {
      fetchOptions();
      if (booking) {
        setForm({
          vehicle_id: booking.vehicle_id,
          platform_id: booking.platform_id,
          booking_id: booking.booking_id,
          booking_date_time: booking.booking_date_time?.slice(0, 16) || '',
          trip_start: booking.trip_start?.slice(0, 16) || '',
          trip_end: booking.trip_end?.slice(0, 16) || '',
          gross_fare: String(booking.gross_fare),
          doorstep_charges: String(booking.doorstep_charges),
          platform_commission: String(booking.platform_commission),
          discount: String(booking.discount ?? 0),
          taxes: String(booking.taxes ?? 0),
          refund: String(booking.refund ?? 0),
          status: booking.status,
          payment_status: booking.payment_status || 'PENDING',
          customer_name: booking.customer_name || '',
          remarks: booking.remarks || '',
        });
      } else {
        setForm({
          ...emptyForm,
          booking_date_time: new Date().toISOString().slice(0, 16),
        });
      }
    }
  }, [open, booking, fetchOptions]);

  const discount = parseFloat(form.discount) || 0;
  const taxes = parseFloat(form.taxes) || 0;
  const refund = parseFloat(form.refund) || 0;

  const validate = (): string | null => {
    if (!form.vehicle_id) return 'Vehicle is required';
    if (!form.platform_id) return 'Platform is required';
    if (!form.booking_id.trim()) return 'Booking ID is required';
    if (!form.booking_date_time) return 'Booking date/time is required';
    if (gross < 0) return 'Gross fare must be 0 or greater';
    if (doorstep < 0) return 'Doorstep charges must be 0 or greater';
    if (commission < 0) return 'Platform commission must be 0 or greater';
    if (discount < 0) return 'Discount must be 0 or greater';
    if (taxes < 0) return 'Taxes must be 0 or greater';
    if (refund < 0) return 'Refund must be 0 or greater';
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      notify.error(error);
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateBookingDTO = {
        vehicle_id: form.vehicle_id,
        platform_id: form.platform_id,
        booking_id: form.booking_id.trim(),
        booking_date_time: form.booking_date_time,
        trip_start: form.trip_start || null,
        trip_end: form.trip_end || null,
        gross_fare: gross,
        doorstep_charges: doorstep,
        platform_commission: commission,
        discount,
        taxes,
        refund,
        payment_status: form.payment_status as CreateBookingDTO['payment_status'],
        customer_name: form.customer_name || null,
        status: form.status as CreateBookingDTO['status'],
        remarks: form.remarks || null,
      };

      if (isEditing && booking) {
        await bookingService.update(booking.id, payload);
        notify.success('Booking updated successfully');
      } else {
        await bookingService.create(payload);
        notify.success('Booking created successfully');
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Operation failed';
      notify.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent size="lg">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <DialogTitle className="text-lg">
            {isEditing ? 'Edit Booking' : 'New Booking'}
          </DialogTitle>
          <DrawerClose className="rounded-md p-1 text-secondary-400 opacity-70 transition-opacity hover:opacity-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent-500">
            <X className="h-5 w-5" />
          </DrawerClose>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Vehicle *</Label>
              <Select
                value={form.vehicle_id}
                onValueChange={(v) => setForm({ ...form, vehicle_id: v })}
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
            </div>

            <div className="space-y-1.5">
              <Label>Platform *</Label>
              <Select
                value={form.platform_id}
                onValueChange={(v) => setForm({ ...form, platform_id: v })}
                disabled={loadingOptions}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Booking ID *"
              placeholder="e.g. PLAT-001"
              value={form.booking_id}
              onChange={(e) => setForm({ ...form, booking_id: e.target.value })}
            />
            <Input
              label="Booking Date & Time *"
              type="datetime-local"
              value={form.booking_date_time}
              onChange={(e) => setForm({ ...form, booking_date_time: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Trip Start"
              type="datetime-local"
              value={form.trip_start}
              onChange={(e) => setForm({ ...form, trip_start: e.target.value })}
            />
            <Input
              label="Trip End"
              type="datetime-local"
              value={form.trip_end}
              onChange={(e) => setForm({ ...form, trip_end: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Gross Fare (₹)"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={form.gross_fare}
              onChange={(e) => setForm({ ...form, gross_fare: e.target.value })}
            />
            <Input
              label="Doorstep Charges (₹)"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={form.doorstep_charges}
              onChange={(e) => setForm({ ...form, doorstep_charges: e.target.value })}
            />
            <Input
              label="Platform Commission (₹)"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={form.platform_commission}
              onChange={(e) => setForm({ ...form, platform_commission: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Discount (₹)"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: e.target.value })}
            />
            <Input
              label="Taxes (₹)"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={form.taxes}
              onChange={(e) => setForm({ ...form, taxes: e.target.value })}
            />
            <Input
              label="Refund (₹)"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={form.refund}
              onChange={(e) => setForm({ ...form, refund: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Customer Name"
              placeholder="e.g. John Doe"
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
            />
            <div className="space-y-1.5">
              <Label>Payment Status</Label>
              <Select
                value={form.payment_status}
                onValueChange={(v) => setForm({ ...form, payment_status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
              <Label className="text-emerald-400">Net Revenue</Label>
              <p className="mt-1 text-sm text-emerald-400/80">
                Calculated automatically on save
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Remarks</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white placeholder:text-secondary-500 transition-all duration-200 focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/20 resize-y"
              placeholder="Optional remarks..."
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <DrawerClose asChild>
            <Button type="button" variant="outline" disabled={submitting}>
              Cancel
            </Button>
          </DrawerClose>
          <Button onClick={handleSubmit} loading={submitting}>
            {isEditing ? 'Update Booking' : 'Create Booking'}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
