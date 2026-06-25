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
import { usePatients } from '@/hooks/usePatients';
import { useLabTestsByDoctor, useCreateLabTest } from '@/hooks/useLabTests';
import { useRadiologyOrdersByDoctor, useCreateRadiologyOrder } from '@/hooks/useRadiologyOrders';
import { LabTestDto } from '@/services/labTestService';
import { RadiologyOrderDto } from '@/services/radiologyService';
import {
  fmtDate, normStatus, isCompleted,
  validateCreateLabTest, validateCreateRadiologyOrder,
  fmtOrderType,
} from '@/lib/diagnosticUtils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Eye, TestTube, Radiation } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// These values must exactly match the backend LabTestType enum
const LAB_TEST_TYPES: { label: string; value: string }[] = [
  { label: 'Blood Test',        value: 'BLOOD_TEST' },
  { label: 'Complete Blood Count (CBC)', value: 'COMPLETE_BLOOD_COUNT' },
  { label: 'Urine Test',        value: 'URINE_TEST' },
  { label: 'Stool Test',        value: 'STOOL_TEST' },
  { label: 'Culture',           value: 'CULTURE' },
  { label: 'Biopsy',            value: 'BIOPSY' },
  { label: 'PCR',               value: 'PCR' },
  { label: 'Hormone Panel',     value: 'HORMONE_PANEL' },
  { label: 'Lipid Panel',       value: 'LIPID_PANEL' },
  { label: 'Liver Function',    value: 'LIVER_FUNCTION' },
  { label: 'Kidney Function',   value: 'KIDNEY_FUNCTION' },
  { label: 'Thyroid Function',  value: 'THYROID_FUNCTION' },
  { label: 'Other',             value: 'OTHER' },
];

// These values must exactly match the backend RadiologyOrderType enum
const RADIOLOGY_TYPES: { label: string; value: string }[] = [
  { label: 'X-Ray',            value: 'XRAY' },
  { label: 'CT Scan',          value: 'CT_SCAN' },
  { label: 'MRI',              value: 'MRI' },
  { label: 'Ultrasound',       value: 'ULTRASOUND' },
  { label: 'PET Scan',         value: 'PET_SCAN' },
  { label: 'Mammography',      value: 'MAMMOGRAPHY' },
  { label: 'Fluoroscopy',      value: 'FLUOROSCOPY' },
  { label: 'Bone Scan',        value: 'BONE_SCAN' },
  { label: 'Echocardiogram',   value: 'ECHOCARDIOGRAM' },
  { label: 'Other',            value: 'OTHER' },
];

const BODY_PARTS = [
  'Chest', 'Abdomen', 'Pelvis', 'Head', 'Brain', 'Neck', 'Spine',
  'Upper Extremity', 'Lower Extremity', 'Whole Body', 'Cardiac',
];

const emptyLabForm  = { patientId: '', testType: '', testName: '', description: '' };
const emptyRadForm  = { patientId: '', orderType: '', bodyPart: '', indication: '', contrast: '', instructions: '' };

