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

// ── form state shape ──────────────────────────────────────────────────────────
const emptyForm = {
  name:          '',
  description:   '',
  location:      '',
  budget:        '',
  active:        true,   // matches backend JSON field "active"
  totalBeds:     0,
  availableBeds: 0,
};

type DeptForm = typeof emptyForm;

// ── shared form fields component ──────────────────────────────────────────────
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
        id="deptActive"
        checked={form.active}
        onCheckedChange={(checked) => onChange({ ...form, active: checked })}
      />
      <Label htmlFor="deptActive">Active</Label>
    </div>
  </div>
);

// ── page ──────────────────────────────────────────────────────────────────────
const AdminDepartments = () => {
  const { data: departments = [], isLoading, error } = useDepartments();
  const createDept = useCreateDepartment();
  const updateDept = useUpdateDepartment();
  const deleteDept = useDeleteDepartment();

  const [addOpen,      setAddOpen]      = useState(false);
  const [newDept,      setNewDept]      = useState<DeptForm>(emptyForm);
  const [editOpen,     setEditOpen]     = useState(false);
  const [editingDept,  setEditingDept]  = useState<DeptForm & { id: number } | null>(null);

  // ── create ────────────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.name.trim()) { toast.error('Department name is required'); return; }
    if (newDept.availableBeds > newDept.totalBeds) {
      toast.error('Available beds cannot exceed total beds'); return;
    }
    try {
      await createDept.mutateAsync({
        name:          newDept.name.trim(),
        description:   newDept.description || undefined,
        location:      newDept.location   || undefined,
        budget:        newDept.budget     || undefined,
        active:        newDept.active,
        totalBeds:     newDept.totalBeds,
        availableBeds: newDept.availableBeds,
      });
      toast.success('Department created successfully');
      setAddOpen(false);
      setNewDept(emptyForm);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create department');
    }
  };

  // ── open edit ─────────────────────────────────────────────────────────────
  const handleOpenEdit = (dept: DepartmentDto) => {
    setEditingDept({
      id:            dept.id,
      name:          dept.name          ?? '',
      description:   dept.description   ?? '',
      location:      dept.location      ?? '',
      budget:        dept.budget        ?? '',
      active:        dept.active,           // ← use "active" not "isActive"
      totalBeds:     dept.totalBeds     ?? 0,
      availableBeds: dept.availableBeds ?? 0,
    });
    setEditOpen(true);
  };

  // ── save edit ─────────────────────────────────────────────────────────────
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    if (!editingDept.name.trim()) { toast.error('Department name is required'); return; }
    if (editingDept.availableBeds > editingDept.totalBeds) {
      toast.error('Available beds cannot exceed total beds'); return;
    }
    try {
      const { id, ...payload } = editingDept;
      await updateDept.mutateAsync({
        id,
        payload: {
          name:          payload.name.trim(),
          description:   payload.description || undefined,
          location:      payload.location    || undefined,
          budget:        payload.budget      || undefined,
          active:        payload.active,
          totalBeds:     payload.totalBeds,
          availableBeds: payload.availableBeds,
        },
      });
      toast.success('Department updated successfully');
      setEditOpen(false);
      setEditingDept(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update department');
    }
  };

  // ── delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    try {
      await deleteDept.mutateAsync(id);
      toast.success('Department deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete department');
    }
  };

  // ── table columns ─────────────────────────────────────────────────────────
  // DataTable requires T extends { id: string }, so we cast id to string when
  // passing to the table. The actual DepartmentDto.id stays as number everywhere else.
  type DeptRow = Omit<DepartmentDto, 'id'> & { id: string };

  const columns = [
    { key: 'name',          header: 'Department Name' },
    { key: 'location',      header: 'Location',       render: (d: DeptRow) => d.location      || '—' },
    { key: 'budget',        header: 'Budget',          render: (d: DeptRow) => d.budget        || '—' },
    { key: 'totalBeds',     header: 'Total Beds',      render: (d: DeptRow) => d.totalBeds     ?? 0   },
    { key: 'availableBeds', header: 'Available Beds',  render: (d: DeptRow) => d.availableBeds ?? 0   },
    {
      key: 'description',
      header: 'Description',
      render: (d: DeptRow) =>
        d.description
          ? <span className="text-sm text-muted-foreground">{d.description.slice(0, 50)}{d.description.length > 50 ? '…' : ''}</span>
          : '—',
    },
    {
      key: 'active',
      header: 'Status',
      // use the correct field name "active" from the backend JSON
      render: (d: DeptRow) => <StatusBadge status={d.active ? 'active' : 'inactive'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: DeptRow) => {
        // Recover numeric id for mutation calls
        const numId = Number(row.id);
        // Recover full DepartmentDto shape for openEdit
        const dept: DepartmentDto = { ...row, id: numId };
        return (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(dept)}>
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Department</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete <strong>{row.name}</strong>? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(numId)}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  // Convert id: number → string for DataTable
  const tableRows: DeptRow[] = departments.map(d => ({ ...d, id: String(d.id) }));

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
                  {createDept.isPending ? 'Creating…' : 'Create Department'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onOpenChange={(open) => { setEditOpen(open); if (!open) setEditingDept(null); }}
      >
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
                {updateDept.isPending ? 'Saving…' : 'Save Changes'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {isLoading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load departments'}
          </AlertDescription>
        </Alert>
      )}
      {!isLoading && !error && (
        <DataTable
          data={tableRows}
          columns={columns}
          emptyMessage="No departments found. Add one to get started."
        />
      )}
    </DashboardLayout>
  );
};

export default AdminDepartments;
