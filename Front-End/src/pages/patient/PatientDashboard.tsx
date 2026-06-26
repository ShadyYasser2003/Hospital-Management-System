import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/shared/StatCard';
import QuickAction from '@/components/shared/QuickAction';
import ProfileForm from '@/components/shared/ProfileForm';
import { useAuth } from '@/contexts/AuthContext';
import { usePatients } from '@/hooks/usePatients';
import { useAppointmentsByPatient } from '@/hooks/useAppointments';
import { usePrescriptionsByPatient } from '@/hooks/usePrescriptions';
import { useUnreadCount } from '@/hooks/useNotifications';
import { useInvoicesByPatient } from '@/hooks/useInvoices';
import { LayoutDashboard, Calendar, Bell, Pill, User, ClipboardList, Receipt } from 'lucide-react';

const navItems = [
  { label: 'Dashboard',      path: '/patient',               icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Appointments',   path: '/patient/appointments',  icon: <Calendar className="h-5 w-5" /> },
  { label: 'Prescriptions',  path: '/patient/prescriptions', icon: <Pill className="h-5 w-5" /> },
  { label: 'Medical History',path: '/patient/history',       icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'Billing',        path: '/patient/billing',       icon: <Receipt className="h-5 w-5" /> },
  { label: 'Notifications',  path: '/patient/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'Profile',        path: '/patient/profile',       icon: <User className="h-5 w-5" /> },
];

export const PatientDashboard = () => {
  const { user } = useAuth();
  const { data: patients = [] } = usePatients();
  const patient = patients.find(p => String(p.id) === user?.id || p.nationalId === user?.nationalId);

  const { data: appointments = [] }  = useAppointmentsByPatient(patient?.id);
  const { data: prescriptions = [] } = usePrescriptionsByPatient(patient?.id);
  const { data: unreadCount = 0 }    = useUnreadCount(user?.id);
  const { data: invoices = [] }      = useInvoicesByPatient(patient?.id);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = appointments.filter(a =>
    a.appointmentDate >= today && !['CANCELLED', 'COMPLETED'].includes(a.status?.toUpperCase()),
  );
  const activePrescriptions = prescriptions.filter(p => p.status?.toUpperCase() === 'PENDING');
  const pendingBalance = invoices
    .filter(i => ['PENDING', 'PARTIAL'].includes(i.status?.toUpperCase()))
    .reduce((s, i) => s + (i.balance ?? 0), 0);

  return (
    <DashboardLayout navItems={navItems} title="Patient Portal">
      <h1 className="text-2xl font-bold mb-2">Welcome, {user?.name}!</h1>
      <p className="text-muted-foreground mb-8">View your health information and appointments</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Upcoming Appointments" value={String(upcoming.length)}           icon={<Calendar className="h-6 w-6" />} variant="primary" />
        <StatCard title="Active Prescriptions"  value={String(activePrescriptions.length)} icon={<Pill className="h-6 w-6" />}    variant="accent" />
        <StatCard title="Notifications"         value={String(unreadCount)}               icon={<Bell className="h-6 w-6" />}    variant="warning" />
        <StatCard title="Balance Due"           value={`$${pendingBalance.toFixed(2)}`}   icon={<Receipt className="h-6 w-6" />} variant="success" />
      </div>
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <QuickAction title="View Appointments"  icon={<Calendar className="h-5 w-5" />}     to="/patient/appointments" />
        <QuickAction title="My Prescriptions"   icon={<Pill className="h-5 w-5" />}         to="/patient/prescriptions" />
        <QuickAction title="Medical History"    icon={<ClipboardList className="h-5 w-5" />} to="/patient/history" />
        <QuickAction title="Billing & Payments" icon={<Receipt className="h-5 w-5" />}       to="/patient/billing" />
      </div>
    </DashboardLayout>
  );
};

export const PatientProfile = () => (
  <DashboardLayout navItems={navItems} title="Profile"><ProfileForm /></DashboardLayout>
);
