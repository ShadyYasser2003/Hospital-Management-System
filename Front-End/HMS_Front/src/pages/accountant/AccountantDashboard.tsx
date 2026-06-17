import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/shared/StatCard';
import ProfileForm from '@/components/shared/ProfileForm';
import { useAuth } from '@/contexts/AuthContext';
import { useInvoices, useInvoicesByStatus } from '@/hooks/useInvoices';
import { useUnreadCount } from '@/hooks/useNotifications';
import { LayoutDashboard, FileText, DollarSign, CreditCard, User, Clock, Bell } from 'lucide-react';

const navItems = [
  { label: 'Dashboard',     path: '/accountant',               icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Invoices',      path: '/accountant/invoices',      icon: <FileText className="h-5 w-5" /> },
  { label: 'Payments',      path: '/accountant/payments',      icon: <CreditCard className="h-5 w-5" /> },
  { label: 'Notifications', path: '/accountant/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'Profile',       path: '/accountant/profile',       icon: <User className="h-5 w-5" /> },
];

export const AccountantDashboard = () => {
  const { user } = useAuth();
  const { data: allPage }     = useInvoices();
  const { data: pending = [] } = useInvoicesByStatus('PENDING');
  const { data: partial = [] } = useInvoicesByStatus('PARTIAL');
  const { data: unreadCount = 0 } = useUnreadCount(user?.id);

  const allInvoices = allPage?.content ?? [];
  const today = new Date().toISOString().split('T')[0];

  // Sum of paidAmount on invoices updated today (approximation)
  const todayRevenue = allInvoices
    .filter(i => i.createdAt?.startsWith(today))
    .reduce((sum, i) => sum + (i.paidAmount ?? 0), 0);

  return (
    <DashboardLayout navItems={navItems} title="Accountant Dashboard">
      <h1 className="text-2xl font-bold mb-2">Welcome, {user?.name}!</h1>
      <p className="text-muted-foreground mb-8">Manage billing and payments</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Revenue"  value={`$${todayRevenue.toFixed(2)}`}          icon={<DollarSign className="h-6 w-6" />} variant="success" />
        <StatCard title="Pending Invoices" value={String(pending.length + partial.length)} icon={<FileText className="h-6 w-6" />}   variant="warning" />
        <StatCard title="Total Invoices"   value={String(allPage?.totalElements ?? 0)}     icon={<Clock className="h-6 w-6" />}      variant="primary" />
        <StatCard title="Notifications"    value={String(unreadCount)}                     icon={<Bell className="h-6 w-6" />}       variant="accent" />
      </div>
    </DashboardLayout>
  );
};

export const AccountantProfile = () => (
  <DashboardLayout navItems={navItems} title="Profile"><ProfileForm /></DashboardLayout>
);
