import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { adminNavItems } from '@/constants/adminNavItems';

const operations = [
  { id: '1', patient: 'Jane Doe', surgery: 'Appendectomy', surgeon: 'Dr. Wilson', date: '2024-12-15', status: 'Completed' },
  { id: '2', patient: 'Bob Martin', surgery: 'Knee Replacement', surgeon: 'Dr. Brown', date: '2024-12-18', status: 'Completed' },
];

const AdminOperations = () => {
  return (
    <DashboardLayout navItems={adminNavItems} title="Operations">
      <PageHeader title="Operation Reports" description="View all surgical operation reports" />
      <div className="space-y-4">
        {operations.map((op) => (
          <Card key={op.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-success/10 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-medium">{op.surgery}</h3>
                  <p className="text-sm text-muted-foreground">Patient: {op.patient} • Surgeon: {op.surgeon}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{op.date}</p>
                <p className="text-sm text-success">{op.status}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AdminOperations;
