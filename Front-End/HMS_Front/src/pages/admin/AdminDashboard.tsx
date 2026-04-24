import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/shared/StatCard';
import QuickAction from '@/components/shared/QuickAction';
import AnalyticsDashboard from '@/components/shared/AnalyticsDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Users, Building, Calendar, Bed, Pill, FileText, Activity, UserPlus, ClipboardList, Bell } from 'lucide-react';
import { adminNavItems } from '@/constants/adminNavItems';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { users, patients, appointments, medicines, notifications } = useData();

  const today = new Date().toISOString().split('T')[0];
  const staffCount = users.filter(u => u.role !== 'patient').length;
  const todayAppointments = appointments.filter(a => a.date === today);
  const lowStockMedicines = medicines.filter(m => m.status === 'low-stock' || m.status === 'out-of-stock');
  const unreadNotifications = notifications.filter(n => (n.userId === user?.id || n.role === user?.role) && !n.read);

  return (
    <DashboardLayout navItems={adminNavItems} title="Admin Dashboard">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">Here's an overview of your hospital system.</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Total Staff"
          value={String(staffCount)}
          icon={<Users className="h-6 w-6" />}
          variant="primary"
        />
        <StatCard
          title="Total Patients"
          value={String(patients.length)}
          icon={<Users className="h-6 w-6" />}
          variant="accent"
        />
        <StatCard
          title="Today's Appointments"
          value={String(todayAppointments.length)}
          icon={<Calendar className="h-6 w-6" />}
          variant="success"
        />
        <StatCard
          title="Low Stock Items"
          value={String(lowStockMedicines.length)}
          icon={<Pill className="h-6 w-6" />}
          variant="warning"
        />
        <StatCard
          title="Notifications"
          value={String(unreadNotifications.length)}
          icon={<Bell className="h-6 w-6" />}
          variant="primary"
        />
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <QuickAction title="Add User" icon={<UserPlus className="h-5 w-5" />} to="/admin/users" />
        <QuickAction title="Departments" icon={<Building className="h-5 w-5" />} to="/admin/departments" />
        <QuickAction title="View Appointments" icon={<Calendar className="h-5 w-5" />} to="/admin/appointments" />
        <QuickAction title="Manage Beds" icon={<Bed className="h-5 w-5" />} to="/admin/beds" />
        <QuickAction title="Medicine Stock" icon={<Pill className="h-5 w-5" />} to="/admin/medicines" />
        <QuickAction title="Custom Forms" icon={<FileText className="h-5 w-5" />} to="/admin/forms" />
      </div>

      <AnalyticsDashboard role="admin" />
    </DashboardLayout>
  );
};

export default AdminDashboard;
