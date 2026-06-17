import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/shared/StatCard';
import QuickAction from '@/components/shared/QuickAction';
import { useAuth } from '@/contexts/AuthContext';
import { usePatients } from '@/hooks/usePatients';
import { useAppointments } from '@/hooks/useAppointments';
import { useLowStockMedicines } from '@/hooks/useMedicines';
import { useUnreadCount } from '@/hooks/useNotifications';
import { useUsers } from '@/hooks/useUsers';
import { Users, Building, Calendar, Bed, Pill, UserPlus, Bell } from 'lucide-react';
import { adminNavItems } from '@/constants/adminNavItems';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { data: patients = [] }      = usePatients();
  const { data: appointments = [] }  = useAppointments();
  const { data: lowStock = [] }      = useLowStockMedicines();
  const { data: unreadCount = 0 }    = useUnreadCount(user?.id);
  const { data: users = [] }         = useUsers();

  const today = new Date().toISOString().split('T')[0];
  const staffCount        = users.filter((u: { role: string }) => u.role !== 'PATIENT').length;
  const todayAppointments = appointments.filter(a => a.appointmentDate === today);

  return (
    <DashboardLayout navItems={adminNavItems} title="Admin Dashboard">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">Here's an overview of your hospital system.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Total Staff"           value={String(staffCount)}              icon={<Users className="h-6 w-6" />}    variant="primary" />
        <StatCard title="Total Patients"        value={String(patients.length)}         icon={<Users className="h-6 w-6" />}    variant="accent" />
        <StatCard title="Today's Appointments"  value={String(todayAppointments.length)} icon={<Calendar className="h-6 w-6" />} variant="success" />
        <StatCard title="Low Stock Items"       value={String(lowStock.length)}         icon={<Pill className="h-6 w-6" />}     variant="warning" />
        <StatCard title="Notifications"         value={String(unreadCount)}             icon={<Bell className="h-6 w-6" />}     variant="primary" />
      </div>

      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <QuickAction title="Add User"       icon={<UserPlus className="h-5 w-5" />}  to="/admin/users" />
        <QuickAction title="Departments"    icon={<Building className="h-5 w-5" />}  to="/admin/departments" />
        <QuickAction title="Appointments"   icon={<Calendar className="h-5 w-5" />}  to="/admin/appointments" />
        <QuickAction title="Manage Beds"    icon={<Bed className="h-5 w-5" />}       to="/admin/beds" />
        <QuickAction title="Medicine Stock" icon={<Pill className="h-5 w-5" />}      to="/admin/medicines" />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
