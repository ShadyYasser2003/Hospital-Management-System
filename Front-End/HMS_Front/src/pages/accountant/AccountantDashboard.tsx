import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/shared/StatCard';
import ProfileForm from '@/components/shared/ProfileForm';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import AnalyticsDashboard from '@/components/shared/AnalyticsDashboard';
import { LayoutDashboard, FileText, DollarSign, CreditCard, User, Clock, Bell } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/accountant', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Invoices', path: '/accountant/invoices', icon: <FileText className="h-5 w-5" /> },
  { label: 'Payments', path: '/accountant/payments', icon: <CreditCard className="h-5 w-5" /> },
  { label: 'Profile', path: '/accountant/profile', icon: <User className="h-5 w-5" /> },
];

export const AccountantDashboard = () => {
  const { user } = useAuth();
  const { invoices, payments, pharmacyCharges, labCharges, notifications } = useData();
  
  const today = new Date().toISOString().split('T')[0];
  const todayRevenue = payments.filter(p => p.date === today).reduce((sum, p) => sum + p.amount, 0);
  const pendingInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'partial');
  const pendingCharges = [...pharmacyCharges, ...labCharges].filter(c => c.status === 'pending' || c.status === 'sent');
  const unreadNotifications = notifications.filter(n => (n.userId === user?.id || n.role === user?.role) && !n.read);

  return (
    <DashboardLayout navItems={navItems} title="Accountant Dashboard">
      <h1 className="text-2xl font-bold mb-2">Welcome, {user?.name}!</h1>
      <p className="text-muted-foreground mb-8">Manage billing and payments</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Today's Revenue" value={`$${todayRevenue.toLocaleString()}`} icon={<DollarSign className="h-6 w-6" />} variant="success" />
        <StatCard title="Pending Invoices" value={String(pendingInvoices.length)} icon={<FileText className="h-6 w-6" />} variant="warning" />
        <StatCard title="Pending Charges" value={String(pendingCharges.length)} icon={<Clock className="h-6 w-6" />} variant="primary" />
        <StatCard title="Payments Today" value={String(payments.filter(p => p.date === today).length)} icon={<CreditCard className="h-6 w-6" />} variant="accent" />
        <StatCard title="Notifications" value={String(unreadNotifications.length)} icon={<Bell className="h-6 w-6" />} variant="primary" />
      </div>

      <AnalyticsDashboard role="accountant" />
    </DashboardLayout>
  );
};

export const AccountantProfile = () => (
  <DashboardLayout navItems={navItems} title="Profile"><ProfileForm /></DashboardLayout>
);
