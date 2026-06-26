import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { adminNavItems } from '@/constants/adminNavItems';
import { useExternalHospitals, useCreateHospital, useUpdateHospital, useDeleteHospital } from '@/hooks/useExternalHospitals';
import { ExternalHospitalDto } from '@/services/externalHospitalService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Search, AlertCircle, Building2, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';

const emptyForm = { name: '', email: '', phone: '', address: '', isActive: true };
type HospitalForm = typeof emptyForm;

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const validate = (f: HospitalForm): string | null => {
  if (!f.name.trim())  return 'Hospital name is required';
  if (!f.email.trim()) return 'Email is required';
  if (!isValidEmail(f.email)) return 'Enter a valid email address';
  return null;
};

const HospitalFormFields: React.FC<{ form: HospitalForm; onChange: (f: HospitalForm) => void }> = ({ form, onChange }) => (
  <div className="space-y-4">
    <div>
      <Label>Hospital Name <span className="text-destructive">*</span></Label>
      <Input value={form.name} onChange={e => onChange({ ...form, name: e.target.value })} placeholder="e.g. City General Hospital" />
    </div>
    <div>
      <Label>Email <span className="text-destructive">*</span></Label>
      <Input type="email" value={form.email} onChange={e => onChange({ ...form, email: e.target.value })} placeholder="hospital@example.com" />
    </div>
    <div>
      <Label>Phone</Label>
      <Input value={form.phone} onChange={e => onChange({ ...form, phone: e.target.value })} placeholder="+1 (800) 000-0000" />
    </div>
    <div>
      <Label>Address</Label>
      <Input value={form.address} onChange={e => onChange({ ...form, address: e.target.value })} placeholder="123 Main St, City, Country" />
    </div>
    <div className="flex items-center gap-3">
      <Switch id="isActive" checked={form.isActive} onCheckedChange={v => onChange({ ...form, isActive: v })} />
      <Label htmlFor="isActive">Active</Label>
    </div>
  </div>
);

const AdminHospitals: React.FC = () => {
  const { data: hospitals = [], isLoading, error } = useExternalHospitals();
  const createHospital = useCreateHospital();
  const updateHospital = useUpdateHospital();
  const deleteHospital = useDeleteHospital();

  const [search, setSearch]         = useState('');
  const [addOpen, setAddOpen]       = useState(false);
  const [newForm, setNewForm]       = useState<HospitalForm>(emptyForm);
  const [editOpen, setEditOpen]     = useState(false);
  const [editTarget, setEditTarget] = useState<ExternalHospitalDto | null>(null);
  const [editForm, setEditForm]     = useState<HospitalForm>(emptyForm);

  const filtered = hospitals.filter(h =>
    h.name?.toLowerCase().includes(search.toLowerCase()) ||
    h.email?.toLowerCase().includes(search.toLowerCase()) ||
    h.address?.toLowerCase().includes(search.toLowerCase()),
  );

  const stats = {
    total:    hospitals.length,
    active:   hospitals.filter(h => h.isActive).length,
    inactive: hospitals.filter(h => !h.isActive).length,
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(newForm);
    if (err) { toast.error(err); return; }
    try {
      await createHospital.mutateAsync(newForm);
      toast.success('Hospital created successfully');
      setAddOpen(false);
      setNewForm(emptyForm);
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to create hospital'); }
  };

  const handleOpenEdit = (h: ExternalHospitalDto) => {
    setEditTarget(h);
    setEditForm({ name: h.name, email: h.email, phone: h.phone ?? '', address: h.address ?? '', isActive: h.isActive });
    setEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    const err = validate(editForm);
    if (err) { toast.error(err); return; }
    try {
      await updateHospital.mutateAsync({ id: editTarget.id, payload: editForm });
      toast.success('Hospital updated successfully');
      setEditOpen(false);
      setEditTarget(null);
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to update hospital'); }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteHospital.mutateAsync(id);
      toast.success('Hospital deleted');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to delete hospital'); }
  };

  const columns = [
    { key: 'name',    header: 'Hospital Name',
      render: (h: ExternalHospitalDto) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">{h.name}</span>
        </div>
      )},
    { key: 'email',   header: 'Email',
      render: (h: ExternalHospitalDto) => (
        <span className="flex items-center gap-1.5 text-sm"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{h.email}</span>
      )},
    { key: 'phone',   header: 'Phone',
      render: (h: ExternalHospitalDto) => h.phone
        ? <span className="flex items-center gap-1.5 text-sm"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{h.phone}</span>
        : '—' },
    { key: 'address', header: 'Address',
      render: (h: ExternalHospitalDto) => h.address
        ? <span className="flex items-center gap-1.5 text-sm"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{h.address.substring(0, 40)}{h.address.length > 40 ? '…' : ''}</span>
        : '—' },
    { key: 'isActive', header: 'Status',
      render: (h: ExternalHospitalDto) => <StatusBadge status={h.isActive ? 'active' : 'inactive'} /> },
    { key: 'actions', header: 'Actions',
      render: (h: ExternalHospitalDto) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(h)}><Edit className="h-4 w-4" /></Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Hospital</AlertDialogTitle>
                <AlertDialogDescription>Delete <strong>{h.name}</strong>? This cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(h.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )},
  ];

  return (
    <DashboardLayout navItems={adminNavItems} title="External Hospitals">
      <PageHeader
        title="External Hospitals"
        description="Manage partner hospitals for patient transfers"
        action={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Hospital</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add External Hospital</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                <HospitalFormFields form={newForm} onChange={setNewForm} />
                <Button type="submit" className="w-full" disabled={createHospital.isPending}>
                  {createHospital.isPending ? 'Creating...' : 'Create Hospital'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={o => { setEditOpen(o); if (!o) setEditTarget(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Hospital{editTarget ? ` — ${editTarget.name}` : ''}</DialogTitle></DialogHeader>
          {editTarget && (
            <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
              <HospitalFormFields form={editForm} onChange={setEditForm} />
              <Button type="submit" className="w-full" disabled={updateHospital.isPending}>
                {updateHospital.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Building2 className="h-5 w-5 text-primary" /></div>
          <div><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats.total}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-green-600" /></div>
          <div><p className="text-xs text-muted-foreground">Active</p><p className="text-2xl font-bold text-green-600">{stats.active}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"><Building2 className="h-5 w-5 text-muted-foreground" /></div>
          <div><p className="text-xs text-muted-foreground">Inactive</p><p className="text-2xl font-bold text-muted-foreground">{stats.inactive}</p></div>
        </CardContent></Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search hospitals..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {isLoading && <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>}
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error instanceof Error ? error.message : 'Failed to load hospitals'}</AlertDescription></Alert>}
      {!isLoading && !error && (
        <DataTable
          data={filtered}
          columns={columns}
          emptyMessage={search ? `No hospitals match "${search}"` : 'No hospitals registered yet'}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminHospitals;
