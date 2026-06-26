import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import CriticalBadge from '@/components/shared/CriticalBadge';
import DiagnosticOrderMeta from '@/components/shared/DiagnosticOrderMeta';
import { LabResultCard, RadiologyReportCard } from '@/components/shared/DiagnosticResultCard';
import { doctorNavItems } from './DoctorDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useLabTestsByDoctor } from '@/hooks/useLabTests';
import { useRadiologyOrdersByDoctor } from '@/hooks/useRadiologyOrders';
import { usePrescriptionsByDoctor } from '@/hooks/usePrescriptions';
import { LabTestDto } from '@/services/labTestService';
import { RadiologyOrderDto } from '@/services/radiologyService';
import { PrescriptionDto } from '@/services/prescriptionService';
import { fmtDate, normStatus, isCompleted, fmtOrderType } from '@/lib/diagnosticUtils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, TestTube, Pill, Radiation } from 'lucide-react';

const DoctorReports: React.FC = () => {
  const { user } = useAuth();
  const { data: labTests = [],  isLoading: ldLab } = useLabTestsByDoctor(user?.id);
  const { data: radOrders = [], isLoading: ldRad } = useRadiologyOrdersByDoctor(user?.id);
  const { data: rxList = [],    isLoading: ldRx }  = usePrescriptionsByDoctor(user?.id);

  const [selectedLab,  setSelectedLab]  = useState<LabTestDto | null>(null);
  const [selectedRad,  setSelectedRad]  = useState<RadiologyOrderDto | null>(null);
  const [selectedRx,   setSelectedRx]   = useState<PrescriptionDto | null>(null);
  const [labOpen,  setLabOpen]  = useState(false);
  const [radOpen,  setRadOpen]  = useState(false);
  const [rxOpen,   setRxOpen]   = useState(false);

  const completedLabs = labTests.filter(isCompleted);
  const completedRad  = radOrders.filter(isCompleted);

  const labCols = [
    { key: 'patientName', header: 'Patient' },
    { key: 'testType',    header: 'Test Type' },
    { key: 'completedAt', header: 'Completed', render: (t: LabTestDto) => fmtDate(t.completedAt) },
    { key: 'isCritical',  header: 'Critical',  render: (t: LabTestDto) => <CriticalBadge isCritical={t.isCritical} showNormal /> },
    { key: 'actions',     header: 'Actions',   render: (t: LabTestDto) => (
      <Button variant="ghost" size="sm" onClick={() => { setSelectedLab(t); setLabOpen(true); }}><Eye className="h-4 w-4" /></Button>
    )},
  ];

  const radCols = [
    { key: 'patientName', header: 'Patient' },
    { key: 'orderType',   header: 'Type',      render: (r: RadiologyOrderDto) => fmtOrderType(r.orderType) },
    { key: 'bodyPart',    header: 'Body Part', render: (r: RadiologyOrderDto) => r.bodyPart ?? '—' },
    { key: 'completedAt', header: 'Completed', render: (r: RadiologyOrderDto) => fmtDate(r.completedAt) },
    { key: 'isCritical',  header: 'Critical',  render: (r: RadiologyOrderDto) => <CriticalBadge isCritical={r.isCritical} showNormal /> },
    { key: 'actions',     header: 'Actions',   render: (r: RadiologyOrderDto) => (
      <Button variant="ghost" size="sm" onClick={() => { setSelectedRad(r); setRadOpen(true); }}><Eye className="h-4 w-4" /></Button>
    )},
  ];

  const rxCols = [
    { key: 'patientName',      header: 'Patient' },
    { key: 'prescriptionDate', header: 'Date' },
    { key: 'items',            header: 'Medications', render: (p: PrescriptionDto) => `${p.items?.length ?? 0} item(s)` },
    { key: 'status',           header: 'Status',      render: (p: PrescriptionDto) => <StatusBadge status={p.status?.toLowerCase() as never} /> },
    { key: 'actions',          header: 'Actions',     render: (p: PrescriptionDto) => (
      <Button variant="ghost" size="sm" onClick={() => { setSelectedRx(p); setRxOpen(true); }}><Eye className="h-4 w-4" /></Button>
    )},
  ];

  const isLoading = ldLab || ldRad || ldRx;

  return (
    <DashboardLayout navItems={doctorNavItems} title="Medical Reports">
      <PageHeader title="Medical Reports" description="View lab results, radiology reports, and prescriptions" />

      {isLoading && <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}

      {!isLoading && (
        <Tabs defaultValue="lab">
          <TabsList>
            <TabsTrigger value="lab" className="gap-2">
              <TestTube className="h-4 w-4" />Lab Results ({completedLabs.length})
            </TabsTrigger>
            <TabsTrigger value="radiology" className="gap-2">
              <Radiation className="h-4 w-4" />Radiology ({completedRad.length})
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="gap-2">
              <Pill className="h-4 w-4" />Prescriptions ({rxList.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="lab">
            <DataTable data={completedLabs} columns={labCols} emptyMessage="No completed lab results" />
          </TabsContent>
          <TabsContent value="radiology">
            <DataTable data={completedRad} columns={radCols} emptyMessage="No completed radiology orders" />
          </TabsContent>
          <TabsContent value="prescriptions">
            <DataTable data={rxList} columns={rxCols} emptyMessage="No prescriptions" />
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={labOpen} onOpenChange={setLabOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Lab Result — {selectedLab?.testType}</DialogTitle></DialogHeader>
          {selectedLab && (
            <div className="space-y-4">
              <DiagnosticOrderMeta items={[
                { label: 'Patient',    value: selectedLab.patientName },
                { label: 'Technician', value: selectedLab.technicianName ?? '—' },
                { label: 'Ordered',    value: fmtDate(selectedLab.orderedAt) },
                { label: 'Completed',  value: fmtDate(selectedLab.completedAt) },
              ]} />
              {selectedLab.result && (
                <LabResultCard
                  result={selectedLab.result}
                  referenceRange={selectedLab.referenceRange}
                  notes={selectedLab.notes}
                  isCritical={selectedLab.isCritical}
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={radOpen} onOpenChange={setRadOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Radiology Report — {fmtOrderType(selectedRad?.orderType)}</DialogTitle></DialogHeader>
          {selectedRad && (
            <div className="space-y-4">
              <DiagnosticOrderMeta items={[
                { label: 'Patient',    value: selectedRad.patientName },
                { label: 'Body Part',  value: selectedRad.bodyPart ?? '—' },
                { label: 'Ordered',    value: fmtDate(selectedRad.orderedAt) },
                { label: 'Completed',  value: fmtDate(selectedRad.completedAt) },
              ]} />
              {selectedRad.reportFindings && (
                <RadiologyReportCard
                  reportFindings={selectedRad.reportFindings}
                  impression={selectedRad.impression}
                  imageUrl={selectedRad.imageUrl}
                  notes={selectedRad.notes}
                  isCritical={selectedRad.isCritical}
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={rxOpen} onOpenChange={setRxOpen}>
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
