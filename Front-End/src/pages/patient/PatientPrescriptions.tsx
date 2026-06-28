import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useMyPatientProfile } from '@/hooks/usePatients';
import { usePrescriptionsByPatient } from '@/hooks/usePrescriptions';
import { LayoutDashboard, Calendar, Pill, Bell, User, ClipboardList, AlertCircle } from 'lucide-react';
import { PrescriptionDto } from '@/services/prescriptionService';

const navItems = [
  { label: 'Dashboard', path: '/patient', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Appointments', path: '/patient/appointments', icon: <Calendar className="h-5 w-5" /> },
  { label: 'Prescriptions', path: '/patient/prescriptions', icon: <Pill className="h-5 w-5" /> },
  { label: 'Medical History', path: '/patient/history', icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'Notifications', path: '/patient/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'Profile', path: '/patient/profile', icon: <User className="h-5 w-5" /> },
];

const PatientPrescriptions = () => {
  const { user } = useAuth();
  const { data: patient } = useMyPatientProfile();

  const { data: prescriptions = [], isLoading, error } = usePrescriptionsByPatient(patient?.id);

  return (
    <DashboardLayout navItems={navItems} title="My Prescriptions">
      <PageHeader title="My Prescriptions" description="View your medication prescriptions" />

      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error instanceof Error ? error.message : 'Failed to load prescriptions'}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && (
        <div className="space-y-4">
          {prescriptions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">No prescriptions found</CardContent>
            </Card>
          ) : (
            prescriptions.map((prescription: PrescriptionDto) => (
              <Card key={prescription.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Prescription #{prescription.id}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        By {prescription.doctorName} on {prescription.prescriptionDate}
                      </p>
                    </div>
                    <StatusBadge status={prescription.status?.toLowerCase() as never} />
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="font-medium mb-2">Medications</h4>
                  <div className="space-y-2">
                    {prescription.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{item.medicineName}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.dosage} • {item.frequency} • {item.duration} days
                          </p>
                          {item.instructions && <p className="text-xs text-muted-foreground">{item.instructions}</p>}
                        </div>
                        <span className="text-sm">Qty: {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  {prescription.notes && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <p className="text-sm"><strong>Notes:</strong> {prescription.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientPrescriptions;
