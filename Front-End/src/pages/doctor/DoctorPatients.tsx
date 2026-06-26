import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { doctorNavItems } from './DoctorDashboard';
import { usePatients, useUpdatePatient } from '@/hooks/usePatients';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Search, Edit, Eye, User, Heart, Thermometer, Activity, AlertCircle } from 'lucide-react';
import { PatientDto } from '@/services/patientService';

const DoctorPatients = () => {
  const { data: patients = [], isLoading, error } = usePatients();
  const updatePatient = useUpdatePatient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientDto | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [vitals, setVitals] = useState({ bloodPressure: '', temperature: '', pulse: '', weight: '', height: '' });
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');

  const filteredPatients = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nationalId?.includes(searchQuery),
  );

  const openPatientProfile = (patient: PatientDto, mode: 'view' | 'edit') => {
    setSelectedPatient(patient);
    setViewMode(mode);
    setVitals({
      bloodPressure: patient.bloodPressure || '',
      temperature: patient.temperature || '',
      pulse: patient.pulse || '',
      weight: patient.weight || '',
      height: patient.height || '',
    });
    setDiagnosis(patient.diagnosis || '');
    setNotes(patient.notes || '');
    setDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!selectedPatient) return;
    try {
      // vitals → dedicated endpoint
      await updatePatient.mutateAsync({
        id: selectedPatient.id,
        payload: {
          bloodPressure: vitals.bloodPressure,
          temperature: vitals.temperature,
          pulse: vitals.pulse,
          weight: vitals.weight,
          height: vitals.height,
          diagnosis,
          notes,
          // include required fields to avoid backend null errors
          name: selectedPatient.name,
          email: selectedPatient.email,
          phone: selectedPatient.phone,
          address: selectedPatient.address,
          emergencyContact: selectedPatient.emergencyContact,
          nationalId: selectedPatient.nationalId,
        } as never,
      });
      toast.success('Patient profile updated successfully');
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update patient');
    }
  };

  const columns = [
    { key: 'name', header: 'Patient Name' },
    { key: 'nationalId', header: 'National ID' },
    { key: 'phone', header: 'Phone' },
    { key: 'bloodType', header: 'Blood Type' },
    { key: 'status', header: 'Status', render: (p: PatientDto) => <StatusBadge status={p.status?.toLowerCase() as never} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (p: PatientDto) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => openPatientProfile(p, 'view')}><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => openPatientProfile(p, 'edit')}><Edit className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout navItems={doctorNavItems} title="Patients">
      <PageHeader title="Patient List" description="View and manage patient medical profiles" />

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
      </div>

      {isLoading && <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error instanceof Error ? error.message : 'Failed to load patients'}</AlertDescription></Alert>}
      {!isLoading && !error && <DataTable data={filteredPatients} columns={columns} />}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {viewMode === 'view' ? 'Patient Profile' : 'Edit Patient Profile'}
            </DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Name:</span> {selectedPatient.name}</div>
                  <div><span className="text-muted-foreground">National ID:</span> {selectedPatient.nationalId}</div>
                  <div><span className="text-muted-foreground">Date of Birth:</span> {selectedPatient.dateOfBirth}</div>
                  <div><span className="text-muted-foreground">Gender:</span> {selectedPatient.gender}</div>
                  <div><span className="text-muted-foreground">Blood Type:</span> {selectedPatient.bloodType}</div>
                  <div><span className="text-muted-foreground">Phone:</span> {selectedPatient.phone}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">Allergies:</span> {selectedPatient.allergies || 'None'}</div>
                  <div className="col-span-2"><span className="text-muted-foreground">Medical History:</span> {selectedPatient.medicalHistory || 'None'}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><Heart className="h-4 w-4 text-destructive" />Vitals</CardTitle>
                </CardHeader>
                <CardContent>
                  {viewMode === 'view' ? (
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Blood Pressure', value: selectedPatient.bloodPressure, icon: <Activity className="h-5 w-5 text-primary" /> },
                        { label: 'Temperature', value: selectedPatient.temperature, icon: <Thermometer className="h-5 w-5 text-warning" /> },
                        { label: 'Pulse', value: selectedPatient.pulse, icon: <Heart className="h-5 w-5 text-destructive" /> },
                      ].map(({ label, value, icon }) => (
                        <div key={label} className="p-3 bg-muted rounded-lg text-center">
                          <div className="flex justify-center mb-1">{icon}</div>
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="font-semibold">{value || 'N/A'}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {(['bloodPressure', 'temperature', 'pulse', 'weight', 'height'] as const).map((field) => (
                        <div key={field}>
                          <Label className="capitalize">{field.replace(/([A-Z])/g, ' $1')}</Label>
                          <Input value={vitals[field]} onChange={(e) => setVitals({ ...vitals, [field]: e.target.value })} />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Diagnosis & Notes</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {viewMode === 'view' ? (
                    <>
                      <div><p className="text-sm text-muted-foreground mb-1">Diagnosis</p><p className="text-sm">{selectedPatient.diagnosis || 'No diagnosis recorded'}</p></div>
                      <div><p className="text-sm text-muted-foreground mb-1">Notes</p><p className="text-sm">{selectedPatient.notes || 'No notes'}</p></div>
                    </>
                  ) : (
                    <>
                      <div><Label>Diagnosis</Label><Textarea placeholder="Enter diagnosis..." value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={3} /></div>
                      <div><Label>Notes</Label><Textarea placeholder="Additional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} /></div>
                    </>
                  )}
                </CardContent>
              </Card>

              {viewMode === 'edit' && (
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveProfile} disabled={updatePatient.isPending}>
                    {updatePatient.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DoctorPatients;
