import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { usePatients } from '@/hooks/usePatients';
import { useLabTestsByPatient } from '@/hooks/useLabTests';
import { useRadiologyOrdersByPatient } from '@/hooks/useRadiologyOrders';
import { useAppointmentsByPatient } from '@/hooks/useAppointments';
import { usePrescriptionsByPatient } from '@/hooks/usePrescriptions';
import { useBloodRequestsByPatient } from '@/hooks/useBloodBank';
import { fmtBloodType, fmtUrgency, fmtDateTime, urgencyColor } from '@/lib/bloodBankUtils';
import StatusBadge from '@/components/shared/StatusBadge';
import { LayoutDashboard, Calendar, Pill, Bell, User, ClipboardList, TestTube, Receipt, Droplets } from 'lucide-react';

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

  const { data: labTests = [],    isLoading: loadingLab }   = useLabTestsByPatient(patient?.id);
  const { data: radOrders = [],   isLoading: loadingRad }   = useRadiologyOrdersByPatient(patient?.id);
  const { data: appointments = [], isLoading: loadingAppts }  = useAppointmentsByPatient(patient?.id);
  const { data: prescriptions = [], isLoading: loadingRx }    = usePrescriptionsByPatient(patient?.id);
  const { data: bloodRequests = [], isLoading: loadingBlood } = useBloodRequestsByPatient(patient?.id);

  const completedLabs  = labTests.filter(t => t.status?.toUpperCase() === 'COMPLETED');
  const completedRad   = radOrders.filter(r => r.status?.toUpperCase() === 'COMPLETED');
  const completedAppts = appointments.filter(a => a.status?.toUpperCase() === 'COMPLETED');
  const isLoading = loadingLab || loadingRad || loadingAppts || loadingRx || loadingBlood;

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
        <Tabs defaultValue="lab">
          <TabsList>
            <TabsTrigger value="lab">Lab Results ({completedLabs.length})</TabsTrigger>
            <TabsTrigger value="radiology">Radiology ({completedRad.length})</TabsTrigger>
            <TabsTrigger value="appointments">Past Appointments ({completedAppts.length})</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions ({prescriptions.length})</TabsTrigger>
            <TabsTrigger value="blood">Blood Requests ({bloodRequests.length})</TabsTrigger>
          </TabsList>

          {/* ── Lab Results ── */}
          <TabsContent value="lab" className="space-y-4">
            {completedLabs.length === 0
              ? <Card><CardContent className="p-8 text-center text-muted-foreground">No lab results yet</CardContent></Card>
              : completedLabs.map(t => (
                <Card key={t.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg"><TestTube className="h-5 w-5 text-primary" /></div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{t.testType}</h4>
                          <span className="text-sm text-muted-foreground">{t.completedAt?.slice(0, 10)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Requested by {t.doctorName}</p>
                        {t.technicianName && (
                          <p className="text-xs text-muted-foreground">Performed by {t.technicianName}</p>
                        )}
                        {t.result && (
                          <p className="mt-2 text-sm bg-muted p-2 rounded">{t.result}</p>
                        )}
                        {t.referenceRange && (
                          <p className="text-xs text-muted-foreground mt-1">Reference: {t.referenceRange}</p>
                        )}
                        {t.isCritical && (
                          <span className="inline-block mt-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                            ⚠ Critical
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            }
          </TabsContent>

          {/* ── Radiology Orders ── */}
          <TabsContent value="radiology" className="space-y-4">
            {completedRad.length === 0
              ? <Card><CardContent className="p-8 text-center text-muted-foreground">No radiology reports yet</CardContent></Card>
              : completedRad.map(r => (
                <Card key={r.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <TestTube className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{r.orderType}{r.bodyPart ? ` — ${r.bodyPart}` : ''}</h4>
                          <span className="text-sm text-muted-foreground">{r.completedAt?.slice(0, 10)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Ordered by {r.doctorName}</p>
                        {r.technicianName && (
                          <p className="text-xs text-muted-foreground">Performed by {r.technicianName}</p>
                        )}
                        {r.reportFindings && (
                          <p className="mt-2 text-sm bg-muted p-2 rounded">{r.reportFindings}</p>
                        )}
                        {r.impression && (
                          <p className="text-xs text-muted-foreground mt-1 italic">Impression: {r.impression}</p>
                        )}
                        {r.isCritical && (
                          <span className="inline-block mt-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                            ⚠ Critical
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            }
          </TabsContent>

          {/* ── Past Appointments ── */}
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

          {/* ── Prescriptions ── */}
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

          {/* ── Blood Requests ── */}
          <TabsContent value="blood" className="space-y-4">
            {bloodRequests.length === 0
              ? <Card><CardContent className="p-8 text-center text-muted-foreground">No blood requests</CardContent></Card>
              : bloodRequests.map(r => (
                <Card key={r.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-red-50 rounded-lg"><Droplets className="h-5 w-5 text-red-600" /></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">
                              <span className="text-red-600 font-bold">{fmtBloodType(r.bloodType)}</span>
                              <span className="text-muted-foreground"> · {r.quantity} unit{r.quantity > 1 ? 's' : ''}</span>
                            </h4>
                            <p className="text-sm text-muted-foreground">Requested by {r.requestedByName}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <StatusBadge status={r.status?.toLowerCase()} />
                            <span className={`text-xs font-medium px-2 py-0.5 rounded border ${urgencyColor(r.urgency)}`}>
                              {fmtUrgency(r.urgency)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground flex gap-4">
                          <span>Requested: {fmtDateTime(r.createdAt)}</span>
                          {r.fulfilledAt && <span>Fulfilled: {fmtDateTime(r.fulfilledAt)}</span>}
                        </div>
                        {r.notes && <p className="mt-2 text-sm bg-muted p-2 rounded">{r.notes}</p>}
                      </div>
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