const DoctorTests: React.FC = () => {
  const { user } = useAuth();
  const { data: patients = [] }                     = usePatients();
  const { data: labTests = [],  isLoading: ldLab }  = useLabTestsByDoctor(user?.id);
  const { data: radOrders = [], isLoading: ldRad }  = useRadiologyOrdersByDoctor(user?.id);
  const createLab = useCreateLabTest();
  const createRad = useCreateRadiologyOrder();

  const [labOpen,      setLabOpen]      = useState(false);
  const [radOpen,      setRadOpen]      = useState(false);
  const [viewLabOpen,  setViewLabOpen]  = useState(false);
  const [viewRadOpen,  setViewRadOpen]  = useState(false);
  const [selectedLab,  setSelectedLab]  = useState<LabTestDto | null>(null);
  const [selectedRad,  setSelectedRad]  = useState<RadiologyOrderDto | null>(null);
  const [labForm,  setLabForm]  = useState(emptyLabForm);
  const [radForm,  setRadForm]  = useState(emptyRadForm);

  const pendingLabs    = labTests.filter(t => ['PENDING', 'ORDERED'].includes(normStatus(t.status)));
  const inProgressLabs = labTests.filter(t => ['IN_PROGRESS', 'SAMPLE_COLLECTED'].includes(normStatus(t.status)));
  const completedLabs  = labTests.filter(isCompleted);
  const pendingRad     = radOrders.filter(r => ['PENDING', 'ORDERED'].includes(normStatus(r.status)));
  const inProgressRad  = radOrders.filter(r => ['SCHEDULED', 'IN_PROGRESS'].includes(normStatus(r.status)));
  const completedRad   = radOrders.filter(isCompleted);

  const handleCreateLab = async () => {
    const v = validateCreateLabTest(labForm);
    if (!v.valid) { toast.error(v.error); return; }
    if (!user?.id) return;
    try {
      await createLab.mutateAsync({
        patientId: Number(labForm.patientId),
        doctorId: Number(user.id),
        testType: labForm.testType,
        testName: labForm.testName || undefined,
        description: labForm.description || undefined,
      });
      toast.success('Lab test request sent');
      setLabOpen(false);
      setLabForm(emptyLabForm);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  const handleCreateRad = async () => {
    const v = validateCreateRadiologyOrder(radForm);
    if (!v.valid) { toast.error(v.error); return; }
    if (!user?.id) return;
    try {
      await createRad.mutateAsync({
        patientId: Number(radForm.patientId),
        doctorId: Number(user.id),
        orderType: radForm.orderType,
        bodyPart: radForm.bodyPart || undefined,
        clinicalIndication: radForm.indication || undefined,
        contrast: radForm.contrast || undefined,
        specialInstructions: radForm.instructions || undefined,
      });
      toast.success('Radiology order sent');
      setRadOpen(false);
      setRadForm(emptyRadForm);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  const labCols = [
    { key: 'patientName', header: 'Patient' },
    { key: 'testType',    header: 'Test Type' },
    { key: 'orderedAt',   header: 'Ordered',    render: (t: LabTestDto) => fmtDate(t.orderedAt) },
    { key: 'isCritical',  header: '',            render: (t: LabTestDto) => <CriticalBadge isCritical={t.isCritical} iconOnly /> },
    { key: 'status',      header: 'Status',      render: (t: LabTestDto) => <StatusBadge status={normStatus(t.status).toLowerCase() as never} /> },
    { key: 'actions',     header: 'Actions',     render: (t: LabTestDto) => (
      <Button variant="ghost" size="sm" onClick={() => { setSelectedLab(t); setViewLabOpen(true); }}><Eye className="h-4 w-4" /></Button>
    )},
  ];

  const radCols = [
    { key: 'patientName', header: 'Patient' },
    { key: 'orderType',   header: 'Order Type',  render: (r: RadiologyOrderDto) => fmtOrderType(r.orderType) },
    { key: 'bodyPart',    header: 'Body Part',   render: (r: RadiologyOrderDto) => r.bodyPart ?? '—' },
    { key: 'orderedAt',   header: 'Ordered',     render: (r: RadiologyOrderDto) => fmtDate(r.orderedAt) },
    { key: 'isCritical',  header: '',             render: (r: RadiologyOrderDto) => <CriticalBadge isCritical={r.isCritical} iconOnly /> },
    { key: 'status',      header: 'Status',      render: (r: RadiologyOrderDto) => <StatusBadge status={normStatus(r.status).toLowerCase() as never} /> },
    { key: 'actions',     header: 'Actions',     render: (r: RadiologyOrderDto) => (
      <Button variant="ghost" size="sm" onClick={() => { setSelectedRad(r); setViewRadOpen(true); }}><Eye className="h-4 w-4" /></Button>
    )},
  ];

  const isLoading = ldLab || ldRad;

  return (
    <DashboardLayout navItems={doctorNavItems} title="Test Requests">
      <PageHeader
        title="Lab & Radiology Requests"
        description="Order and track diagnostic tests and imaging"
        action={
          <div className="flex gap-2">
            <Dialog open={labOpen} onOpenChange={setLabOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><TestTube className="h-4 w-4 mr-2" />Lab Test</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Request Lab Test</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Patient <span className="text-destructive">*</span></Label>
                    <Select value={labForm.patientId} onValueChange={v => setLabForm(p => ({ ...p, patientId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select patient..." /></SelectTrigger>
                      <SelectContent>{patients.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name} — {p.nationalId}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Test Type <span className="text-destructive">*</span></Label>
                    <Select value={labForm.testType} onValueChange={v => setLabForm(p => ({ ...p, testType: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select test type..." /></SelectTrigger>
                      <SelectContent>{LAB_TEST_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Test Name</Label>
                    <Input value={labForm.testName} onChange={e => setLabForm(p => ({ ...p, testName: e.target.value }))} placeholder="Optional specific test name..." />
                  </div>
                  <div>
                    <Label>Description / Instructions</Label>
                    <Textarea value={labForm.description} onChange={e => setLabForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Clinical context or special instructions..." />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setLabOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateLab} disabled={createLab.isPending}>
                      {createLab.isPending ? 'Sending...' : 'Send Request'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={radOpen} onOpenChange={setRadOpen}>
              <DialogTrigger asChild>
                <Button><Radiation className="h-4 w-4 mr-2" />Radiology</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Request Radiology Order</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Patient <span className="text-destructive">*</span></Label>
                    <Select value={radForm.patientId} onValueChange={v => setRadForm(p => ({ ...p, patientId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select patient..." /></SelectTrigger>
                      <SelectContent>{patients.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name} — {p.nationalId}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Order Type <span className="text-destructive">*</span></Label>
                    <Select value={radForm.orderType} onValueChange={v => setRadForm(p => ({ ...p, orderType: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select imaging type..." /></SelectTrigger>
                      <SelectContent>{RADIOLOGY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Body Part</Label>
                      <Select value={radForm.bodyPart} onValueChange={v => setRadForm(p => ({ ...p, bodyPart: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>{BODY_PARTS.map(bp => <SelectItem key={bp} value={bp}>{bp}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Contrast</Label>
                      <Select value={radForm.contrast} onValueChange={v => setRadForm(p => ({ ...p, contrast: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NONE">None</SelectItem>
                          <SelectItem value="WITH_CONTRAST">With Contrast</SelectItem>
                          <SelectItem value="WITHOUT_CONTRAST">Without Contrast</SelectItem>
                          <SelectItem value="BOTH">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Clinical Indication</Label>
                    <Textarea value={radForm.indication} onChange={e => setRadForm(p => ({ ...p, indication: e.target.value }))} rows={2} placeholder="Reason for imaging..." />
                  </div>
                  <div>
                    <Label>Special Instructions</Label>
                    <Input value={radForm.instructions} onChange={e => setRadForm(p => ({ ...p, instructions: e.target.value }))} placeholder="Any special requirements..." />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setRadOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateRad} disabled={createRad.isPending}>
                      {createRad.isPending ? 'Sending...' : 'Send Order'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {isLoading && <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}

      {!isLoading && (
        <Tabs defaultValue="lab">
          <TabsList>
            <TabsTrigger value="lab" className="gap-2"><TestTube className="h-4 w-4" />Lab Tests ({labTests.length})</TabsTrigger>
            <TabsTrigger value="radiology" className="gap-2"><Radiation className="h-4 w-4" />Radiology ({radOrders.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="lab">
            <Tabs defaultValue="pending">
              <TabsList>
                <TabsTrigger value="pending">Pending ({pendingLabs.length})</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress ({inProgressLabs.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedLabs.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="pending"><DataTable data={pendingLabs}    columns={labCols} emptyMessage="No pending lab requests" /></TabsContent>
              <TabsContent value="in-progress"><DataTable data={inProgressLabs} columns={labCols} emptyMessage="No tests in progress" /></TabsContent>
              <TabsContent value="completed"><DataTable data={completedLabs}  columns={labCols} emptyMessage="No completed tests" /></TabsContent>
            </Tabs>
          </TabsContent>
          <TabsContent value="radiology">
            <Tabs defaultValue="pending">
              <TabsList>
                <TabsTrigger value="pending">Pending ({pendingRad.length})</TabsTrigger>
                <TabsTrigger value="in-progress">Scheduled / In Progress ({inProgressRad.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedRad.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="pending"><DataTable data={pendingRad}    columns={radCols} emptyMessage="No pending radiology orders" /></TabsContent>
              <TabsContent value="in-progress"><DataTable data={inProgressRad} columns={radCols} emptyMessage="No orders in progress" /></TabsContent>
              <TabsContent value="completed"><DataTable data={completedRad}  columns={radCols} emptyMessage="No completed orders" /></TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={viewLabOpen} onOpenChange={setViewLabOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Lab Test Details</DialogTitle></DialogHeader>
          {selectedLab && (
            <div className="space-y-4">
              <DiagnosticOrderMeta items={[
                { label: 'Patient',    value: selectedLab.patientName },
                { label: 'Test',       value: selectedLab.testType },
                { label: 'Ordered',    value: fmtDate(selectedLab.orderedAt) },
                { label: 'Technician', value: selectedLab.technicianName ?? 'Not assigned' },
                ...(selectedLab.description ? [{ label: 'Description', value: selectedLab.description, fullWidth: true as const }] : []),
              ]} />
              <div className="flex items-center gap-2">
                <StatusBadge status={normStatus(selectedLab.status).toLowerCase() as never} />
                <CriticalBadge isCritical={selectedLab.isCritical} />
              </div>
              {isCompleted(selectedLab) && selectedLab.result && (
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

      <Dialog open={viewRadOpen} onOpenChange={setViewRadOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Radiology Order Details</DialogTitle></DialogHeader>
          {selectedRad && (
            <div className="space-y-4">
              <DiagnosticOrderMeta items={[
                { label: 'Patient',    value: selectedRad.patientName },
                { label: 'Type',       value: fmtOrderType(selectedRad.orderType) },
                { label: 'Body Part',  value: selectedRad.bodyPart ?? '—' },
                { label: 'Ordered',    value: fmtDate(selectedRad.orderedAt) },
                { label: 'Scheduled',  value: fmtDate(selectedRad.scheduledAt) },
                { label: 'Technician', value: selectedRad.technicianName ?? 'Not assigned' },
                ...(selectedRad.clinicalIndication ? [{ label: 'Indication', value: selectedRad.clinicalIndication, fullWidth: true as const }] : []),
              ]} />
              <div className="flex items-center gap-2">
                <StatusBadge status={normStatus(selectedRad.status).toLowerCase() as never} />
                <CriticalBadge isCritical={selectedRad.isCritical} />
              </div>
              {isCompleted(selectedRad) && selectedRad.reportFindings && (
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
    </DashboardLayout>
  );
};

export default DoctorTests;
