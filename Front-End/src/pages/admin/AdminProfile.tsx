import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProfileForm from '@/components/shared/ProfileForm';
import { adminNavItems } from '@/constants/adminNavItems';

const AdminProfile = () => {
  return (
    <DashboardLayout navItems={adminNavItems} title="Profile">
      <ProfileForm />
    </DashboardLayout>
  );
};

export default AdminProfile;
