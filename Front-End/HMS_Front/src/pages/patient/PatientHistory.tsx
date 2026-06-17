import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { usePatients } from '@/hooks/usePatients';
import { useTestRequestsByPatient } from '@/hooks/useTestRequests';
import { useAppointmentsByPatient } from '@/hooks/useAppointments';
import { usePrescriptionsByPatient } from '@/hooks/usePrescriptions';
import { LayoutDashboard, Calendar, Pill, Bell, User, ClipboardList, TestTube, Receipt } from 'lucide-react';

const navItems = [
  { label: 'Dashboard',      path: '/patient',               icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Appointments',   path: '/patient/appointments',  icon: <Calendar className="h-5 w-5" /> },
  { label: 'Prescriptions',  path: '/patient/prescriptions', icon: <Pill className="h-5 w-5" /> },
  { label: 'Medical History',path: '/patient/history',       icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'Billing',        path: '/patient/billing',       icon: <Receipt className="h-5 w-5" /> },
  { label: 'Notifications',  path: '/patient/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'Profile',        path: '/patient/profile',       icon: <User className="h-5 w-5" /> },
];

const PatientHistory = () => {
  const { user } = useAuth();
  const { data: patients = [] } = usePatients();
  const patient = patients.find(p => String(p.id) === user?.id || p.nationalId === user?.nationalId);

  const { data: testResults = [], isLoading: loadingTests }   = useTestRequestsByPatient(patient?.id);
  const { data: appointments = [], isLoading: loadingAppts }  = useAppointmentsByPatient(patient?.id);
  const { data: prescriptions = [], isLoading: loadingRx }    = usePrescriptionsByPatient(patient?.id);

  const completedTests = testResults.filter(t => t.status?.toUpperCase() === 'COMPLETED');
  const completedAppts = appointments.filter(a => a.status?.toUpperCase() === 'COMPLETED');
  const isLoading = loadingTests || loadingAppts || loadingRx;

  return (
    <DashboardLayout navItems={navItems} title="Medical History">
      <PageHeader title="Medical History" description="Your complete medical history" />

      {patient && (
        <Card className="mb-6">
          <CardHeader><CardTitle>Patient Information</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><p className="text-muted-foreground">Blood Type</p><p className="font-medium">{patient.bloodType || '—'}</p></div>
              <div><p className="text-muted-foreground">Allergies</p><p className="font-medium">{patient.allergies || 'None'}</p></div>
              <div><p className="text-muted-foreground">Medical History</p><p className="font-medium">{patient.medicalHistory || 'None'}</p></div>
              <div><p className="text-muted-foreground">Status</p><p className="font-medium capitalize">{patient.status}</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>}

      {!isLoading && (
        <Tabs defaultValue="tests">
          <TabsList>
            <TabsTrigger value="tests">Lab Results ({completedTests.length})</TabsTrigger>
            <TabsTrigger value="appointments">Past Appointments ({completedAppts.length})</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions ({prescriptions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="tests" className="space-y-4">
            {completedTests.length === 0
              ? <Card><CardContent className="p-8 text-center text-muted-foreground">No lab results</CardContent></Card>
              : completedTests.map(t => (
                <Card key={t.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg"><TestTube className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{t.testType}</h4>
                          <span className="text-sm text-muted-foreground">{t.completedAt?.split('T')[0]}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Requested by {t.doctorName}</p>
                        {t.results && <p className="mt-2 text-sm bg-muted p-2 rounded">{t.results}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            }
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            {completedAppts.length === 0
              ? <Card><CardContent className="p-8 text-center text-muted-foreground">No past appointments</CardContent></Card>
              : completedAppts.map(a => (
                <Card key={a.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{a.doctorName}</p>
                        <p className="text-sm text-muted-foreground">{a.department}</p>
                        {a.notes && <p className="text-sm mt-1">{a.notes}</p>}
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{a.appointmentDate}</p>
                        <p>{a.appointmentTime?.substring(0, 5)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            }
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-4">
            {prescriptions.length === 0
              ? <Card><CardContent className="p-8 text-center text-muted-foreground">No prescriptions</CardContent></Card>
              : prescriptions.map(rx => (
                <Card key={rx.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between mb-2">
                      <p className="font-medium">Prescription #{rx.id}</p>
                      <span className="text-sm text-muted-foreground">{rx.prescriptionDate}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">By {rx.doctorName}</p>
                    <div className="space-y-1">
                      {rx.items?.map((item, idx) => (
                        <div key={idx} className="text-sm bg-muted px-3 py-1.5 rounded">
                          <span className="font-medium">{item.medicineName}</span>
                          <span className="text-muted-foreground ml-2">{item.dosage} • {item.frequency}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            }
          </TabsContent>
        </Tabs>
      )}
    </DashboardLayout>
  );
};

export default PatientHistory;
