import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Stethoscope, Plus, Trash2, AlertCircle, Edit } from 'lucide-react';
import { adminNavItems } from '@/constants/adminNavItems';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import StatusBadge from '@/components/shared/StatusBadge';

interface SpecialityDto {
  id: number;
  name: string;
  description?: string;
  status?: string;
}

const SPECIALITIES_KEY = 'specialities';
const emptyForm = { name: '', description: '', status: 'ACTIVE' };

// ─── Module-scope: must NOT be inside AdminSpecialties.
// Defining components inside a parent causes React to treat them as a new
// type on every render → unmount/remount → input loses focus on every keystroke.
const SpecialityForm = ({
  f,
  onChange,
}: {
  f: typeof emptyForm;
  onChange: (v: typeof emptyForm) => void;
}) => (
  <div className="space-y-4">
    <div>
      <Label>Name <span className="text-destructive">*</span></Label>
      <Input value={f.name} onChange={e => onChange({ ...f, name: e.target.value })} required />
    </div>
    <div>
      <Label>Description</Label>
      <Textarea value={f.description} onChange={e => onChange({ ...f, description: e.target.value })} rows={2} />
    </div>
    <div>
      <Label>Status</Label>
      <Select value={f.status} onValueChange={v => onChange({ ...f, status: v })}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="INACTIVE">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);

const AdminSpecialties = () => {
  const qc = useQueryClient();
  const { data: specialities = [], isLoading, error } = useQuery<SpecialityDto[]>({
    queryKey: [SPECIALITIES_KEY],
    queryFn: async () => {
      const { data } = await api.get<SpecialityDto[]>('/api/specialities');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: typeof emptyForm) =>
      api.post<SpecialityDto>('/api/specialities', payload).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [SPECIALITIES_KEY] }); toast.success('Specialty created'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: typeof emptyForm }) =>
      api.put<SpecialityDto>(`/api/specialities/${id}`, payload).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [SPECIALITIES_KEY] }); toast.success('Specialty updated'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/specialities/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [SPECIALITIES_KEY] }); toast.success('Specialty deleted'); },
    onError: (e: Error) => toast.error(e.message),
  });

  const [addOpen, setAddOpen]       = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [editOpen, setEditOpen]     = useState(false);
  const [editingSpec, setEditingSpec] = useState<SpecialityDto | null>(null);
  const [editForm, setEditForm]     = useState(emptyForm);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    await createMutation.mutateAsync(form);
    setAddOpen(false);
    setForm(emptyForm);
  };

  const handleOpenEdit = (s: SpecialityDto) => {
    setEditingSpec(s);
    setEditForm({ name: s.name, description: s.description ?? '', status: s.status ?? 'ACTIVE' });
    setEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpec) return;
    if (!editForm.name.trim()) { toast.error('Name is required'); return; }
    await updateMutation.mutateAsync({ id: editingSpec.id, payload: editForm });
    setEditOpen(false);
    setEditingSpec(null);
  };

  return (
    <DashboardLayout navItems={adminNavItems} title="Specialties">
      <PageHeader
        title="Medical Specialties"
        description="Manage medical specialties"
        action={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Specialty</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Specialty</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <SpecialityForm f={form} onChange={setForm} />
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Specialty'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={open => { setEditOpen(open); if (!open) setEditingSpec(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Specialty{editingSpec ? ` — ${editingSpec.name}` : ''}</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <SpecialityForm f={editForm} onChange={setEditForm} />
            <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {isLoading && <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>}
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error instanceof Error ? error.message : 'Failed to load specialties'}</AlertDescription></Alert>}

      {!isLoading && !error && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {specialities.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-8">No specialties yet. Add one to get started.</p>
          )}
          {specialities.map((s) => (
            <Card key={s.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    {s.name}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEdit(s)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Specialty</AlertDialogTitle>
                          <AlertDialogDescription>Delete <strong>{s.name}</strong>? This cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(s.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{s.description || '—'}</p>
                {s.status && <StatusBadge status={s.status.toLowerCase() as never} />}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminSpecialties;
