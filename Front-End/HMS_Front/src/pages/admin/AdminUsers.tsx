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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useUsers, useCreateUser, useUpdateUser } from '@/hooks/useUsers';
import { useDepartments } from '@/hooks/useDepartments';
import { UserRole } from '@/types';
import { toast } from 'sonner';
import { Plus, Search, Edit, UserX, UserCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { adminNavItems } from '@/constants/adminNavItems';
import userService, { UserDto } from '@/services/userService';
import { useQueryClient } from '@tanstack/react-query';
import { USERS_KEY } from '@/hooks/useUsers';

const roles: UserRole[] = ['doctor', 'nurse', 'receptionist', 'pharmacist', 'accountant', 'technician'];

const emptyForm = {
  username: '', nationalId: '', name: '', email: '', phone: '',
  role: '' as UserRole, department: '', password: '',
};

const AdminUsers = () => {
  const { data: users = [], isLoading, error } = useUsers();
  const { data: departments = [] } = useDepartments();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const qc = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newUser, setNewUser] = useState(emptyForm);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.nationalId?.includes(searchQuery),
  );

  const handleToggleStatus = async (u: UserDto) => {
    const newStatus = u.status?.toLowerCase() === 'active' ? 'INACTIVE' : 'ACTIVE';
    try {
      await userService.update(u.id, { ...u, status: newStatus } as never);
      qc.invalidateQueries({ queryKey: [USERS_KEY] });
      toast.success(`User ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update user status');
    }
  };

  const handleOpenEdit = (u: UserDto) => {
    setEditingUser({ ...u });
    setEditOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.nationalId || !newUser.name || !newUser.email || !newUser.role || !newUser.password) {
      toast.error('Please fill in all required fields including password');
      return;
    }
    if (newUser.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      await createUser.mutateAsync({
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        nationalId: newUser.nationalId,
        password: newUser.password,
        phone: newUser.phone,
        role: newUser.role.toUpperCase(),
        address: newUser.department,
      });
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
      await updateUser.mutateAsync({
        id: editingUser.id,
        payload: {
          username: editingUser.username,
          nationalId: editingUser.nationalId,
          name: editingUser.name,
          email: editingUser.email,
          phone: editingUser.phone,
          role: editingUser.role?.toUpperCase(),
        },
      });
      toast.success('User updated successfully');
      setEditOpen(false);
      setEditingUser(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'username', header: 'Username' },
    { key: 'nationalId', header: 'National ID' },
    { key: 'role', header: 'Role', render: (u: UserDto) => <span className="capitalize">{u.role?.toLowerCase()}</span> },
    { key: 'status', header: 'Status', render: (u: UserDto) => <StatusBadge status={u.status?.toLowerCase() === 'active' ? 'active' : 'inactive'} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (u: UserDto) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" title="Edit user" onClick={() => handleOpenEdit(u)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title={u.status?.toLowerCase() === 'active' ? 'Deactivate user' : 'Activate user'}
            onClick={() => handleToggleStatus(u)}
            className={u.status?.toLowerCase() === 'active'
              ? 'text-destructive hover:text-destructive hover:bg-destructive/10'
              : 'text-success hover:text-success hover:bg-success/10'}
          >
            {u.status?.toLowerCase() === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
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
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Username</Label>
                    <Input value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} required />
                  </div>
                  <div>
                    <Label>National ID</Label>
                    <Input value={newUser.nationalId} onChange={(e) => setNewUser({ ...newUser, nationalId: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <Label>Full Name</Label>
                  <Input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select onValueChange={(v) => setNewUser({ ...newUser, role: v as UserRole, department: '' })}>
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {newUser.role && (
                  <div>
                    <Label>Department</Label>
                    <Select onValueChange={(v) => setNewUser({ ...newUser, department: v })}>
                      <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label>Password *</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Min. 6 characters"
                      required
                      className="pr-10"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createUser.isPending}>
                  {createUser.isPending ? 'Creating...' : 'Create User'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditingUser(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User{editingUser ? ` — ${editingUser.name}` : ''}</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Username</Label>
                  <Input value={editingUser.username} onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })} required />
                </div>
                <div>
                  <Label>National ID</Label>
                  <Input value={editingUser.nationalId} onChange={(e) => setEditingUser({ ...editingUser, nationalId: e.target.value })} required />
                </div>
              </div>
              <div>
                <Label>Full Name</Label>
                <Input value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} required />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} required />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={editingUser.phone} onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })} />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={editingUser.role?.toLowerCase()} onValueChange={(v) => setEditingUser({ ...editingUser, role: v.toUpperCase() })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={updateUser.isPending}>
                {updateUser.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error instanceof Error ? error.message : 'Failed to load users'}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && (
        <DataTable data={filteredUsers} columns={columns} />
      )}
    </DashboardLayout>
  );
};

export default AdminUsers;
