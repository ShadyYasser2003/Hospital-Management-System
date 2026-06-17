import React from 'react';
import NotificationsPage from '@/pages/shared/NotificationsPage';
import { LayoutDashboard, ClipboardList, Upload, Bell, User } from 'lucide-react';

const navItems = [
  { label: 'Dashboard',     path: '/technician',          icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Test Requests', path: '/technician/requests', icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'Upload Reports',path: '/technician/upload',   icon: <Upload className="h-5 w-5" /> },
  { label: 'Notifications', path: '/technician/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'Profile',       path: '/technician/profile',  icon: <User className="h-5 w-5" /> },
];

const TechnicianNotifications = () => <NotificationsPage navItems={navItems} />;

export default TechnicianNotifications;
