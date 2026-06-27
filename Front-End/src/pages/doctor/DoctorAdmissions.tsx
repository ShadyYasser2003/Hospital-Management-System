import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { doctorNavItems } from './DoctorDashboard';
import { usePatients, useUpdatePatient } from '@/hooks/usePatients';
import { PatientDto } from '@/services/patientService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Bed, LogOut, CalendarDays } from 'lucide-react';
import api from '@/lib/api';

/** Fixed system-wide bed charge — $20 per day */
const BED_CHARGE_PER_DAY = 20;

async function postBedCharge(payload: {
  patientId: number;
  days: number;
  chargePerDay: number;
  admissionDate: string;
  dischargeDate: string;
}) {
  await api.post('/api/invoices/bed-charge', payload);
}

const DoctorAdmissions = () => {
  const { data: patients = [], isLoading } = usePatients();
  const updatePatient = useUpdatePatient();

  // ── Admit dialog ──────────────────────────────────────────────────────────
  const [admitOpen, setAdmitOpen]               = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [reason, setReason]                     = useState('');
  const [priority, setPriority]                 = useState<'normal' | 'urgent' | 'emergency'>('normal');
  const [admissionDate, setAdmissionDate]       = useState(new Date().toISOString().split('T')[0]);

  // ── Discharge dialog ──────────────────────────────────────────────────────
  const [dischargeOpen, setDischargeOpen]       = useState(false);
  const [dischargePatient, setDischargePatient] = useState<PatientDto | null>(null);
  const [dischargeDate, setDischargeDate]       = useState(new Date().toISOString().split('T')[0]);
  const [addingCharge, setAddingCharge]         = useState(false);

  const admittedPatients = patients.filter(p => p.status?.toUpperCase() === 'ADMITTED');
  const activePatients   = patients.filter(p => p.status?.toUpperCase() === 'ACTIVE');

  const calcDays = (admission: string, discharge: string): number => {
    const ms = new Date(discharge).getTime() - new Date(admission).getTime();
    return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  };

  // ── Admit ─────────────────────────────────────────────────────────────────
  const handleAdmit = async () => {
    if (!selectedPatientId) { toast.error('Please select a patient'); return; }
    if (!reason.trim())     { toast.error('Please enter admission reason'); return; }
    if (!admissionDate)     { toast.error('Please enter admission date'); return; }
    try {
      await updatePatient.mutateAsync({
        id: Number(selectedPatientId),
        payload: {
          status: 'ADMITTED',
          notes: `[${priority.toUpperCase()}] ${reason}`,
          admissionDate: admissionDate + 'T00:00:00',
          dischargeDate: '',
        } as never,
      });
      toast.success('Patient admitted successfully');
      setAdmitOpen(false);
      setSelectedPatientId('');
      setReason('');
      setPriority('normal');
      setAdmissionDate(new Date().toISOString().split('T')[0]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to admit patient');
    }
  };

  // ── Open discharge dialog ─────────────────────────────────────────────────
  const openDischarge = (p: PatientDto) => {
    setDischargePatient(p);
    setDischargeDate(new Date().toISOString().split('T')[0]);
    setDischargeOpen(true);
  };

  // ── Discharge + auto bed charge ───────────────────────────────────────────
  const handleDischarge = async () => {
    if (!dischargePatient) return;
    setAddingCharge(true);
    try {
      await updatePatient.mutateAsync({
        id: dischargePatient.id,
        payload: {
          status: 'DISCHARGED',
          dischargeDate: dischargeDate + 'T00:00:00',
        } as never,
      });

      const rawAdmission = dischargePatient.admissionDate;

      if (rawAdmission) {
        const admDate = rawAdmission.split('T')[0];
        const days    = calcDays(admDate, dischargeDate);
        await postBedCharge({
          patientId:     dischargePatient.id,
          days,
          chargePerDay:  BED_CHARGE_PER_DAY,
          admissionDate: admDate,
          dischargeDate,
        });
        toast.success(
          `${dischargePatient.name} discharged — $${(days * BED_CHARGE_PER_DAY).toFixed(2)} bed charge (${days} day(s)) added to invoice`,
        );
      } else {
        toast.success(`${dischargePatient.name} discharged successfully`);
      }

      setDischargeOpen(false);
      setDischargePatient(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to discharge patient');
    } finally {
      setAddingCharge(false);
    }
  };

  // ── Preview: days & total in discharge dialog ─────────────────────────────
  const preview = (() => {
    if (!dischargePatient?.admissionDate) return null;
    const admDate = dischargePatient.admissionDate.split('T')[0];
    const days    = calcDays(admDate, dischargeDate);
    return { admDate, days, total: days * BED_CHARGE_PER_DAY };
  })();

  // ── Table columns ─────────────────────────────────────────────────────────
  const admittedCols = [
    { key: 'name',          header: 'Patient' },
    { key: 'nationalId',    header: 'National ID' },
    { key: 'admissionDate', header: 'Admitted',
      render: (p: PatientDto) => p.admissionDate ? p.admissionDate.split('T')[0] : '—' },
    { key: 'status', header: 'Status',
      render: (p: PatientDto) => <StatusBadge status={p.status?.toLowerCase() as never} /> },
    { key: 'actions', header: 'Actions',
      render: (p: PatientDto) => (
        <Button size="sm" variant="outline" onClick={() => openDischarge(p)}
          disabled={updatePatient.isPending}>
          <LogOut className="h-4 w-4 mr-1" />Discharge
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout navItems={doctorNavItems} title="Admissions">
      <PageHeader
        title="Patient Admissions"
        description="Admit patients and manage inpatient care"
        action={
          <Dialog open={admitOpen} onOpenChange={setAdmitOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Admit Patient</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bed className="h-5 w-5" />Admit Patient
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">

                <div>
                  <Label>Select Patient (Active only)</Label>
                  <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger><SelectValue placeholder="Select patient..." /></SelectTrigger>
                    <SelectContent>
                      {activePatients.map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name} — {p.nationalId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Admission Date *</Label>
                  <Input
                    type="date"
                    value={admissionDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setAdmissionDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Reason for Admission</Label>
                  <Textarea
                    placeholder="Enter reason..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Priority</Label>
                  <RadioGroup
                    value={priority}
                    onValueChange={(v) => setPriority(v as typeof priority)}
                    className="flex gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="normal" id="p-normal" />
                      <Label htmlFor="p-normal" className="font-normal">Normal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="urgent" id="p-urgent" />
                      <Label htmlFor="p-urgent" className="font-normal text-yellow-600">Urgent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="emergency" id="p-emergency" />
                      <Label htmlFor="p-emergency" className="font-normal text-destructive">Emergency</Label>
                    </div>
                  </RadioGroup>
                </div>

                <p className="text-xs text-muted-foreground">
                  Bed rate: <span className="font-medium">${BED_CHARGE_PER_DAY}/day</span> — applied automatically on discharge.
                </p>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setAdmitOpen(false)}>Cancel</Button>
                  <Button onClick={handleAdmit} disabled={updatePatient.isPending}>
                    {updatePatient.isPending ? 'Admitting...' : 'Admit Patient'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading
        ? <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        : <DataTable data={admittedPatients} columns={admittedCols} emptyMessage="No admitted patients" />
      }

      {/* ── Discharge Dialog ─────────────────────────────────────────────── */}
      <Dialog open={dischargeOpen} onOpenChange={setDischargeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5" />
              Discharge — {dischargePatient?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Discharge Date *</Label>
              <Input
                type="date"
                value={dischargeDate}
                min={dischargePatient?.admissionDate?.split('T')[0]}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDischargeDate(e.target.value)}
              />
            </div>

            {preview ? (
              <Card className="bg-muted/40">
                <CardContent className="pt-4 space-y-1 text-sm">
                  <div className="flex items-center gap-2 font-medium mb-2">
                    <CalendarDays className="h-4 w-4" />
                    Bed Charge Summary
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
                    <span>Admission date</span>
                    <span className="text-foreground font-medium">{preview.admDate}</span>
                    <span>Discharge date</span>
                    <span className="text-foreground font-medium">{dischargeDate}</span>
                    <span>Days</span>
                    <span className="text-foreground font-medium">{preview.days}</span>
                    <span>Rate per day</span>
                    <span className="text-foreground font-medium">${BED_CHARGE_PER_DAY}</span>
                  </div>
                  <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
                    <span>Total bed charge</span>
                    <span className="text-primary">${preview.total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    This amount will be added automatically to the patient's invoice.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <p className="text-sm text-muted-foreground">
                No admission date recorded — discharge will only update the status.
              </p>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDischargeOpen(false)}>Cancel</Button>
              <Button onClick={handleDischarge} disabled={addingCharge || updatePatient.isPending}>
                {addingCharge ? 'Processing...' : 'Confirm Discharge'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DoctorAdmissions;
