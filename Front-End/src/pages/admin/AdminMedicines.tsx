import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Trash2, Search, AlertCircle } from 'lucide-react';
import { adminNavItems } from '@/constants/adminNavItems';
import { useMedicines, useCreateMedicine, useUpdateMedicine, useDeleteMedicine } from '@/hooks/useMedicines';
import { MedicineDto } from '@/services/medicineService';
import { toast } from 'sonner';

const emptyForm = {
  name: '',
  genericName: '',
  description: '',
  sideEffects: '',
  prescriptionRequired: false,
};

type MedForm = typeof emptyForm;

const formatMedicineStatus = (status?: string) =>
  status?.toLowerCase().replace(/_/g, '-') ?? 'in-stock';

const MedicineFormFields = ({ form, onChange }: { form: MedForm; onChange: (f: MedForm) => void }) => (
  <div className="space-y-4">
    <div>
      <Label>Medicine Name <span className="text-destructive">*</span></Label>
      <Input value={form.name} onChange={e => onChange({ ...form, name: e.target.value })} placeholder="e.g. Paracetamol" required />
    </div>
    <div>
      <Label>Generic Name</Label>
      <Input value={form.genericName} onChange={e => onChange({ ...form, genericName: e.target.value })} placeholder="e.g. Acetaminophen" />
    </div>
    <div>
      <Label>Description</Label>
      <Textarea value={form.description} onChange={e => onChange({ ...form, description: e.target.value })} placeholder="Brief description of the medicine" rows={2} />
    </div>
    <div>
      <Label>Side Effects</Label>
      <Textarea value={form.sideEffects} onChange={e => onChange({ ...form, sideEffects: e.target.value })} placeholder="Known side effects" rows={2} />
    </div>
    <div className="flex items-center gap-3">
      <Switch
        id="prescriptionRequired"
        checked={form.prescriptionRequired}
        onCheckedChange={checked => onChange({ ...form, prescriptionRequired: checked })}
      />
      <Label htmlFor="prescriptionRequired">Prescription Required</Label>
    </div>
  </div>
);

const AdminMedicines = () => {
  const { data: medicines = [], isLoading, error } = useMedicines();
  const createMedicine = useCreateMedicine();
  const updateMedicine = useUpdateMedicine();
  const deleteMedicine = useDeleteMedicine();

  const [searchQuery, setSearchQuery] = useState('');
  const [addOpen, setAddOpen]         = useState(false);
  const [newMed, setNewMed]           = useState<MedForm>(emptyForm);
  const [editOpen, setEditOpen]       = useState(false);
  const [editingMed, setEditingMed]   = useState<MedForm & { id: number } | null>(null);

  const filtered = medicines.filter(m =>
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.genericName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name.trim()) { toast.error('Medicine name is required'); return; }
    try {
      await createMedicine.mutateAsync({
        name:                 newMed.name.trim(),
        genericName:          newMed.genericName.trim()  || undefined,
        description:          newMed.description.trim()  || undefined,
        sideEffects:          newMed.sideEffects.trim()  || undefined,
        prescriptionRequired: newMed.prescriptionRequired,
      });
      toast.success('Medicine created successfully');
      setAddOpen(false);
      setNewMed(emptyForm);
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to create medicine'); }
  };

  const handleOpenEdit = (m: MedicineDto) => {
    setEditingMed({
      id: m.id,
      name: m.name ?? '',
      genericName: m.genericName ?? '',
      description: m.description ?? '',
      sideEffects: m.sideEffects ?? '',
      prescriptionRequired: m.prescriptionRequired ?? false,
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMed) return;
    if (!editingMed.name.trim()) { toast.error('Medicine name is required'); return; }
    try {
      const { id, ...raw } = editingMed;
      await updateMedicine.mutateAsync({
        id,
        payload: {
          name:                 raw.name.trim(),
          genericName:          raw.genericName.trim()  || undefined,
          description:          raw.description.trim()  || undefined,
          sideEffects:          raw.sideEffects.trim()  || undefined,
          prescriptionRequired: raw.prescriptionRequired,
        },
      });
      toast.success('Medicine updated successfully');
      setEditOpen(false);
      setEditingMed(null);
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to update medicine'); }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMedicine.mutateAsync(id);
      toast.success('Medicine deleted');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to delete medicine'); }
  };

  type MedRow = Omit<MedicineDto, 'id'> & { id: string };

  const columns = [
    { key: 'name',                 header: 'Medicine Name' },
    { key: 'genericName',          header: 'Generic Name',  render: (m: MedRow) => m.genericName || '—' },
    { key: 'prescriptionRequired', header: 'Prescription',  render: (m: MedRow) => m.prescriptionRequired
        ? <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded">Required</span>
        : <span className="text-xs text-muted-foreground">OTC</span> },
    { key: 'sideEffects',  header: 'Side Effects',  render: (m: MedRow) => m.sideEffects
        ? <span className="text-sm text-muted-foreground">{m.sideEffects.substring(0, 40)}{m.sideEffects.length > 40 ? '…' : ''}</span>
        : '—' },
    { key: 'description',  header: 'Description',   render: (m: MedRow) => m.description
        ? <span className="text-sm text-muted-foreground">{m.description.substring(0, 40)}{m.description.length > 40 ? '…' : ''}</span>
        : '—' },
    { key: 'status',       header: 'Status',        render: (m: MedRow) => <StatusBadge status={formatMedicineStatus(m.status)} /> },
    {
      key: 'actions', header: 'Actions',
      render: (m: MedRow) => {
        const numId = Number(m.id);
        const dto: MedicineDto = { ...m, id: numId };
        return (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(dto)}><Edit className="h-4 w-4" /></Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Medicine</AlertDialogTitle>
                  <AlertDialogDescription>Delete <strong>{m.name}</strong>? This cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(numId)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  return (
    <DashboardLayout navItems={adminNavItems} title="Medicine Stock">
      <PageHeader
        title="Medicine Stock"
        description="Manage medicine inventory"
        action={
          <Dialog open={addOpen} onOpenChange={open => {
            setAddOpen(open);
            if (!open) setNewMed(emptyForm);
          }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Medicine</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Add Medicine</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <MedicineFormFields form={newMed} onChange={setNewMed} />
                <Button type="submit" className="w-full" disabled={createMedicine.isPending}>
                  {createMedicine.isPending ? 'Creating...' : 'Create Medicine'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={open => { setEditOpen(open); if (!open) setEditingMed(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Medicine{editingMed ? ` — ${editingMed.name}` : ''}</DialogTitle></DialogHeader>
          {editingMed && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <MedicineFormFields
                form={editingMed}
                onChange={updated => setEditingMed({ ...updated, id: editingMed.id })}
              />
              <Button type="submit" className="w-full" disabled={updateMedicine.isPending}>
                {updateMedicine.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search medicines..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
      </div>

      {isLoading && <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error instanceof Error ? error.message : 'Failed to load medicines'}</AlertDescription></Alert>}
      {!isLoading && !error && (
        <DataTable
          data={filtered.map(m => ({ ...m, id: String(m.id) }))}
          columns={columns}
          emptyMessage="No medicines found"
        />
      )}
    </DashboardLayout>
  );
};

export default AdminMedicines;
