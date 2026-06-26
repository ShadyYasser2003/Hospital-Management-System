import React from 'react';
import NotificationsPage from '@/pages/shared/NotificationsPage';
import { LayoutDashboard, FileText, CreditCard, Bell, User } from 'lucide-react';

const navItems = [
  { label: 'Dashboard',     path: '/accountant',               icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Invoices',      path: '/accountant/invoices',      icon: <FileText className="h-5 w-5" /> },
  { label: 'Payments',      path: '/accountant/payments',      icon: <CreditCard className="h-5 w-5" /> },
  { label: 'Notifications', path: '/accountant/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'Profile',       path: '/accountant/profile',       icon: <User className="h-5 w-5" /> },
];

const AccountantNotifications = () => <NotificationsPage navItems={navItems} />;

export default AccountantNotifications;
