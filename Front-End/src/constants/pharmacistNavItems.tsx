import React from 'react';
import { LayoutDashboard, Package, FileText, Pill, Bell, User } from 'lucide-react';

export const pharmacistNavItems = [
  { label: 'Dashboard',     path: '/pharmacist',               icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Inventory',     path: '/pharmacist/inventory',     icon: <Package className="h-5 w-5" /> },
  { label: 'Prescriptions', path: '/pharmacist/prescriptions', icon: <FileText className="h-5 w-5" /> },
  { label: 'Dispense',      path: '/pharmacist/dispense',      icon: <Pill className="h-5 w-5" /> },
  { label: 'Notifications', path: '/pharmacist/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'Profile',       path: '/pharmacist/profile',       icon: <User className="h-5 w-5" /> },
];
