import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/shared/StatCard';
import QuickAction from '@/components/shared/QuickAction';
import ProfileForm from '@/components/shared/ProfileForm';
import { useAuth } from '@/contexts/AuthContext';
import { useAppointmentsByDoctor } from '@/hooks/useAppointments';
import { usePrescriptionsByDoctor } from '@/hooks/usePrescriptions';
import { useTestRequestsByDoctor } from '@/hooks/useTestRequests';
import { useUnreadCount } from '@/hooks/useNotifications';
import { usePatients } from '@/hooks/usePatients';
import { LayoutDashboard, Calendar, Users, FileText, Pill, ClipboardList, User, Bed, TestTube, Bell } from 'lucide-react';

export const doctorNavItems = [
  { label: 'Dashboard',      path: '/doctor',               icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Patients',       path: '/doctor/patients',      icon: <Users className="h-5 w-5" /> },
  { label: 'Appointments',   path: '/doctor/appointments',  icon: <Calendar className="h-5 w-5" /> },
  { label: 'Prescriptions',  path: '/doctor/prescriptions', icon: <Pill className="h-5 w-5" /> },
  { label: 'Test Requests',  path: '/doctor/tests',         icon: <TestTube className="h-5 w-5" /> },
  { label: 'Admissions',     path: '/doctor/admissions',    icon: <Bed className="h-5 w-5" /> },
  { label: 'Medical Reports',path: '/doctor/reports',       icon: <FileText className="h-5 w-5" /> },
  { label: 'Notifications',  path: '/doctor/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'Profile',        path: '/doctor/profile',       icon: <User className="h-5 w-5" /> },
];

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  const { data: appointments = [] }  = useAppointmentsByDoctor(user?.id);
  const { data: prescriptions = [] } = usePrescriptionsByDoctor(user?.id);
  const { data: tests = [] }         = useTestRequestsByDoctor(user?.id);
  const { data: patients = [] }      = usePatients();
  const { data: unreadCount = 0 }    = useUnreadCount(user?.id);

  const todayAppts   = appointments.filter(a => a.appointmentDate === today);
  const pendingAppts = appointments.filter(a => a.status?.toUpperCase() === 'PENDING');
  const todayRx      = prescriptions.filter(p => p.prescriptionDate === today);

  return (
    <DashboardLayout navItems={doctorNavItems} title="Doctor Dashboard">
      <h1 className="text-2xl font-bold mb-2">Welcome, Dr. {user?.name}!</h1>
      <p className="text-muted-foreground mb-8">Manage your patients and appointments</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Today's Appointments" value={String(todayAppts.length)}   icon={<Calendar className="h-6 w-6" />}     variant="primary" />
        <StatCard title="Total Patients"       value={String(patients.length)}     icon={<Users className="h-6 w-6" />}        variant="accent" />
        <StatCard title="Pending Requests"     value={String(pendingAppts.length)} icon={<ClipboardList className="h-6 w-6" />} variant="warning" />
        <StatCard title="Prescriptions Today"  value={String(todayRx.length)}      icon={<Pill className="h-6 w-6" />}         variant="success" />
        <StatCard title="Notifications"        value={String(unreadCount)}         icon={<Bell className="h-6 w-6" />}         variant="primary" />
      </div>
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <QuickAction title="View Patients"     icon={<Users className="h-5 w-5" />}    to="/doctor/patients" />
        <QuickAction title="Appointments"      icon={<Calendar className="h-5 w-5" />} to="/doctor/appointments" />
        <QuickAction title="Write Prescription"icon={<Pill className="h-5 w-5" />}     to="/doctor/prescriptions" />
        <QuickAction title="Request Tests"     icon={<TestTube className="h-5 w-5" />} to="/doctor/tests" />
      </div>
    </DashboardLayout>
  );
};

export const DoctorProfile = () => (
  <DashboardLayout navItems={doctorNavItems} title="Profile"><ProfileForm /></DashboardLayout>
);
