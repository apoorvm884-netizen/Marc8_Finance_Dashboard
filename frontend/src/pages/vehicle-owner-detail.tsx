import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useNotification } from '@/hooks/use-notification';
import { vehicleOwnerService } from '@/services/vehicle-owner.service';
import type { VehicleOwner, OwnerDocument, OwnershipHistory } from '@/types/vehicle-owner';
import { ROLES } from '@/config/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ErrorState } from '@/components/shared/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { VehicleOwnerForm } from '@/components/vehicle-owners/vehicle-owner-form';
import {
  ArrowLeft,
  Pencil,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Banknote,
  Building2,
  Car,
  Shield,
  Calendar,
  AlertTriangle,
  Clock,
  IndianRupee,
  History,
} from 'lucide-react';

export default function VehicleOwnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();

  const [owner, setOwner] = useState<VehicleOwner | null>(null);
  const [documents, setDocuments] = useState<OwnerDocument[]>([]);
  const [history, setHistory] = useState<OwnershipHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.ADMIN;
  const isManager = user?.role === ROLES.MANAGER;
  const canEdit = isAdmin || isManager;

  const fetchOwner = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await vehicleOwnerService.findById(id);
      setOwner(result.data);

      const docsResult = await vehicleOwnerService.getDocuments(id);
      setDocuments(docsResult.data ?? []);

      const ownerData = result.data;
      const linkedVehicles = ownerData?.linked_vehicles;
      if (linkedVehicles && linkedVehicles.length > 0) {
        const firstVehicle = linkedVehicles[0];
        if (firstVehicle) {
          try {
            const histResult = await vehicleOwnerService.getOwnershipHistory(firstVehicle.id);
            setHistory(histResult.data ?? []);
          } catch {
            // History is best-effort
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load owner details';
      setError(message);
      notify.error(message);
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  useEffect(() => {
    fetchOwner();
  }, [fetchOwner]);

  const handleEdit = () => {
    setDrawerOpen(true);
  };

  const handleFormSuccess = () => {
    fetchOwner();
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="mb-6 flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
            <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
          </div>
          <div className="space-y-6">
            <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !owner) {
    return (
      <div className="page-container">
        <ErrorState
          title="Failed to load owner"
          message={error || 'Owner not found'}
          retry={{ onClick: fetchOwner }}
        />
      </div>
    );
  }

  const ownerTypeLabels: Record<string, string> = {
    company_owned: 'Company Owned',
    client_owned: 'Client Owned',
    partner_owned: 'Partner Owned',
    investor_owned: 'Investor Owned',
  };

  const ownerTypeColors: Record<string, string> = {
    company_owned: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    client_owned: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    partner_owned: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    investor_owned: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };

  const statusVariants: Record<string, 'success' | 'warning' | 'secondary'> = {
    active: 'success',
    suspended: 'warning',
    inactive: 'secondary',
  };

  return (
    <div className="page-container">
      <div className="mb-6 flex items-center gap-4">
        <Link to="/vehicle-owners">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6 text-accent-500" />
            <h1 className="text-2xl font-bold text-white">{owner.name}</h1>
            <Badge variant={statusVariants[owner.ownership_status] || 'secondary'} dot>
              {owner.ownership_status.charAt(0).toUpperCase() + owner.ownership_status.slice(1)}
            </Badge>
            <Badge variant="outline" className={ownerTypeColors[owner.owner_type]}>
              {ownerTypeLabels[owner.owner_type] || owner.owner_type}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-secondary-400">
            {owner.agreement_number ? `Agreement: ${owner.agreement_number}` : 'No agreement'}
            {owner.city ? ` \u00b7 ${owner.city}` : ''}
          </p>
        </div>
        {canEdit && (
          <Button size="sm" icon={<Pencil className="h-4 w-4" />} onClick={handleEdit}>
            Edit
          </Button>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact & Identity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-accent-500" />
                Contact & Identity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-secondary-400" />
                  <div>
                    <p className="text-xs text-secondary-500">Phone</p>
                    <p className="text-sm text-white">{owner.phone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-secondary-400" />
                  <div>
                    <p className="text-xs text-secondary-500">Email</p>
                    <p className="text-sm text-white">{owner.email || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-secondary-400" />
                  <div>
                    <p className="text-xs text-secondary-500">PAN</p>
                    <p className="text-sm text-white">{owner.pan || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-secondary-400" />
                  <div>
                    <p className="text-xs text-secondary-500">Aadhaar</p>
                    <p className="text-sm text-white">{owner.aadhaar || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-secondary-400" />
                  <div>
                    <p className="text-xs text-secondary-500">GST</p>
                    <p className="text-sm text-white">{owner.gst || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-secondary-400" />
                  <div>
                    <p className="text-xs text-secondary-500">Address</p>
                    <p className="text-sm text-white">
                      {[owner.address, owner.city, owner.state, owner.pincode].filter(Boolean).join(', ') || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Banknote className="h-4 w-4 text-accent-500" />
                Bank Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-secondary-500">Account Number</p>
                  <p className="text-sm text-white">{owner.bank_account_number || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500">Bank Name</p>
                  <p className="text-sm text-white">{owner.bank_name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500">IFSC Code</p>
                  <p className="text-sm text-white">{owner.bank_ifsc || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500">UPI ID</p>
                  <p className="text-sm text-white">{owner.upi_id || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Linked Vehicles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Car className="h-4 w-4 text-accent-500" />
                Linked Vehicles
              </CardTitle>
            </CardHeader>
            <CardContent>
              {owner.linked_vehicles && owner.linked_vehicles.length > 0 ? (
                <div className="space-y-2">
                  {owner.linked_vehicles.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-surface-light p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Car className="h-4 w-4 text-secondary-400" />
                        <div>
                          <button
                            onClick={() => navigate(`/fleet/financials/${v.id}`)}
                            className="text-sm font-medium text-accent-500 hover:text-accent-400 hover:underline"
                          >
                            {v.vehicle_number}
                          </button>
                          <p className="text-xs text-secondary-500">{v.vehicle_name}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <Car className="h-8 w-8 text-secondary-600" />
                  <p className="text-sm text-secondary-400">No vehicles linked</p>
                  <p className="text-xs text-secondary-500">Assign this owner to a vehicle from the vehicle master</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-accent-500" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-surface-light p-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-secondary-400" />
                        <div>
                          <p className="text-sm font-medium text-white">{doc.document_name}</p>
                          <p className="text-xs text-secondary-500">
                            v{doc.version}
                            {doc.expiry_date ? ` \u00b7 Expires: ${doc.expiry_date}` : ''}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={doc.status === 'active' ? 'success' : doc.status === 'expiring_soon' ? 'warning' : 'destructive'}
                        size="sm"
                      >
                        {doc.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <FileText className="h-8 w-8 text-secondary-600" />
                  <p className="text-sm text-secondary-400">No documents uploaded</p>
                  <p className="text-xs text-secondary-500">Documents will be managed in a future update</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Summary Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <IndianRupee className="h-4 w-4 text-accent-500" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <IndianRupee className="h-8 w-8 text-secondary-600" />
                <p className="text-sm text-secondary-400">Revenue & settlement data</p>
                <p className="text-xs text-secondary-500">
                  Financial summary will be available after settlement engine implementation (Phase 6B.2)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Agreement & Quick Info */}
        <div className="space-y-6">
          {/* Agreement Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-accent-500" />
                Agreement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-secondary-500">Agreement Number</p>
                <p className="text-sm font-medium text-white">{owner.agreement_number || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-secondary-500">Start Date</p>
                <p className="text-sm text-white">{owner.agreement_start_date || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-secondary-500">End Date</p>
                <p className="text-sm text-white">{owner.agreement_end_date || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-secondary-500">Agreement Status</p>
                <Badge variant={statusVariants[owner.agreement_status] || 'secondary'} dot size="sm">
                  {owner.agreement_status.charAt(0).toUpperCase() + owner.agreement_status.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Model Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <IndianRupee className="h-4 w-4 text-accent-500" />
                Revenue Model
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <IndianRupee className="h-8 w-8 text-secondary-600" />
                <p className="text-sm text-secondary-400">No model configured</p>
                <p className="text-xs text-secondary-500">
                  Revenue model configuration will be available in Phase 6B.2
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-accent-500" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-secondary-500">Name</p>
                <p className="text-sm text-white">{owner.emergency_contact_name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-secondary-500">Phone</p>
                <p className="text-sm text-white">{owner.emergency_contact_phone || '-'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Ownership Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="h-4 w-4 text-accent-500" />
                Ownership Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-3">
                  {history.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-accent-500" />
                      <div>
                        <p className="text-sm text-white">{event.event_type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-secondary-500">
                          {event.new_owner_name ? `\u2192 ${event.new_owner_name}` : ''}
                          {event.event_date ? ` \u00b7 ${new Date(event.event_date).toLocaleDateString()}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <Clock className="h-8 w-8 text-secondary-600" />
                  <p className="text-sm text-secondary-400">No history yet</p>
                  <p className="text-xs text-secondary-500">Timeline events will appear when owners are assigned</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {owner.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-accent-500" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-secondary-300 whitespace-pre-wrap">{owner.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>

      <VehicleOwnerForm
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        owner={owner}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
