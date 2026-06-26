import React from 'react';
import NotificationsPage from '@/pages/shared/NotificationsPage';
import { LayoutDashboard, Calendar, Pill, Bell, User, ClipboardList, Receipt } from 'lucide-react';

const navItems = [
  { label: 'Dashboard',      path: '/patient',               icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Appointments',   path: '/patient/appointments',  icon: <Calendar className="h-5 w-5" /> },
  { label: 'Prescriptions',  path: '/patient/prescriptions', icon: <Pill className="h-5 w-5" /> },
  { label: 'Medical History',path: '/patient/history',       icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'Billing',        path: '/patient/billing',       icon: <Receipt className="h-5 w-5" /> },
  { label: 'Notifications',  path: '/patient/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'Profile',        path: '/patient/profile',       icon: <User className="h-5 w-5" /> },
];

const PatientNotifications = () => <NotificationsPage navItems={navItems} />;

export default PatientNotifications;
