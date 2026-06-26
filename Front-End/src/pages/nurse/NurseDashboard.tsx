import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/shared/StatCard';
import ProfileForm from '@/components/shared/ProfileForm';
import { useAuth } from '@/contexts/AuthContext';
import { usePatients } from '@/hooks/usePatients';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import { useUnreadCount } from '@/hooks/useNotifications';
import { Users, Pill, CheckCircle2, Bell } from 'lucide-react';
import { nurseNavItems } from '@/constants/nurseNavItems';

export const NurseDashboard = () => {
  const { user } = useAuth();
  const { data: patients = [] }      = usePatients();
  const { data: prescriptions = [] } = usePrescriptions();
  const { data: unreadCount = 0 }    = useUnreadCount(user?.id);

  const admittedPatients   = patients.filter(p => p.status?.toUpperCase() === 'ADMITTED');
  const pendingMedications = prescriptions.filter(p => p.status?.toUpperCase() === 'PENDING');

  return (
    <DashboardLayout navItems={nurseNavItems} title="Nurse Dashboard">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
        <p className="text-muted-foreground">Manage patient care and medication administration</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Admitted Patients"  value={String(admittedPatients.length)}   icon={<Users className="h-6 w-6" />}        variant="primary" />
        <StatCard title="Pending Medications" value={String(pendingMedications.length)} icon={<Pill className="h-6 w-6" />}         variant="warning" />
        <StatCard title="Total Prescriptions" value={String(prescriptions.length)}      icon={<CheckCircle2 className="h-6 w-6" />} variant="success" />
        <StatCard title="Notifications"       value={String(unreadCount)}               icon={<Bell className="h-6 w-6" />}         variant="accent" />
      </div>
    </DashboardLayout>
  );
};

export const NurseProfile = () => (
  <DashboardLayout navItems={nurseNavItems} title="Profile">
    <ProfileForm />
  </DashboardLayout>
);
