import React from 'react';
import { LayoutDashboard, Users, Pill, User } from 'lucide-react';

export const nurseNavItems = [
  { label: 'Dashboard',   path: '/nurse',              icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Patients',    path: '/nurse/patients',     icon: <Users className="h-5 w-5" /> },
  { label: 'Medications', path: '/nurse/medications',  icon: <Pill className="h-5 w-5" /> },
  { label: 'Profile',     path: '/nurse/profile',      icon: <User className="h-5 w-5" /> },
];
