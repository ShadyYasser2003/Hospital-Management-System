import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/shared/StatCard';
import ProfileForm from '@/components/shared/ProfileForm';
import { useAuth } from '@/contexts/AuthContext';
import { useTestRequestsByTechnician, useTestRequestsByStatus } from '@/hooks/useTestRequests';
import { useUnreadCount } from '@/hooks/useNotifications';
import { LayoutDashboard, FileText, ClipboardList, Upload, User, Clock, Bell, Inbox } from 'lucide-react';

const navItems = [
  { label: 'Dashboard',     path: '/technician',               icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Test Requests', path: '/technician/requests',      icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'Upload Reports',path: '/technician/upload',        icon: <Upload className="h-5 w-5" /> },
  { label: 'Notifications', path: '/technician/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'Profile',       path: '/technician/profile',       icon: <User className="h-5 w-5" /> },
];

export const TechnicianDashboard = () => {
  const { user } = useAuth();
  const { data: techPage }          = useTestRequestsByTechnician(user?.id);
  const { data: available = [] }    = useTestRequestsByStatus('PENDING');
  const { data: unreadCount = 0 }   = useUnreadCount(user?.id);

  const tests = techPage?.content ?? [];
  const today = new Date().toISOString().split('T')[0];

  const inProgress     = tests.filter(t => ['ACKNOWLEDGED', 'IN_PROGRESS'].includes(t.status?.toUpperCase()));
  const completedToday = tests.filter(t => t.status?.toUpperCase() === 'COMPLETED' && t.completedAt?.startsWith(today));

  return (
    <DashboardLayout navItems={navItems} title="Technician Dashboard">
      <h1 className="text-2xl font-bold mb-2">Welcome, {user?.name}!</h1>
      <p className="text-muted-foreground mb-8">Manage diagnostic tests and reports</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Available Requests" value={String(available.length)}        icon={<Inbox className="h-6 w-6" />}        variant="warning" />
        <StatCard title="In Progress"        value={String(inProgress.length)}       icon={<Clock className="h-6 w-6" />}        variant="primary" />
        <StatCard title="Completed Today"    value={String(completedToday.length)}   icon={<FileText className="h-6 w-6" />}     variant="success" />
        <StatCard title="Notifications"      value={String(unreadCount)}             icon={<Bell className="h-6 w-6" />}         variant="accent" />
      </div>
    </DashboardLayout>
  );
};

export const TechnicianProfile = () => (
  <DashboardLayout navItems={navItems} title="Profile"><ProfileForm /></DashboardLayout>
);
