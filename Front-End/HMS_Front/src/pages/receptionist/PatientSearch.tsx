import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { LayoutDashboard, UserPlus, Search, Calendar, LogOut, User, Edit, AlertCircle } from 'lucide-react';
import { usePatients, useUpdatePatient } from '@/hooks/usePatients';
import { PatientDto } from '@/services/patientService';

const navItems = [
  { label: 'Dashboard', path: '/receptionist', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Register Patient', path: '/receptionist/register', icon: <UserPlus className="h-5 w-5" /> },
  { label: 'Search Patient', path: '/receptionist/search', icon: <Search className="h-5 w-5" /> },
  { label: 'Appointments', path: '/receptionist/appointments', icon: <Calendar className="h-5 w-5" /> },
  { label: 'Check Out', path: '/receptionist/checkout', icon: <LogOut className="h-5 w-5" /> },
  { label: 'Profile', path: '/receptionist/profile', icon: <User className="h-5 w-5" /> },
];

const PatientSearch = () => {
  const { data: patients = [], isLoading, error } = usePatients();
  const updatePatient = useUpdatePatient();
  const [searchQuery, setSearchQuery] = useState('');
  const [editPatient, setEditPatient] = useState<PatientDto | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '', phone: '', email: '', address: '',
    emergencyContact: '', insuranceProvider: '', insuranceNumber: '',
  });

  const filteredPatients = patients.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nationalId?.includes(searchQuery) ||
      p.phone?.includes(searchQuery),
  );

  const handleEdit = (patient: PatientDto) => {
    setEditPatient(patient);
    setEditFormData({
      name: patient.name || '',
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      emergencyContact: patient.emergencyContact || '',
      insuranceProvider: patient.insuranceProvider || '',
      insuranceNumber: patient.insuranceNumber || '',
    });
  };

  const handleSave = async () => {
    if (!editPatient) return;
    try {
      await updatePatient.mutateAsync({ id: editPatient.id, payload: editFormData as never });
      toast.success('Patient updated successfully');
      setEditPatient(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update patient');
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'nationalId', header: 'National ID' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'status', header: 'Status', render: (p: PatientDto) => <StatusBadge status={p.status?.toLowerCase() as never} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (p: PatientDto) => (
        <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}>
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Search Patients">
      <PageHeader title="Search Patients" description="Find and manage patient records" />

      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, National ID, or phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
      </div>

      {isLoading && <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error instanceof Error ? error.message : 'Failed to load patients'}</AlertDescription></Alert>}
      {!isLoading && !error && <DataTable data={filteredPatients} columns={columns} emptyMessage="No patients found" />}

      <Dialog open={!!editPatient} onOpenChange={() => setEditPatient(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Patient</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Full Name</Label><Input value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={editFormData.phone} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} /></div>
            <div><Label>Address</Label><Input value={editFormData.address} onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })} /></div>
            <div><Label>Emergency Contact</Label><Input value={editFormData.emergencyContact} onChange={(e) => setEditFormData({ ...editFormData, emergencyContact: e.target.value })} /></div>
            <div><Label>Insurance Provider</Label><Input value={editFormData.insuranceProvider} onChange={(e) => setEditFormData({ ...editFormData, insuranceProvider: e.target.value })} /></div>
            <div><Label>Insurance Number</Label><Input value={editFormData.insuranceNumber} onChange={(e) => setEditFormData({ ...editFormData, insuranceNumber: e.target.value })} /></div>
            <Button onClick={handleSave} className="w-full" disabled={updatePatient.isPending}>
              {updatePatient.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PatientSearch;
