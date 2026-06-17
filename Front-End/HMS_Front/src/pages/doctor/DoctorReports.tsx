import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { doctorNavItems } from './DoctorDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { usePatients } from '@/hooks/usePatients';
import { useTestRequestsByDoctor } from '@/hooks/useTestRequests';
import { usePrescriptionsByDoctor } from '@/hooks/usePrescriptions';
import { TestRequestDto } from '@/services/testRequestService';
import { PrescriptionDto } from '@/services/prescriptionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, FileText, TestTube, Pill } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';

const DoctorReports = () => {
  const { user } = useAuth();
  const { data: tests = [], isLoading: loadingTests }   = useTestRequestsByDoctor(user?.id);
  const { data: rxList = [], isLoading: loadingRx }     = usePrescriptionsByDoctor(user?.id);

  const [selectedTest, setSelectedTest] = useState<TestRequestDto | null>(null);
  const [selectedRx, setSelectedRx]     = useState<PrescriptionDto | null>(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [rxDialogOpen, setRxDialogOpen]     = useState(false);

  const completedTests = tests.filter(t => t.status?.toUpperCase() === 'COMPLETED');

  const testCols = [
    { key: 'patientName', header: 'Patient' },
    { key: 'testType',    header: 'Test Type' },
    { key: 'completedAt', header: 'Completed', render: (t: TestRequestDto) => t.completedAt?.split('T')[0] ?? '—' },
    { key: 'charges',     header: 'Charges',   render: (t: TestRequestDto) => t.charges ? `$${t.charges}` : '—' },
    { key: 'actions', header: 'Actions', render: (t: TestRequestDto) => (
      <Button variant="ghost" size="sm" onClick={() => { setSelectedTest(t); setTestDialogOpen(true); }}>
        <Eye className="h-4 w-4" />
      </Button>
    )},
  ];

  const rxCols = [
    { key: 'patientName',      header: 'Patient' },
    { key: 'prescriptionDate', header: 'Date' },
    { key: 'items', header: 'Medications', render: (p: PrescriptionDto) => `${p.items?.length ?? 0} item(s)` },
    { key: 'status', header: 'Status', render: (p: PrescriptionDto) => <StatusBadge status={p.status?.toLowerCase() as never} /> },
    { key: 'actions', header: 'Actions', render: (p: PrescriptionDto) => (
      <Button variant="ghost" size="sm" onClick={() => { setSelectedRx(p); setRxDialogOpen(true); }}>
        <Eye className="h-4 w-4" />
      </Button>
    )},
  ];

  const isLoading = loadingTests || loadingRx;

  return (
    <DashboardLayout navItems={doctorNavItems} title="Medical Reports">
      <PageHeader title="Medical Reports" description="View lab results and prescription history" />

      {isLoading && <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}

      {!isLoading && (
        <Tabs defaultValue="tests">
          <TabsList>
            <TabsTrigger value="tests" className="gap-2">
              <TestTube className="h-4 w-4" />Lab Results ({completedTests.length})
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="gap-2">
              <Pill className="h-4 w-4" />Prescriptions ({rxList.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tests">
            <DataTable data={completedTests} columns={testCols} emptyMessage="No completed lab results" />
          </TabsContent>

          <TabsContent value="prescriptions">
            <DataTable data={rxList} columns={rxCols} emptyMessage="No prescriptions" />
          </TabsContent>
        </Tabs>
      )}

      {/* Test Result Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Lab Result — {selectedTest?.testType}</DialogTitle></DialogHeader>
          {selectedTest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Patient:</span> {selectedTest.patientName}</div>
                <div><span className="text-muted-foreground">Technician:</span> {selectedTest.technicianName ?? '—'}</div>
                <div><span className="text-muted-foreground">Requested:</span> {selectedTest.requestedAt?.split('T')[0]}</div>
                <div><span className="text-muted-foreground">Completed:</span> {selectedTest.completedAt?.split('T')[0] ?? '—'}</div>
              </div>
              {selectedTest.results && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" />Results</CardTitle></CardHeader>
                  <CardContent><p className="text-sm whitespace-pre-wrap">{selectedTest.results}</p></CardContent>
                </Card>
              )}
              {selectedTest.reportUrl && (
                <a href={selectedTest.reportUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="w-full">View Full Report</Button>
                </a>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Prescription Dialog */}
      <Dialog open={rxDialogOpen} onOpenChange={setRxDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Prescription #{selectedRx?.id}</DialogTitle></DialogHeader>
          {selectedRx && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Patient:</span> {selectedRx.patientName}</div>
                <div><span className="text-muted-foreground">Date:</span> {selectedRx.prescriptionDate}</div>
                <div className="col-span-2"><StatusBadge status={selectedRx.status?.toLowerCase() as never} /></div>
              </div>
              <div className="space-y-2">
                {selectedRx.items?.map((item, idx) => (
                  <div key={idx} className="p-3 bg-muted rounded-lg text-sm">
                    <p className="font-medium">{item.medicineName}</p>
                    <p className="text-muted-foreground">{item.dosage} • {item.frequency} • {item.duration} days • Qty: {item.quantity}</p>
                  </div>
                ))}
              </div>
              {selectedRx.notes && <p className="text-sm text-muted-foreground">{selectedRx.notes}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DoctorReports;
