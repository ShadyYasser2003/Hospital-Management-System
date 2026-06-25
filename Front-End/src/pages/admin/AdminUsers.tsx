import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useUsers';
import { useDepartments } from '@/hooks/useDepartments';
import { UserRole } from '@/types';
import { toast } from 'sonner';
import { Plus, Search, Edit, UserX, UserCheck, Trash2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { adminNavItems } from '@/constants/adminNavItems';
import userService, { UserDto } from '@/services/userService';
import api from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { USERS_KEY } from '@/hooks/useUsers';

const roles: UserRole[] = ['doctor', 'nurse', 'receptionist', 'pharmacist', 'accountant', 'technician'];
const shifts = ['MORNING', 'AFTERNOON', 'NIGHT'];
const employmentStatuses = ['FULL_TIME', 'PART_TIME', 'CONTRACT'];

const emptyForm = {
  username: '', nationalId: '', name: '', email: '', phone: '',
  role: '' as UserRole, address: '', password: '', dateOfBirth: '',
  // role-specific
  licenseNumber: '', licenseExpiryDate: '', specialization: '',
  qualification: '', medicalSchool: '', yearOfGraduation: '',
  yearsOfExperience: '', hireDate: '', employmentStatus: '',
  shift: '', employeeNumber: '', specialityArea: '',
  hipaaTrainingDate: '', customerServiceTraining: '',
  // department assignment (stored separately, not sent as part of user payload)
  departmentName: '',
};

type UserForm = typeof emptyForm;

/** Fields shown based on selected role */
const RoleSpecificFields = ({ form, onChange }: { form: UserForm; onChange: (f: UserForm) => void }) => {
  const role = form.role?.toLowerCase();

  if (role === 'doctor') return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>License Number</Label><Input value={form.licenseNumber} onChange={e => onChange({ ...form, licenseNumber: e.target.value })} /></div>
        <div><Label>Specialization</Label><Input value={form.specialization} onChange={e => onChange({ ...form, specialization: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Qualification</Label><Input value={form.qualification} onChange={e => onChange({ ...form, qualification: e.target.value })} /></div>
        <div><Label>Medical School</Label><Input value={form.medicalSchool} onChange={e => onChange({ ...form, medicalSchool: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Year of Graduation</Label><Input type="number" value={form.yearOfGraduation} onChange={e => onChange({ ...form, yearOfGraduation: e.target.value })} /></div>
        <div><Label>Years of Experience</Label><Input type="number" value={form.yearsOfExperience} onChange={e => onChange({ ...form, yearsOfExperience: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Hire Date</Label><Input type="date" value={form.hireDate} onChange={e => onChange({ ...form, hireDate: e.target.value })} /></div>
        <div>
          <Label>Shift</Label>
          <Select value={form.shift} onValueChange={v => onChange({ ...form, shift: v })}>
            <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
            <SelectContent>{shifts.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Employment Status</Label>
        <Select value={form.employmentStatus} onValueChange={v => onChange({ ...form, employmentStatus: v })}>
          <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
          <SelectContent>{employmentStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </>
  );

  if (role === 'nurse') return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>License Number</Label><Input value={form.licenseNumber} onChange={e => onChange({ ...form, licenseNumber: e.target.value })} /></div>
        <div><Label>Specialization</Label><Input value={form.specialization} onChange={e => onChange({ ...form, specialization: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Years of Experience</Label><Input type="number" value={form.yearsOfExperience} onChange={e => onChange({ ...form, yearsOfExperience: e.target.value })} /></div>
        <div><Label>Hire Date</Label><Input type="date" value={form.hireDate} onChange={e => onChange({ ...form, hireDate: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Shift</Label>
          <Select value={form.shift} onValueChange={v => onChange({ ...form, shift: v })}>
            <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
            <SelectContent>{shifts.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Employment Status</Label>
          <Select value={form.employmentStatus} onValueChange={v => onChange({ ...form, employmentStatus: v })}>
            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>{employmentStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
    </>
  );

  if (role === 'pharmacist') return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>License Number</Label><Input value={form.licenseNumber} onChange={e => onChange({ ...form, licenseNumber: e.target.value })} /></div>
        <div><Label>License Expiry Date</Label><Input type="date" value={form.licenseExpiryDate} onChange={e => onChange({ ...form, licenseExpiryDate: e.target.value })} /></div>
      </div>
      <div>
        <Label>Shift</Label>
        <Select value={form.shift} onValueChange={v => onChange({ ...form, shift: v })}>
          <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
          <SelectContent>{shifts.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </>
  );

  if (role === 'accountant') return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Employee Number</Label><Input value={form.employeeNumber} onChange={e => onChange({ ...form, employeeNumber: e.target.value })} /></div>
        <div>
          <Label>Shift</Label>
          <Select value={form.shift} onValueChange={v => onChange({ ...form, shift: v })}>
            <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
            <SelectContent>{shifts.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Employment Status</Label>
        <Select value={form.employmentStatus} onValueChange={v => onChange({ ...form, employmentStatus: v })}>
          <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
          <SelectContent>{employmentStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </>
  );

  if (role === 'receptionist') return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Speciality Area</Label><Input value={form.specialityArea} onChange={e => onChange({ ...form, specialityArea: e.target.value })} /></div>
        <div>
          <Label>Shift</Label>
          <Select value={form.shift} onValueChange={v => onChange({ ...form, shift: v })}>
            <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
            <SelectContent>{shifts.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>HIPAA Training Date</Label><Input type="date" value={form.hipaaTrainingDate} onChange={e => onChange({ ...form, hipaaTrainingDate: e.target.value })} /></div>
        <div><Label>Customer Service Training</Label><Input type="date" value={form.customerServiceTraining} onChange={e => onChange({ ...form, customerServiceTraining: e.target.value })} /></div>
      </div>
      <div>
        <Label>Employment Status</Label>
        <Select value={form.employmentStatus} onValueChange={v => onChange({ ...form, employmentStatus: v })}>
          <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
          <SelectContent>{employmentStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </>
  );

  if (role === 'technician') return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>License Number</Label><Input value={form.licenseNumber} onChange={e => onChange({ ...form, licenseNumber: e.target.value })} /></div>
        <div><Label>Specialization</Label><Input value={form.specialization} onChange={e => onChange({ ...form, specialization: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Years of Experience</Label><Input type="number" value={form.yearsOfExperience} onChange={e => onChange({ ...form, yearsOfExperience: e.target.value })} /></div>
        <div><Label>Hire Date</Label><Input type="date" value={form.hireDate} onChange={e => onChange({ ...form, hireDate: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Shift</Label>
          <Select value={form.shift} onValueChange={v => onChange({ ...form, shift: v })}>
            <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
            <SelectContent>{shifts.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Employment Status</Label>
          <Select value={form.employmentStatus} onValueChange={v => onChange({ ...form, employmentStatus: v })}>
            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>{employmentStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
    </>
  );

  return null;
};

const buildPayload = (form: UserForm) => ({
  username: form.username,
  name: form.name,
  email: form.email,
  nationalId: form.nationalId,
  password: form.password,
  phone: form.phone,
  role: form.role.toUpperCase(),
  address: form.address || undefined,
  dateOfBirth: form.dateOfBirth || undefined,
  licenseNumber: form.licenseNumber || undefined,
  licenseExpiryDate: form.licenseExpiryDate || undefined,
  specialization: form.specialization || undefined,
  qualification: form.qualification || undefined,
  medicalSchool: form.medicalSchool || undefined,
  yearOfGraduation: form.yearOfGraduation ? Number(form.yearOfGraduation) : undefined,
  yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : undefined,
  hireDate: form.hireDate || undefined,
  employmentStatus: form.employmentStatus || undefined,
  shift: form.shift || undefined,
  employeeNumber: form.employeeNumber || undefined,
  specialityArea: form.specialityArea || undefined,
  hipaaTrainingDate: form.hipaaTrainingDate || undefined,
  customerServiceTraining: form.customerServiceTraining || undefined,
});

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: CommonFields and RoleSpecificFields are defined at MODULE SCOPE
// (outside AdminUsers). Defining them inside the parent component causes React
// to treat them as a new component type on every render, which unmounts and
// remounts the inputs — causing focus loss on every keystroke.
// ─────────────────────────────────────────────────────────────────────────────

interface CommonFieldsProps {
  form: UserForm;
  onChange: (f: UserForm) => void;
  isCreate: boolean;
  showPassword: boolean;
  onTogglePassword: () => void;
  departments: { id: number | string; name: string }[];
}

const CommonFields = ({
  form,
  onChange,
  isCreate,
  showPassword,
  onTogglePassword,
  departments,
}: CommonFieldsProps) => (
  <>
    <div className="grid grid-cols-2 gap-4">
      <div><Label>Username <span className="text-destructive">*</span></Label><Input value={form.username} onChange={e => onChange({ ...form, username: e.target.value })} required /></div>
      <div><Label>National ID <span className="text-destructive">*</span></Label><Input value={form.nationalId} onChange={e => onChange({ ...form, nationalId: e.target.value })} required /></div>
    </div>
    <div><Label>Full Name <span className="text-destructive">*</span></Label><Input value={form.name} onChange={e => onChange({ ...form, name: e.target.value })} required /></div>
    <div><Label>Email <span className="text-destructive">*</span></Label><Input type="email" value={form.email} onChange={e => onChange({ ...form, email: e.target.value })} required /></div>
    <div className="grid grid-cols-2 gap-4">
      <div><Label>Phone</Label><Input value={form.phone} onChange={e => onChange({ ...form, phone: e.target.value })} /></div>
      <div><Label>Date of Birth</Label><Input type="date" value={form.dateOfBirth} onChange={e => onChange({ ...form, dateOfBirth: e.target.value })} /></div>
    </div>
    <div><Label>Address</Label><Input value={form.address} onChange={e => onChange({ ...form, address: e.target.value })} /></div>
    <div>
      <Label>Role <span className="text-destructive">*</span></Label>
      <Select value={form.role} onValueChange={v => onChange({ ...form, role: v as UserRole })}>
        <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
        <SelectContent>{roles.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}</SelectContent>
      </Select>
    </div>
    {form.role && (
      <div>
        <Label>Department <span className="text-xs text-muted-foreground">(optional — can be assigned later)</span></Label>
        <Select value={form.departmentName} onValueChange={v => onChange({ ...form, departmentName: v })}>
          <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="_none">— None —</SelectItem>
            {departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    )}
    <div>
      <Label>
        {isCreate ? <>Password <span className="text-destructive">*</span></> : 'New Password'}{' '}
        <span className="text-muted-foreground text-xs">{isCreate ? '(min. 6 characters)' : '(leave blank to keep current)'}</span>
      </Label>
      <div className="relative mt-1">
        <Input
          type={showPassword ? 'text' : 'password'}
          value={form.password}
          onChange={e => onChange({ ...form, password: e.target.value })}
          placeholder={isCreate ? 'Min. 6 characters' : 'Leave blank to keep current'}
          required={isCreate}
          className="pr-10"
        />
        <button type="button" onClick={onTogglePassword} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  </>
);

const AdminUsers = () => {
  const { data: users = [], isLoading, error } = useUsers();
  const { data: departments = [] } = useDepartments();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const qc = useQueryClient();

  const [searchQuery, setSearchQuery]   = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [addOpen, setAddOpen]           = useState(false);
  const [newUser, setNewUser]           = useState<UserForm>(emptyForm);
  const [editOpen, setEditOpen]         = useState(false);
  const [editingUser, setEditingUser]   = useState<UserDto | null>(null);
  const [editForm, setEditForm]         = useState<UserForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<UserDto | null>(null);
  const [deleteOpen, setDeleteOpen]     = useState(false);

  const handleTogglePassword = React.useCallback(() => setShowPassword(p => !p), []);

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.nationalId?.includes(searchQuery),
  );

  const handleToggleStatus = async (u: UserDto) => {
    const newStatus = u.status?.toLowerCase() === 'active' ? 'INACTIVE' : 'ACTIVE';
    try {
      await userService.updateStatus(u.id, newStatus as 'ACTIVE' | 'INACTIVE');
      qc.invalidateQueries({ queryKey: [USERS_KEY] });
      toast.success(`User ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update user status');
    }
  };

  const handleOpenEdit = (u: UserDto) => {
    setEditingUser(u);
    setEditForm({
      username: u.username ?? '',
      nationalId: u.nationalId ?? '',
      name: u.name ?? '',
      email: u.email ?? '',
      phone: u.phone ?? '',
      role: (u.role?.toLowerCase() ?? '') as UserRole,
      address: u.address ?? '',
      password: '',
      dateOfBirth: u.dateOfBirth ?? '',
      licenseNumber: u.licenseNumber ?? '',
      licenseExpiryDate: u.licenseExpiryDate ?? '',
      specialization: u.specialization ?? '',
      qualification: u.qualification ?? '',
      medicalSchool: u.medicalSchool ?? '',
      yearOfGraduation: u.yearOfGraduation ? String(u.yearOfGraduation) : '',
      yearsOfExperience: u.yearsOfExperience ? String(u.yearsOfExperience) : '',
      hireDate: u.hireDate ?? '',
      employmentStatus: u.employmentStatus ?? '',
      shift: u.shift ?? '',
      employeeNumber: u.employeeNumber ?? '',
      specialityArea: u.specialityArea ?? '',
      hipaaTrainingDate: u.hipaaTrainingDate ?? '',
      customerServiceTraining: u.customerServiceTraining ?? '',
      departmentName: u.departmentName ?? '',
    });
    setEditOpen(true);
  };

  const handleOpenDelete = (u: UserDto) => { setDeleteTarget(u); setDeleteOpen(true); };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser.mutateAsync(deleteTarget.id);
      toast.success(`User "${deleteTarget.name}" deleted successfully`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete user');
    } finally { setDeleteOpen(false); setDeleteTarget(null); }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.nationalId || !newUser.name || !newUser.email || !newUser.role || !newUser.password) {
      toast.error('Please fill in all required fields including password');
      return;
    }
    if (newUser.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    try {
      const payload = buildPayload(newUser);
      const role = newUser.role.toLowerCase();

      // Route to role-specific endpoint so the joined table row is created correctly.
      if (role === 'doctor') {
        await api.post('/api/doctor', payload);
      } else if (role === 'nurse') {
        await api.post('/api/nurse', payload);
      } else if (role === 'receptionist') {
        await api.post('/api/receptionist', payload);
      } else if (role === 'pharmacist') {
        await api.post('/api/pharmacists', payload);
      } else if (role === 'technician') {
        await api.post('/api/technicians', payload);
      } else if (role === 'accountant') {
        // Must use /api/accountants so the accountants subtable row is created
        await api.post('/api/accountants', payload);
      } else {
        await createUser.mutateAsync(payload);
      }

      qc.invalidateQueries({ queryKey: [USERS_KEY] });
      setAddOpen(false);
      setNewUser(emptyForm);
      toast.success('User created successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const payload = buildPayload(editForm);
      // Don't send empty password on edit
      if (!editForm.password) delete (payload as Record<string, unknown>).password;
      await updateUser.mutateAsync({ id: editingUser.id, payload });
      toast.success('User updated successfully');
      setEditOpen(false);
      setEditingUser(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const columns = [
    { key: 'name',       header: 'Name' },
    { key: 'username',   header: 'Username' },
    { key: 'email',      header: 'Email' },
    { key: 'phone',      header: 'Phone' },
    { key: 'nationalId', header: 'National ID' },
    { key: 'role',       header: 'Role',   render: (u: UserDto) => <span className="capitalize">{u.role?.toLowerCase()}</span> },
    { key: 'status',     header: 'Status', render: (u: UserDto) => <StatusBadge status={u.status?.toLowerCase() === 'active' ? 'active' : 'inactive'} /> },
    {
      key: 'actions', header: 'Actions',
      render: (u: UserDto) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" title="Edit user" onClick={() => handleOpenEdit(u)}><Edit className="h-4 w-4" /></Button>
          <Button
            variant="ghost" size="sm"
            title={u.status?.toLowerCase() === 'active' ? 'Deactivate user' : 'Activate user'}
            onClick={() => handleToggleStatus(u)}
            className={u.status?.toLowerCase() === 'active' ? 'text-warning hover:text-warning hover:bg-warning/10' : 'text-success hover:text-success hover:bg-success/10'}
          >
            {u.status?.toLowerCase() === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" title="Delete user" onClick={() => handleOpenDelete(u)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout navItems={adminNavItems} title="User Management">
      <PageHeader
        title="User Accounts"
        description="Manage all user accounts in the system"
        action={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add User</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <CommonFields
                  form={newUser}
                  onChange={setNewUser}
                  isCreate
                  showPassword={showPassword}
                  onTogglePassword={handleTogglePassword}
                  departments={departments}
                />
                {newUser.role && <RoleSpecificFields form={newUser} onChange={setNewUser} />}
                <Button type="submit" className="w-full" disabled={createUser.isPending}>
                  {createUser.isPending ? 'Creating...' : 'Create User'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={open => { setEditOpen(open); if (!open) setEditingUser(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit User{editingUser ? ` — ${editingUser.name}` : ''}</DialogTitle></DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <CommonFields
              form={editForm}
              onChange={setEditForm}
              isCreate={false}
              showPassword={showPassword}
              onTogglePassword={handleTogglePassword}
              departments={departments}
            />
            {editForm.role && <RoleSpecificFields form={editForm} onChange={setEditForm} />}
            <Button type="submit" className="w-full" disabled={updateUser.isPending}>
              {updateUser.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{deleteTarget?.name}</strong> ({deleteTarget?.username})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleteUser.isPending}>
              {deleteUser.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, username, or national ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
      </div>

      {isLoading && <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error instanceof Error ? error.message : 'Failed to load users'}</AlertDescription></Alert>}
      {!isLoading && !error && <DataTable data={filteredUsers} columns={columns} />}
    </DashboardLayout>
  );
};

export default AdminUsers;
