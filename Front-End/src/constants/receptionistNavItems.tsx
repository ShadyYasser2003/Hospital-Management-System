import React from 'react';
import { LayoutDashboard, UserPlus, Search, Calendar, LogOut, Bell, User, FileText } from 'lucide-react';

export const receptionistNavItems = [
  { label: 'Dashboard',        path: '/receptionist',              icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Register Patient', path: '/receptionist/register',     icon: <UserPlus className="h-5 w-5" /> },
  { label: 'Search Patient',   path: '/receptionist/search',       icon: <Search className="h-5 w-5" /> },
  { label: 'Appointments',     path: '/receptionist/appointments', icon: <Calendar className="h-5 w-5" /> },
  { label: 'Check Out',        path: '/receptionist/checkout',     icon: <LogOut className="h-5 w-5" /> },
  { label: 'Invoices',         path: '/receptionist/invoices',     icon: <FileText className="h-5 w-5" /> },
  { label: 'Notifications',    path: '/receptionist/notifications',icon: <Bell className="h-5 w-5" /> },
  { label: 'Profile',          path: '/receptionist/profile',      icon: <User className="h-5 w-5" /> },
];
