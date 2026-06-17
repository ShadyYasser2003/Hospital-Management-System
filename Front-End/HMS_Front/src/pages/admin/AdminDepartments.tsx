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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { adminNavItems } from '@/constants/adminNavItems';
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from '@/hooks/useDepartments';
import { DepartmentDto } from '@/services/departmentService';

const emptyForm = {
  name: '',
  description: '',
  location: '',
  budget: '',
  isActive: true,
  totalBeds: 0,
  availableBeds: 0,
};

type DeptForm = typeof emptyForm;

const DepartmentFormFields = ({
  form,
  onChange,
}: {
  form: DeptForm;
  onChange: (updated: DeptForm) => void;
}) => (
  <div className="space-y-4">
    <div>
      <Label>Department Name <span className="text-destructive">*</span></Label>
      <Input
        value={form.name}
        onChange={(e) => onChange({ ...form, name: e.target.value })}
        placeholder="e.g. Cardiology"
        required
      />
    </div>
    <div>
      <Label>Location</Label>
      <Input
        value={form.location}
        onChange={(e) => onChange({ ...form, location: e.target.value })}
        placeholder="e.g. Building A, Floor 2"
      />
    </div>
    <div>
      <Label>Budget</Label>
      <Input
        value={form.budget}
        onChange={(e) => onChange({ ...form, budget: e.target.value })}
        placeholder="e.g. 500000"
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Total Beds</Label>
        <Input
          type="number"
          min={0}
          value={form.totalBeds}
          onChange={(e) => onChange({ ...form, totalBeds: Number(e.target.value) })}
        />
      </div>
      <div>
        <Label>Available Beds</Label>
        <Input
          type="number"
          min={0}
          value={form.availableBeds}
          onChange={(e) => onChange({ ...form, availableBeds: Number(e.target.value) })}
        />
      </div>
    </div>
    <div>
      <Label>Description</Label>
      <Textarea
        value={form.description}
        onChange={(e) => onChange({ ...form, description: e.target.value })}
        placeholder="Brief description of the department"
        rows={3}
      />
    </div>
    <div className="flex items-center gap-3">
      <Switch
        id="isActive"
        checked={form.isActive}
        onCheckedChange={(checked) => onChange({ ...form, isActive: checked })}
      />
      <Label htmlFor="isActive">Active</Label>
    </div>
  </div>
);

const AdminDepartments = () => {
  const { data: departments = [], isLoading, error } = useDepartments();
  const createDept = useCreateDepartment();
  const updateDept = useUpdateDepartment();
  const deleteDept = useDeleteDepartment();

  const [addOpen, setAddOpen] = useState(false);
  const [newDept, setNewDept] = useState<DeptForm>(emptyForm);
  const [editOpen, setEditOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DeptForm & { id: number } | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.name.trim()) { toast.error('Name is required'); return; }
    if (newDept.availableBeds > newDept.totalBeds) {
      toast.error('Available beds cannot exceed total beds');
      return;
    }
    try {
      await createDept.mutateAsync(newDept);
      setAddOpen(false);
      setNewDept(emptyForm);
      toast.success('Department created successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create department');
    }
  };

  const handleOpenEdit = (dept: DepartmentDto) => {
    setEditingDept({
      id: dept.id,
      name: dept.name ?? '',
      description: dept.description ?? '',
      location: dept.location ?? '',
      budget: dept.budget ?? '',
      isActive: dept.isActive,
      totalBeds: dept.totalBeds ?? 0,
      availableBeds: dept.availableBeds ?? 0,
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    if (!editingDept.name.trim()) { toast.error('Name is required'); return; }
    if (editingDept.availableBeds > editingDept.totalBeds) {
      toast.error('Available beds cannot exceed total beds');
      return;
    }
    try {
      const { id, ...payload } = editingDept;
      await updateDept.mutateAsync({ id, payload });
      toast.success('Department updated successfully');
      setEditOpen(false);
      setEditingDept(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update department');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDept.mutateAsync(id);
      toast.success('Department deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete department');
    }
  };

  const columns = [
    { key: 'name',          header: 'Department Name' },
    { key: 'location',      header: 'Location',        render: (d: DepartmentDto) => d.location || '—' },
    { key: 'budget',        header: 'Budget',          render: (d: DepartmentDto) => d.budget || '—' },
    { key: 'totalBeds',     header: 'Total Beds',      render: (d: DepartmentDto) => d.totalBeds ?? '—' },
    { key: 'availableBeds', header: 'Available Beds',  render: (d: DepartmentDto) => d.availableBeds ?? '—' },
    { key: 'description',   header: 'Description',     render: (d: DepartmentDto) => d.description || '—' },
    { key: 'isActive',      header: 'Status',          render: (d: DepartmentDto) => <StatusBadge status={d.isActive ? 'active' : 'inactive'} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (dept: DepartmentDto) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(dept)}>
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Department</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete <strong>{dept.name}</strong>? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(dept.id)} className="bg-destructive hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout navItems={adminNavItems} title="Departments">
      <PageHeader
        title="Departments"
        description="Manage hospital departments"
        action={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Department</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create Department</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <DepartmentFormFields form={newDept} onChange={setNewDept} />
                <Button type="submit" className="w-full" disabled={createDept.isPending}>
                  {createDept.isPending ? 'Creating...' : 'Create Department'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditingDept(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Department{editingDept ? ` — ${editingDept.name}` : ''}</DialogTitle>
          </DialogHeader>
          {editingDept && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <DepartmentFormFields
                form={editingDept}
                onChange={(updated) => setEditingDept({ ...updated, id: editingDept.id })}
              />
              <Button type="submit" className="w-full" disabled={updateDept.isPending}>
                {updateDept.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {isLoading && (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error instanceof Error ? error.message : 'Failed to load departments'}</AlertDescription>
        </Alert>
      )}
      {!isLoading && !error && <DataTable data={departments} columns={columns} />}
    </DashboardLayout>
  );
};

export default AdminDepartments;
