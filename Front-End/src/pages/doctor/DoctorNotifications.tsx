import React from 'react';
import NotificationsPage from '@/pages/shared/NotificationsPage';
import { LayoutDashboard, Users, Calendar, FileText, FlaskConical, Bell, User } from 'lucide-react';

const navItems = [
  { label: 'Dashboard',     path: '/doctor',               icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Patients',      path: '/doctor/patients',      icon: <Users className="h-5 w-5" /> },
  { label: 'Appointments',  path: '/doctor/appointments',  icon: <Calendar className="h-5 w-5" /> },
  { label: 'Prescriptions', path: '/doctor/prescriptions', icon: <FileText className="h-5 w-5" /> },
  { label: 'Tests',         path: '/doctor/tests',         icon: <FlaskConical className="h-5 w-5" /> },
  { label: 'Notifications', path: '/doctor/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'Profile',       path: '/doctor/profile',       icon: <User className="h-5 w-5" /> },
];

const DoctorNotifications = () => <NotificationsPage navItems={navItems} />;

export default DoctorNotifications;
