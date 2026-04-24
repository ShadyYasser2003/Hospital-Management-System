import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope } from 'lucide-react';
import { adminNavItems } from '@/constants/adminNavItems';

const specialties = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology',
  'Gastroenterology', 'Oncology', 'Pulmonology', 'Nephrology', 'Endocrinology',
];

const AdminSpecialties = () => {
  return (
    <DashboardLayout navItems={adminNavItems} title="Specialties">
      <PageHeader title="Medical Specialties" description="Manage medical specialties" />
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {specialties.map((specialty) => (
          <Card key={specialty}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />
                {specialty}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Active specialty</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AdminSpecialties;
