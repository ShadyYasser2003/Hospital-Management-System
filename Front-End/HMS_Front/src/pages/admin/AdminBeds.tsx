import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { usePatients, useUpdatePatient } from '@/hooks/usePatients';
import { useBeds, useCreateBed, useUpdateBed, useDeleteBed, useAssignBedPatient, useReleaseBed, useSetBedMaintenance } from '@/hooks/useBeds';
import { PatientDto } from '@/services/patientService';
import { BedDto } from '@/services/bedService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminNavItems } from '@/constants/adminNavItems';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, BedDouble, Users, Plus, Edit, Trash2, Wrench, UserMinus, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const emptyBedForm = { bedNumber: '', wardName: '', status: 'AVAILABLE' };

const AdminBeds = () => {
  const { data: beds = [], isLoading: loadingBeds }         = useBeds();
  const { data: patients = [], isLoading: loadingPatients } = usePatients();
  const updatePatient   = useUpdatePatient();
  const createBed       = useCreateBed();
  const updateBed       = useUpdateBed();
  const deleteBed       = useDeleteBed();
  const assignBed       = useAssignBedPatient();
  const releaseBed      = useReleaseBed();
  const setMaintenance  = useSetBedMaintenance();

  // Dialogs
  const [admitDialog, setAdmitDialog]         = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [addBedOpen, setAddBedOpen]           = useState(false);
  const [newBed, setNewBed]                   = useState(emptyBedForm);
  const [editBedOpen, setEditBedOpen]         = useState(false);
  const [editingBed, setEditingBed]           = useState<BedDto | null>(null);
  const [assignDialog, setAssignDialog]       = useState(false);
  const [assignBedId, setAssignBedId]         = useState<number | null>(null);
  const [assignPatientId, setAssignPatientId] = useState('');

  const admittedPatients  = patients.filter(p => p.status?.toUpperCase() === 'ADMITTED');
  const activePatients    = patients.filter(p => p.status?.toUpperCase() === 'ACTIVE');
  const availableBeds     = beds.filter(b => b.status?.toUpperCase() === 'AVAILABLE');
  const occupiedBeds      = beds.filter(b => b.status?.toUpperCase() === 'OCCUPIED');
  const maintenanceBeds   = beds.filter(b => b.status?.toUpperCase() === 'MAINTENANCE');

  // Admit patient (change status)
  const handleAdmit = async () => {
    if (!selectedPatientId) { toast.error('Select a patient'); return; }
    try {
      await updatePatient.mutateAsync({ id: Number(selectedPatientId), payload: { status: 'ADMITTED' } });
      toast.success('Patient admitted successfully');
      setAdmitDialog(false);
      setSelectedPatientId('');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  const handleDischarge = async (p: PatientDto) => {
    try {
      await updatePatient.mutateAsync({ id: p.id, payload: { status: 'DISCHARGED' } });
      toast.success(`${p.name} discharged`);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  // Bed CRUD
  const handleCreateBed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBed.bedNumber.trim()) { toast.error('Bed number is required'); return; }
    try {
      await createBed.mutateAsync(newBed);
      toast.success('Bed created successfully');
      setAddBedOpen(false);
      setNewBed(emptyBedForm);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to create bed'); }
  };

  const handleOpenEditBed = (bed: BedDto) => {
    setEditingBed({ ...bed });
    setEditBedOpen(true);
  };

  const handleSaveEditBed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBed) return;
    try {
      await updateBed.mutateAsync({ id: editingBed.id, payload: { bedNumber: editingBed.bedNumber, wardName: editingBed.wardName, status: editingBed.status } });
      toast.success('Bed updated successfully');
      setEditBedOpen(false);
      setEditingBed(null);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to update bed'); }
  };

  const handleDeleteBed = async (id: number) => {
    try {
      await deleteBed.mutateAsync(id);
      toast.success('Bed deleted');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to delete bed'); }
  };

  // Assign patient to bed
  const handleOpenAssign = (bedId: number) => {
    setAssignBedId(bedId);
    setAssignPatientId('');
    setAssignDialog(true);
  };

  const handleAssignPatient = async () => {
    if (!assignBedId || !assignPatientId) { toast.error('Select a patient'); return; }
    try {
      await assignBed.mutateAsync({ bedId: assignBedId, patientId: Number(assignPatientId) });
      toast.success('Patient assigned to bed');
      setAssignDialog(false);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to assign patient'); }
  };

  const handleReleaseBed = async (id: number) => {
    try {
      await releaseBed.mutateAsync(id);
      toast.success('Bed released');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to release bed'); }
  };

  const handleSetMaintenance = async (id: number) => {
    try {
      await setMaintenance.mutateAsync(id);
      toast.success('Bed set to maintenance');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  const bedColumns = [
    { key: 'bedNumber', header: 'Bed Number' },
    { key: 'wardName',  header: 'Ward', render: (b: BedDto) => b.wardName || '—' },
    { key: 'status',    header: 'Status', render: (b: BedDto) => <StatusBadge status={b.status?.toLowerCase() as never} /> },
    { key: 'patientName', header: 'Patient', render: (b: BedDto) => b.patientName || '—' },
    {
      key: 'actions', header: 'Actions',
      render: (b: BedDto) => (
        <div className="flex gap-1 flex-wrap">
          <Button variant="ghost" size="sm" title="Edit bed" onClick={() => handleOpenEditBed(b)}>
            <Edit className="h-4 w-4" />
          </Button>
          {b.status?.toUpperCase() === 'AVAILABLE' && (
            <Button variant="ghost" size="sm" title="Assign patient" onClick={() => handleOpenAssign(b.id)}>
              <UserPlus className="h-4 w-4 text-blue-500" />
            </Button>
          )}
          {b.status?.toUpperCase() === 'OCCUPIED' && (
            <Button variant="ghost" size="sm" title="Release bed" onClick={() => handleReleaseBed(b.id)} disabled={releaseBed.isPending}>
              <UserMinus className="h-4 w-4 text-orange-500" />
            </Button>
          )}
          {b.status?.toUpperCase() !== 'MAINTENANCE' && (
            <Button variant="ghost" size="sm" title="Set maintenance" onClick={() => handleSetMaintenance(b.id)} disabled={setMaintenance.isPending}>
              <Wrench className="h-4 w-4 text-yellow-500" />
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Bed</AlertDialogTitle>
                <AlertDialogDescription>Delete bed <strong>{b.bedNumber}</strong>? This cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteBed(b.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  const admittedColumns = [
    { key: 'name',       header: 'Patient' },
    { key: 'nationalId', header: 'National ID' },
    { key: 'bloodType',  header: 'Blood Type', render: (p: PatientDto) => p.bloodType || '—' },
    { key: 'phone',      header: 'Phone' },
    { key: 'status',     header: 'Status', render: (p: PatientDto) => <StatusBadge status={p.status?.toLowerCase() as never} /> },
    { key: 'actions', header: 'Actions', render: (p: PatientDto) => (
      <Button size="sm" variant="outline" onClick={() => handleDischarge(p)} disabled={updatePatient.isPending}>
        Discharge
      </Button>
    )},
  ];

  const isLoading = loadingBeds || loadingPatients;

  return (
    <DashboardLayout navItems={adminNavItems} title="Beds & Wards">
      <PageHeader
        title="Beds & Wards Management"
        description="Manage hospital beds and patient admissions"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setAdmitDialog(true)}>
              <Users className="h-4 w-4 mr-2" />Admit Patient
            </Button>
            <Button onClick={() => setAddBedOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />Add Bed
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/10"><BedDouble className="h-6 w-6 text-green-600" /></div>
            <div><p className="text-sm text-muted-foreground">Available Beds</p><p className="text-2xl font-bold text-green-600">{availableBeds.length}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10"><BedDouble className="h-6 w-6 text-blue-600" /></div>
            <div><p className="text-sm text-muted-foreground">Occupied Beds</p><p className="text-2xl font-bold text-blue-600">{occupiedBeds.length}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-full bg-yellow-500/10"><BedDouble className="h-6 w-6 text-yellow-600" /></div>
            <div><p className="text-sm text-muted-foreground">Maintenance</p><p className="text-2xl font-bold text-yellow-600">{maintenanceBeds.length}</p></div>
          </CardContent>
        </Card>
      </div>

      {isLoading && <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}

      {!isLoading && (
        <>
          {/* Admitted Patients */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Admitted Patients
                <Badge variant="secondary">{admittedPatients.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {admittedPatients.length === 0
                ? <p className="text-muted-foreground text-center py-4">No admitted patients</p>
                : <DataTable data={admittedPatients} columns={admittedColumns} />
              }
            </CardContent>
          </Card>

          {/* Beds Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BedDouble className="h-5 w-5 text-primary" />Bed Status
                <Badge variant="secondary">{beds.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable data={beds} columns={bedColumns} emptyMessage="No beds registered" />
            </CardContent>
          </Card>
        </>
      )}

      {/* Admit Patient Dialog */}
      <Dialog open={admitDialog} onOpenChange={setAdmitDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Admit Patient</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Select Active Patient</Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Choose patient..." /></SelectTrigger>
                <SelectContent>
                  {activePatients.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name} — {p.nationalId}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activePatients.length === 0 && <p className="text-sm text-muted-foreground mt-1">No active patients available</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdmitDialog(false)}>Cancel</Button>
            <Button onClick={handleAdmit} disabled={!selectedPatientId || updatePatient.isPending}>
              <CheckCircle className="h-4 w-4 mr-1" />Confirm Admission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Bed Dialog */}
      <Dialog open={addBedOpen} onOpenChange={setAddBedOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Bed</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateBed} className="space-y-4">
            <div>
              <Label>Bed Number <span className="text-destructive">*</span></Label>
              <Input value={newBed.bedNumber} onChange={e => setNewBed({ ...newBed, bedNumber: e.target.value })} placeholder="e.g. B-101" required />
            </div>
            <div>
              <Label>Ward Name</Label>
              <Input value={newBed.wardName} onChange={e => setNewBed({ ...newBed, wardName: e.target.value })} placeholder="e.g. ICU, General Ward" />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={newBed.status} onValueChange={v => setNewBed({ ...newBed, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="OCCUPIED">Occupied</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={createBed.isPending}>
              {createBed.isPending ? 'Creating...' : 'Create Bed'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Bed Dialog */}
      <Dialog open={editBedOpen} onOpenChange={open => { setEditBedOpen(open); if (!open) setEditingBed(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Bed{editingBed ? ` — ${editingBed.bedNumber}` : ''}</DialogTitle></DialogHeader>
          {editingBed && (
            <form onSubmit={handleSaveEditBed} className="space-y-4">
              <div>
                <Label>Bed Number <span className="text-destructive">*</span></Label>
                <Input value={editingBed.bedNumber} onChange={e => setEditingBed({ ...editingBed, bedNumber: e.target.value })} required />
              </div>
              <div>
                <Label>Ward Name</Label>
                <Input value={editingBed.wardName || ''} onChange={e => setEditingBed({ ...editingBed, wardName: e.target.value })} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editingBed.status} onValueChange={v => setEditingBed({ ...editingBed, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="OCCUPIED">Occupied</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={updateBed.isPending}>
                {updateBed.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Patient to Bed Dialog */}
      <Dialog open={assignDialog} onOpenChange={setAssignDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Patient to Bed</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Select Patient</Label>
              <Select value={assignPatientId} onValueChange={setAssignPatientId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Choose patient..." /></SelectTrigger>
                <SelectContent>
                  {patients.filter(p => ['ACTIVE', 'ADMITTED'].includes(p.status?.toUpperCase())).map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name} — {p.nationalId}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog(false)}>Cancel</Button>
            <Button onClick={handleAssignPatient} disabled={!assignPatientId || assignBed.isPending}>
              {assignBed.isPending ? 'Assigning...' : 'Assign Patient'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminBeds;
