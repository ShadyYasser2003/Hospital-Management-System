import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { doctorNavItems } from './DoctorDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useDoctorPatients, useUpdatePatient } from '@/hooks/usePatients';
import { PatientDto } from '@/services/patientService';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Bed } from 'lucide-react';

/**
 * DoctorAdmissions — lets a doctor admit a patient (set status → ADMITTED)
 * and view currently admitted patients.
 * Admission is handled via PUT /api/patients/:id with { status: "ADMITTED" }.
 */
const DoctorAdmissions = () => {
  const { user } = useAuth();
  const { data: patients = [], isLoading } = useDoctorPatients(user?.id);
  const updatePatient = useUpdatePatient();

  const [dialogOpen, setDialogOpen]           = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [reason, setReason]                   = useState('');
  const [priority, setPriority]               = useState<'normal' | 'urgent' | 'emergency'>('normal');

  const admittedPatients = patients.filter(p => p.status?.toUpperCase() === 'ADMITTED');
  const activePatients   = patients.filter(p => p.status?.toUpperCase() === 'ACTIVE');

  const handleAdmit = async () => {
    if (!selectedPatientId) { toast.error('Please select a patient'); return; }
    if (!reason.trim())     { toast.error('Please enter admission reason'); return; }
    try {
      await updatePatient.mutateAsync({
        id: Number(selectedPatientId),
        payload: { status: 'ADMITTED', notes: `[${priority.toUpperCase()}] ${reason}` },
      });
      toast.success('Patient admitted successfully');
      setDialogOpen(false);
      setSelectedPatientId('');
      setReason('');
      setPriority('normal');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to admit patient'); }
  };

  const handleDischarge = async (p: PatientDto) => {
    try {
      await updatePatient.mutateAsync({ id: p.id, payload: { status: 'DISCHARGED' } });
      toast.success(`${p.name} discharged`);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  const admittedCols = [
    { key: 'name',       header: 'Patient' },
    { key: 'nationalId', header: 'National ID' },
    { key: 'bloodType',  header: 'Blood Type' },
    { key: 'phone',      header: 'Phone' },
    { key: 'status',     header: 'Status', render: (p: PatientDto) => <StatusBadge status={p.status?.toLowerCase() as never} /> },
    { key: 'actions', header: 'Actions', render: (p: PatientDto) => (
      <Button size="sm" variant="outline" onClick={() => handleDischarge(p)} disabled={updatePatient.isPending}>
        Discharge
      </Button>
    )},
  ];

  return (
    <DashboardLayout navItems={doctorNavItems} title="Admissions">
      <PageHeader
        title="Patient Admissions"
        description="Admit patients and manage inpatient care"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                        <SelectItem key={p.id} value={String(p.id)}>{p.name} — {p.nationalId}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reason for Admission</Label>
                  <Textarea placeholder="Enter reason..." value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
                </div>
                <div>
                  <Label>Priority</Label>
                  <RadioGroup value={priority} onValueChange={(v) => setPriority(v as typeof priority)} className="flex gap-4 mt-2">
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
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
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
    </DashboardLayout>
  );
};

export default DoctorAdmissions;
