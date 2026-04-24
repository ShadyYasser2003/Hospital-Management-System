import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/shared/StatCard';
import ProfileForm from '@/components/shared/ProfileForm';
import AnalyticsDashboard from '@/components/shared/AnalyticsDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Users, Pill, CheckCircle2, Bell } from 'lucide-react';
import { nurseNavItems } from '@/constants/nurseNavItems';

export const NurseDashboard = () => {
  const { user } = useAuth();
  const { patients, prescriptions, medicationAdministrations, notifications } = useData();

  const admittedPatients   = patients.filter(p => p.status === 'admitted');
  const pendingMedications = prescriptions.filter(p => p.status === 'dispensed');
  const today              = new Date().toISOString().split('T')[0];
  const completedToday     = medicationAdministrations.filter(m => m.administeredAt.startsWith(today));
  const unreadNotifications = notifications.filter(n => (n.userId === user?.id || n.role === user?.role) && !n.read);

  return (
    <DashboardLayout navItems={nurseNavItems} title="Nurse Dashboard">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
        <p className="text-muted-foreground">Manage patient care and medication administration</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
        <StatCard
          title="Admitted Patients"
          value={String(admittedPatients.length)}
          icon={<Users className="h-6 w-6" />}
          variant="primary"
        />
        <StatCard
          title="Pending Medications"
          value={String(pendingMedications.length)}
          icon={<Pill className="h-6 w-6" />}
          variant="warning"
        />
        <StatCard
          title="Administered Today"
          value={String(completedToday.length)}
          icon={<CheckCircle2 className="h-6 w-6" />}
          variant="success"
        />
        <StatCard
          title="Notifications"
          value={String(unreadNotifications.length)}
          icon={<Bell className="h-6 w-6" />}
          variant="accent"
        />
      </div>

      <AnalyticsDashboard role="nurse" />
    </DashboardLayout>
  );
};

export const NurseProfile = () => (
  <DashboardLayout navItems={nurseNavItems} title="Profile">
    <ProfileForm />
  </DashboardLayout>
);
