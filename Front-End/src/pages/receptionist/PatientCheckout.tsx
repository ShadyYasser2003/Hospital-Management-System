import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Search, CheckCircle, BedDouble, UserPlus, LogOut, AlertTriangle, Receipt } from 'lucide-react';
import { usePatients, useUpdatePatient } from '@/hooks/usePatients';
import { useInvoicesByPatient } from '@/hooks/useInvoices';
import { useBeds, useAssignBedPatient, useReleaseBed } from '@/hooks/useBeds';
import { PatientDto } from '@/services/patientService';
import { BedDto } from '@/services/bedService';
import { receptionistNavItems } from '@/constants/receptionistNavItems';
import { useQueryClient } from '@tanstack/react-query';
import { BEDS_KEY } from '@/hooks/useBeds';

// ── Invoice + action panel for selected patient ───────────────────────────
const CheckoutActions = ({
  patient,
  availableBeds,
  onAdmit,
  onCheckout,
  isPending,
  onCancel,
}: {
  patient: PatientDto;
  availableBeds: BedDto[];
  onAdmit: (bedId: number) => void;
  onCheckout: () => void;
  isPending: boolean;
  onCancel: () => void;
}) => {
  const { data: invoices = [], isLoading: loadingInvoices } = useInvoicesByPatient(patient.id);
  const [admitOpen, setAdmitOpen] = useState(false);
  const [selectedBedId, setSelectedBedId] = useState('');

  const totalBalance = invoices
    .filter(i => i.status?.toUpperCase() !== 'CANCELLED')
    .reduce((sum, i) => sum + (i.balance ?? 0), 0);

  const hasUnpaidBalance = totalBalance > 0.01;
  const status = patient.status?.toUpperCase();

  const handleConfirmAdmit = () => {
    if (!selectedBedId) { toast.error('Please select a bed'); return; }
    setAdmitOpen(false);
    onAdmit(Number(selectedBedId));
  };

  return (
    <>
      <Card className="border-primary/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 flex-wrap">
            {patient.name}
            <span className={`text-xs font-medium px-2 py-1 rounded-full
              ${status === 'ADMITTED'    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : status === 'DISCHARGED'  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
              : status === 'CHECKED_OUT' ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'}`}>
              {status}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Patient info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-muted-foreground">National ID</p><p className="font-medium">{patient.nationalId}</p></div>
            <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{patient.phone}</p></div>
            <div><p className="text-muted-foreground">Blood Type</p><p className="font-medium">{patient.bloodType || '—'}</p></div>
            <div><p className="text-muted-foreground">Email</p><p className="font-medium">{patient.email}</p></div>
          </div>

          {/* Invoice balance — shown for ADMITTED & DISCHARGED */}
          {(status === 'ADMITTED' || status === 'DISCHARGED') && (
            loadingInvoices ? (
              <Skeleton className="h-10 w-full" />
            ) : hasUnpaidBalance ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Outstanding balance: <strong>${totalBalance.toFixed(2)}</strong> — must be paid before checkout.</span>
                  <Receipt className="h-4 w-4 ml-2 shrink-0" />
                </AlertDescription>
              </Alert>
            ) : invoices.length > 0 ? (
              <Alert className="border-green-300 bg-green-50 dark:bg-green-950/30">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700 dark:text-green-400">
                  All invoices paid — patient can be checked out.
                </AlertDescription>
              </Alert>
            ) : null
          )}

          {/* Actions */}
          <div className="border-t pt-4 flex gap-3 flex-wrap">
            {/* Admit → opens bed selection dialog */}
            {status === 'ACTIVE' && (
              <Button
                variant="outline"
                className="flex-1 border-blue-400 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                onClick={() => { setSelectedBedId(''); setAdmitOpen(true); }}
                disabled={isPending}
              >
                <BedDouble className="h-4 w-4 mr-2" />
                {isPending ? 'Processing...' : 'Admit & Assign Bed'}
              </Button>
            )}

            {/* Checkout */}
            {(status === 'ADMITTED' || status === 'DISCHARGED') && (
              <Button
                className="flex-1"
                onClick={onCheckout}
                disabled={isPending || hasUnpaidBalance || loadingInvoices}
                title={hasUnpaidBalance ? 'Patient has outstanding balance' : undefined}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {isPending ? 'Processing...'
                  : hasUnpaidBalance ? 'Balance Due — Cannot Checkout'
                  : 'Complete Checkout'}
              </Button>
            )}

            <Button variant="ghost" onClick={onCancel} disabled={isPending}>Cancel</Button>
          </div>
        </CardContent>
      </Card>

      {/* Bed selection dialog */}
      <Dialog open={admitOpen} onOpenChange={setAdmitOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-blue-500" />
              Assign Bed — {patient.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Available Bed <span className="text-destructive">*</span></Label>
              {availableBeds.length === 0 ? (
                <p className="text-sm text-muted-foreground mt-2">No available beds at the moment.</p>
              ) : (
                <Select value={selectedBedId} onValueChange={setSelectedBedId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a bed…" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBeds.map(bed => (
                      <SelectItem key={bed.id} value={String(bed.id)}>
                        Bed {bed.bedNumber}
                        {bed.wardName ? ` — ${bed.wardName}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setAdmitOpen(false)}>Cancel</Button>
              <Button
                onClick={handleConfirmAdmit}
                disabled={!selectedBedId || availableBeds.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <BedDouble className="h-4 w-4 mr-2" />Admit Patient
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// ── Main component ────────────────────────────────────────────────────────
const PatientCheckout = () => {
  const qc = useQueryClient();
  const { data: patients = [], isLoading: loadingPatients } = usePatients();
  const { data: beds = [],     isLoading: loadingBeds }     = useBeds();

  const updatePatient  = useUpdatePatient();
  const assignBed      = useAssignBedPatient();
  const releaseBed     = useReleaseBed();

  const [searchQuery,     setSearchQuery]     = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientDto | null>(null);
  const [processing,      setProcessing]      = useState(false);

  const isLoading = loadingPatients || loadingBeds;

  const availableBeds  = beds.filter(b => b.status?.toUpperCase() === 'AVAILABLE');
  const admittedPatients   = patients.filter(p => p.status?.toUpperCase() === 'ADMITTED');
  const dischargedPatients = patients.filter(p => p.status?.toUpperCase() === 'DISCHARGED');
  const activePatients     = patients.filter(p => p.status?.toUpperCase() === 'ACTIVE');

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    const found = patients.find(
      p => p.name?.toLowerCase().includes(q) || p.nationalId?.includes(searchQuery),
    );
    found ? setSelectedPatient(found) : toast.error('Patient not found');
  };

  // Admit = assign bed + set status ADMITTED
  const handleAdmit = async (bedId: number) => {
    if (!selectedPatient) return;
    setProcessing(true);
    try {
      // 1. Assign bed (backend also validates open invoice)
      await assignBed.mutateAsync({ bedId, patientId: selectedPatient.id });
      // 2. Update patient status
      await updatePatient.mutateAsync({ id: selectedPatient.id, payload: { status: 'ADMITTED' } });
      toast.success(`${selectedPatient.name} admitted and assigned to bed`);
      setSelectedPatient(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to admit patient');
    } finally {
      setProcessing(false);
    }
  };

  // Checkout = release bed + set status CHECKED_OUT
  const handleCheckout = async () => {
    if (!selectedPatient) return;
    setProcessing(true);
    try {
      // 1. Find the bed occupied by this patient and release it
      const occupiedBed = beds.find(
        b => b.status?.toUpperCase() === 'OCCUPIED' &&
             String(b.patientId) === String(selectedPatient.id),
      );
      if (occupiedBed) {
        await releaseBed.mutateAsync(occupiedBed.id);
      }
      // 2. Set patient status to CHECKED_OUT
      await updatePatient.mutateAsync({ id: selectedPatient.id, payload: { status: 'CHECKED_OUT' } });
      // 3. Refresh beds list
      qc.invalidateQueries({ queryKey: [BEDS_KEY] });
      toast.success(`${selectedPatient.name} checked out successfully`);
      setSelectedPatient(null);
      setSearchQuery('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to checkout patient');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <DashboardLayout navItems={receptionistNavItems} title="Patient Checkout">
      <PageHeader title="Patient Checkout" description="Admit patients to beds and process discharges" />

      <div className="max-w-3xl space-y-6">

        {/* Search */}
        <Card>
          <CardHeader><CardTitle>Find Patient</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter patient name or National ID"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Admitted patients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-blue-500" />
              Currently Admitted
              <Badge variant="secondary">{admittedPatients.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading
              ? <Skeleton className="h-8 w-full" />
              : admittedPatients.length === 0
                ? <p className="text-sm text-muted-foreground">No admitted patients</p>
                : (
                  <div className="flex flex-wrap gap-2">
                    {admittedPatients.map(p => (
                      <Button key={p.id}
                        variant={selectedPatient?.id === p.id ? 'default' : 'outline'}
                        size="sm" onClick={() => setSelectedPatient(p)}>
                        {p.name}
                      </Button>
                    ))}
                  </div>
                )}
          </CardContent>
        </Card>

        {/* Doctor discharged — awaiting receptionist checkout */}
        {dischargedPatients.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogOut className="h-5 w-5 text-orange-500" />
                Doctor Discharged — Pending Checkout
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  {dischargedPatients.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {dischargedPatients.map(p => (
                  <Button key={p.id}
                    variant={selectedPatient?.id === p.id ? 'default' : 'outline'}
                    size="sm" onClick={() => setSelectedPatient(p)}>
                    {p.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active patients — can be admitted */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-green-500" />
              Active Patients
              <Badge variant="secondary">{activePatients.length}</Badge>
              {availableBeds.length > 0 && (
                <span className="text-xs text-muted-foreground font-normal">
                  — {availableBeds.length} bed{availableBeds.length !== 1 ? 's' : ''} available
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading
              ? <Skeleton className="h-8 w-full" />
              : activePatients.length === 0
                ? <p className="text-sm text-muted-foreground">No active patients</p>
                : (
                  <div className="flex flex-wrap gap-2">
                    {activePatients.map(p => (
                      <Button key={p.id} variant="outline" size="sm"
                        onClick={() => setSelectedPatient(p)}>
                        {p.name}
                      </Button>
                    ))}
                  </div>
                )}
          </CardContent>
        </Card>

        {/* Selected patient panel */}
        {selectedPatient && (
          <CheckoutActions
            patient={selectedPatient}
            availableBeds={availableBeds}
            onAdmit={handleAdmit}
            onCheckout={handleCheckout}
            isPending={processing}
            onCancel={() => setSelectedPatient(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientCheckout;
