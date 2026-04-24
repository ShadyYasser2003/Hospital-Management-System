import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Calendar, Pill, Bell, User, ClipboardList, Activity, Bed, TestTube } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/patient', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Appointments', path: '/patient/appointments', icon: <Calendar className="h-5 w-5" /> },
  { label: 'Prescriptions', path: '/patient/prescriptions', icon: <Pill className="h-5 w-5" /> },
  { label: 'Medical History', path: '/patient/history', icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'Notifications', path: '/patient/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'Profile', path: '/patient/profile', icon: <User className="h-5 w-5" /> },
];

const PatientHistory = () => {
  const { user } = useAuth();
  const { patients, medicalReports, admissionRequests, testRequests } = useData();

  const patient = patients.find(p => p.userId === user?.id);
  const myReports = patient ? medicalReports.filter(r => r.patientId === patient.id) : [];
  const operationReports = myReports.filter(r => r.type === 'operation');
  const diagnosisReports = myReports.filter(r => r.type === 'diagnosis');
  const myAdmissions = patient ? admissionRequests.filter(a => a.patientId === patient.id && a.status === 'approved') : [];
  const myTestResults = patient ? testRequests.filter(t => t.patientId === patient.id && t.status === 'completed') : [];

  return (
    <DashboardLayout navItems={navItems} title="Medical History">
      <PageHeader title="Medical History" description="View your complete medical history" />

      {patient && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Blood Type</p>
                <p className="font-medium">{patient.bloodType || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Allergies</p>
                <p className="font-medium">{patient.allergies.length > 0 ? patient.allergies.join(', ') : 'None'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Medical Conditions</p>
                <p className="font-medium">{patient.medicalHistory.length > 0 ? patient.medicalHistory.join(', ') : 'None'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{patient.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="diagnosis">
        <TabsList>
          <TabsTrigger value="diagnosis">Diagnosis Reports</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="admissions">Admissions</TabsTrigger>
          <TabsTrigger value="tests">Lab Results ({myTestResults.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tests">
          <div className="space-y-4">
            {myTestResults.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No lab results available
                </CardContent>
              </Card>
            ) : (
              myTestResults.map(test => (
                <Card key={test.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <TestTube className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{test.testType}</h4>
                          <span className="text-sm text-muted-foreground">{test.completedDate}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Requested by {test.doctorName}</p>
                        {test.results && <p className="mt-2 text-sm">{test.results}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="diagnosis">
          <div className="space-y-4">
            {diagnosisReports.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No diagnosis reports
                </CardContent>
              </Card>
            ) : (
              diagnosisReports.map(report => (
                <Card key={report.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <ClipboardList className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">Diagnosis Report</h4>
                          <span className="text-sm text-muted-foreground">{report.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">By {report.doctorName}</p>
                        <p className="mt-2 text-sm">{report.findings}</p>
                        {report.recommendations && (
                          <p className="mt-1 text-sm text-primary">{report.recommendations}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="operations">
          <div className="space-y-4">
            {operationReports.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No operation history
                </CardContent>
              </Card>
            ) : (
              operationReports.map(report => (
                <Card key={report.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <Activity className="h-5 w-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">Operation Report</h4>
                          <span className="text-sm text-muted-foreground">{report.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">By {report.doctorName}</p>
                        <p className="mt-2 text-sm">{report.findings}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="admissions">
          <div className="space-y-4">
            {myAdmissions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No admission history
                </CardContent>
              </Card>
            ) : (
              myAdmissions.map(admission => (
                <Card key={admission.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-success/10 rounded-lg">
                        <Bed className="h-5 w-5 text-success" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">Hospital Admission</h4>
                          <span className="text-sm text-muted-foreground">{admission.requestDate}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">By {admission.doctorName}</p>
                        <p className="mt-2 text-sm">{admission.reason}</p>
                        {admission.wardPreference && (
                          <p className="text-sm text-primary">Ward: {admission.wardPreference}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default PatientHistory;
