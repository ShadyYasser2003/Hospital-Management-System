import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { adminNavItems } from '@/constants/adminNavItems';
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from '@/hooks/useDepartments';
import { DepartmentDto } from '@/services/departmentService';

const emptyForm = { name: '', description: '', location: '' };

const AdminDepartments = () => {
  const { data: departments = [], isLoading, error } = useDepartments();
  const createDept = useCreateDepartment();
  const updateDept = useUpdateDepartment();
  const deleteDept = useDeleteDepartment();

  const [addOpen, setAddOpen] = useState(false);
  const [newDept, setNewDept] = useState(emptyForm);
  const [editOpen, setEditOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentDto | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.name) { toast.error('Name is required'); return; }
    try {
      await createDept.mutateAsync({ ...newDept, isActive: true });
      setAddOpen(false);
      setNewDept(emptyForm);
      toast.success('Department created successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create department');
    }
  };

  const handleOpenEdit = (dept: DepartmentDto) => {
    setEditingDept({ ...dept });
    setEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    try {
      await updateDept.mutateAsync({ id: editingDept.id, payload: { name: editingDept.name, description: editingDept.description, location: editingDept.location } });
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
    { key: 'name', header: 'Department Name' },
    { key: 'description', header: 'Description' },
    { key: 'location', header: 'Location', render: (d: DepartmentDto) => d.location || '—' },
    { key: 'totalBeds', header: 'Total Beds', render: (d: DepartmentDto) => d.totalBeds ?? '—' },
    { key: 'isActive', header: 'Status', render: (d: DepartmentDto) => <StatusBadge status={d.isActive ? 'active' : 'inactive'} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (dept: DepartmentDto) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(dept)}><Edit className="h-4 w-4" /></Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Department</AlertDialogTitle>
                <AlertDialogDescription>Are you sure you want to delete <strong>{dept.name}</strong>? This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(dept.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
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
            <DialogContent>
              <DialogHeader><DialogTitle>Create Department</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div><Label>Department Name</Label><Input value={newDept.name} onChange={(e) => setNewDept({ ...newDept, name: e.target.value })} required /></div>
                <div><Label>Location</Label><Input value={newDept.location} onChange={(e) => setNewDept({ ...newDept, location: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea value={newDept.description} onChange={(e) => setNewDept({ ...newDept, description: e.target.value })} /></div>
                <Button type="submit" className="w-full" disabled={createDept.isPending}>{createDept.isPending ? 'Creating...' : 'Create Department'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditingDept(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Department{editingDept ? ` — ${editingDept.name}` : ''}</DialogTitle></DialogHeader>
          {editingDept && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div><Label>Department Name</Label><Input value={editingDept.name} onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })} required /></div>
              <div><Label>Location</Label><Input value={editingDept.location || ''} onChange={(e) => setEditingDept({ ...editingDept, location: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={editingDept.description || ''} onChange={(e) => setEditingDept({ ...editingDept, description: e.target.value })} /></div>
              <Button type="submit" className="w-full" disabled={updateDept.isPending}>{updateDept.isPending ? 'Saving...' : 'Save Changes'}</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {isLoading && <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error instanceof Error ? error.message : 'Failed to load departments'}</AlertDescription></Alert>}
      {!isLoading && !error && <DataTable data={departments} columns={columns} />}
    </DashboardLayout>
  );
};

export default AdminDepartments;
