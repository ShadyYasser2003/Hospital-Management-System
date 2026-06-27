import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/shared/StatCard';
import QuickAction from '@/components/shared/QuickAction';
import ProfileForm from '@/components/shared/ProfileForm';
import { useAuth } from '@/contexts/AuthContext';
import { usePatients } from '@/hooks/usePatients';
import { useAppointments } from '@/hooks/useAppointments';
import { receptionistNavItems } from '@/constants/receptionistNavItems';
import { Calendar, Users, Search, UserPlus, ClipboardCheck, LogOut, FileText } from 'lucide-react';

export const ReceptionistDashboard = () => {
  const { user } = useAuth();
  const { data: patients = [] } = usePatients();
  const { data: appointments = [] } = useAppointments();

  const today = new Date().toISOString().split('T')[0];

  const todayAppointments = appointments.filter((a) => a.appointmentDate?.startsWith(today));
  const pendingAppointments = appointments.filter((a) => a.status?.toUpperCase() === 'PENDING');
  const admittedPatients = patients.filter((p) => p.status?.toUpperCase() === 'ADMITTED');

  return (
    <DashboardLayout navItems={receptionistNavItems} title="Receptionist Dashboard">
      <h1 className="text-2xl font-bold mb-2">Welcome, {user?.name}!</h1>
      <p className="text-muted-foreground mb-8">Manage patient registrations and appointments</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Today's Appointments" value={String(todayAppointments.length)} icon={<Calendar className="h-6 w-6" />} variant="primary" />
        <StatCard title="Pending Appointments" value={String(pendingAppointments.length)} icon={<Calendar className="h-6 w-6" />} variant="accent" />
        <StatCard title="Total Patients" value={String(patients.length)} icon={<Users className="h-6 w-6" />} variant="success" />
        <StatCard title="Admitted Patients" value={String(admittedPatients.length)} icon={<ClipboardCheck className="h-6 w-6" />} variant="warning" />
      </div>

      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <QuickAction title="Register Patient" icon={<UserPlus className="h-5 w-5" />} to="/receptionist/register" />
        <QuickAction title="Search Patient" icon={<Search className="h-5 w-5" />} to="/receptionist/search" />
        <QuickAction title="Book Appointment" icon={<Calendar className="h-5 w-5" />} to="/receptionist/appointments" />
        <QuickAction title="Invoices" icon={<FileText className="h-5 w-5" />} to="/receptionist/invoices" />
      </div>
    </DashboardLayout>
  );
};

export const ReceptionistProfile = () => (
  <DashboardLayout navItems={receptionistNavItems} title="Profile">
    <ProfileForm />
  </DashboardLayout>
);
