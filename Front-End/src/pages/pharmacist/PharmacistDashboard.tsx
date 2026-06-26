import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/shared/StatCard';
import ProfileForm from '@/components/shared/ProfileForm';
import { useAuth } from '@/contexts/AuthContext';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import { useLowStockMedicines } from '@/hooks/useMedicines';
import { useUnreadCount } from '@/hooks/useNotifications';
import { LayoutDashboard, Pill, Package, FileText, User, AlertTriangle, Bell } from 'lucide-react';

const navItems = [
  { label: 'Dashboard',    path: '/pharmacist',               icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Inventory',    path: '/pharmacist/inventory',     icon: <Package className="h-5 w-5" /> },
  { label: 'Prescriptions',path: '/pharmacist/prescriptions', icon: <FileText className="h-5 w-5" /> },
  { label: 'Dispense',     path: '/pharmacist/dispense',      icon: <Pill className="h-5 w-5" /> },
  { label: 'Notifications',path: '/pharmacist/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'Profile',      path: '/pharmacist/profile',       icon: <User className="h-5 w-5" /> },
];

export const PharmacistDashboard = () => {
  const { user } = useAuth();
  const { data: prescriptions = [] } = usePrescriptions();
  const { data: lowStock = [] }      = useLowStockMedicines();
  const { data: unreadCount = 0 }    = useUnreadCount(user?.id);

  const today = new Date().toISOString().split('T')[0];
  const pending        = prescriptions.filter(p => p.status?.toUpperCase() === 'PENDING');
  const dispensedToday = prescriptions.filter(p =>
    p.status?.toUpperCase() === 'DISPENSED' && p.prescriptionDate === today,
  );

  return (
    <DashboardLayout navItems={navItems} title="Pharmacist Dashboard">
      <h1 className="text-2xl font-bold mb-2">Welcome, {user?.name}!</h1>
      <p className="text-muted-foreground mb-8">Manage pharmacy inventory and prescriptions</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pending Prescriptions" value={String(pending.length)}        icon={<FileText className="h-6 w-6" />}       variant="primary" />
        <StatCard title="Dispensed Today"        value={String(dispensedToday.length)} icon={<Pill className="h-6 w-6" />}           variant="success" />
        <StatCard title="Low Stock Items"        value={String(lowStock.length)}       icon={<AlertTriangle className="h-6 w-6" />}  variant="warning" />
        <StatCard title="Notifications"          value={String(unreadCount)}           icon={<Bell className="h-6 w-6" />}           variant="accent" />
      </div>
    </DashboardLayout>
  );
};

export const PharmacistProfile = () => (
  <DashboardLayout navItems={navItems} title="Profile"><ProfileForm /></DashboardLayout>
);
