import {
  LayoutDashboard, Building, Building2, Users, Stethoscope, FileText,
  Calendar, ClipboardList, Bed, Pill, User, BarChart2, Droplets, Bell,
} from 'lucide-react';
import React from 'react';

export const adminNavItems = [
  { label: 'Dashboard',           path: '/admin',                   icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Departments',         path: '/admin/departments',       icon: <Building className="h-5 w-5" /> },
  { label: 'User Accounts',       path: '/admin/users',             icon: <Users className="h-5 w-5" /> },
  { label: 'Medical Specialties', path: '/admin/specialties',       icon: <Stethoscope className="h-5 w-5" /> },
  { label: 'Appointments',        path: '/admin/appointments',      icon: <Calendar className="h-5 w-5" /> },
  { label: 'Patient Transactions',path: '/admin/transactions',      icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'Beds & Wards',        path: '/admin/beds',              icon: <Bed className="h-5 w-5" /> },
  { label: 'Medicine Stock',      path: '/admin/medicines',         icon: <Pill className="h-5 w-5" /> },
  { label: 'Blood Bank',          path: '/admin/blood-bank',        icon: <Droplets className="h-5 w-5" /> },
  { label: 'Diagnosis Reports',   path: '/admin/diagnosis',         icon: <FileText className="h-5 w-5" /> },
  { label: 'External Hospitals',  path: '/admin/hospitals',         icon: <Building2 className="h-5 w-5" /> },
  { label: 'Analytics',           path: '/admin/analytics',         icon: <BarChart2 className="h-5 w-5" /> },
  { label: 'Notifications',       path: '/admin/notifications',     icon: <Bell className="h-5 w-5" /> },
  { label: 'Profile',             path: '/admin/profile',           icon: <User className="h-5 w-5" /> },
];
