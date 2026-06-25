import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import CriticalBadge from '@/components/shared/CriticalBadge';
import DiagnosticOrderMeta from '@/components/shared/DiagnosticOrderMeta';
import DiagnosticEmptyState from '@/components/shared/DiagnosticEmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { useLabTestsByTechnician, useLabTestsByStatus, useAssignLabTechnician, useEnterLabResult } from '@/hooks/useLabTests';
import { useRadiologyOrdersByTechnician, useRadiologyOrdersByStatus, useAssignRadiologyTechnician, useEnterRadiologyReport } from '@/hooks/useRadiologyOrders';
import { LabTestDto } from '@/services/labTestService';
import { RadiologyOrderDto } from '@/services/radiologyService';
import {
  fmtDate, normStatus, isCompleted, isActiveLab, isActiveRadiology,
  filterAvailableLabs, filterAvailableRadiology,
  validateLabResultPayload, validateRadiologyReportPayload,
  defaultLabResultForm, defaultRadiologyReportForm,
  labResultFormFromDto, radiologyReportFormFromDto,
  LabResultFormValues, RadiologyReportFormValues,
} from '@/lib/diagnosticUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { LayoutDashboard, ClipboardList, Upload, User, Bell, CheckCircle, FileText, HandshakeIcon, RefreshCw, TestTube, Radiation } from 'lucide-react';

import { technicianNavItems as navItems } from '@/constants/technicianNavItems';

type ActiveType = 'lab' | 'radiology';

const TechnicianRequests = () => {
  const { user } = useAuth();

  const { data: myLabs = [],        isLoading: ldMyLab,  refetch: refetchMyLabs }    = useLabTestsByTechnician(user?.id);
  // Backend status for unassigned orders is ORDERED, not PENDING
  const { data: pendingLabs = [],   isLoading: ldPendLab, refetch: refetchPendLabs } = useLabTestsByStatus('ORDERED');
  const { data: myRad = [],         isLoading: ldMyRad,  refetch: refetchMyRad }     = useRadiologyOrdersByTechnician(user?.id);
  const { data: pendingRad = [],    isLoading: ldPendRad, refetch: refetchPendRad }  = useRadiologyOrdersByStatus('ORDERED');

  const assignLab    = useAssignLabTechnician();
  const enterLab     = useEnterLabResult();
  const assignRad    = useAssignRadiologyTechnician();
  const enterRad     = useEnterRadiologyReport();

  const [activeType,    setActiveType]    = useState<ActiveType>('lab');
  const [selectedLab,   setSelectedLab]   = useState<LabTestDto | null>(null);
  const [selectedRad,   setSelectedRad]   = useState<RadiologyOrderDto | null>(null);
  const [dialogOpen,    setDialogOpen]    = useState(false);
  const [dialogMode,    setDialogMode]    = useState<'view' | 'edit'>('edit');
  const [labForm,       setLabForm]       = useState<LabResultFormValues>(defaultLabResultForm);
  const [radForm,       setRadForm]       = useState<RadiologyReportFormValues>(defaultRadiologyReportForm);

  const isLoading    = ldMyLab || ldPendLab || ldMyRad || ldPendRad;
  const isSubmitting = enterLab.isPending || enterRad.isPending;

  const myLabIds = new Set(myLabs.map(t => t.id));
  const myRadIds = new Set(myRad.map(r => r.id));

  const availableLabs    = filterAvailableLabs(pendingLabs, myLabIds);
  const activeLabs       = myLabs.filter(isActiveLab);
  const completedLabs    = myLabs.filter(isCompleted);
  const availableRadList = filterAvailableRadiology(pendingRad, myRadIds);
  const activeRadList    = myRad.filter(isActiveRadiology);
  const completedRadList = myRad.filter(isCompleted);

  const handleTakeLab = async (lab: LabTestDto) => {
    if (!user?.id) return;
    try {
      await assignLab.mutateAsync({ id: lab.id, technicianId: Number(user.id) });
      toast.success(`Took "${lab.testType}" for ${lab.patientName}`);
      refetchMyLabs(); refetchPendLabs();
    } catch {
      toast.error('Request no longer available');
      refetchPendLabs();
    }
  };

  const openLabDialog = (lab: LabTestDto, mode: 'view' | 'edit' = 'edit') => {
    setActiveType('lab');
    setSelectedLab(lab);
    setDialogMode(mode);
    setLabForm(isCompleted(lab) ? labResultFormFromDto(lab) : defaultLabResultForm);
    setDialogOpen(true);
  };

  const handleSubmitLab = async () => {
    if (!selectedLab) return;
    const v = validateLabResultPayload(labForm);
    if (!v.valid) { toast.error(v.error); return; }
    try {
      await enterLab.mutateAsync({ id: selectedLab.id, payload: labForm });
      toast.success('Lab result saved');
      setDialogOpen(false);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  const handleTakeRad = async (order: RadiologyOrderDto) => {
    if (!user?.id) return;
    try {
      await assignRad.mutateAsync({ id: order.id, technicianId: Number(user.id) });
      toast.success(`Took "${order.orderType}" for ${order.patientName}`);
      refetchMyRad(); refetchPendRad();
    } catch {
      toast.error('Request no longer available');
      refetchPendRad();
    }
  };

  const openRadDialog = (order: RadiologyOrderDto, mode: 'view' | 'edit' = 'edit') => {
    setActiveType('radiology');
    setSelectedRad(order);
    setDialogMode(mode);
    setRadForm(isCompleted(order) ? radiologyReportFormFromDto(order) : defaultRadiologyReportForm);
    setDialogOpen(true);
  };

  const handleSubmitRad = async () => {
    if (!selectedRad) return;
    const v = validateRadiologyReportPayload(radForm);
    if (!v.valid) { toast.error(v.error); return; }
    try {
      await enterRad.mutateAsync({ id: selectedRad.id, payload: radForm });
      toast.success('Radiology report saved');
      setDialogOpen(false);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  const labAvailCols = [
    { key: 'testType',    header: 'Test Type' },
    { key: 'patientName', header: 'Patient' },
    { key: 'doctorName',  header: 'Doctor' },
    { key: 'orderedAt',   header: 'Ordered',    render: (r: LabTestDto) => fmtDate(r.orderedAt) },
    { key: 'isCritical',  header: '',            render: (r: LabTestDto) => <CriticalBadge isCritical={r.isCritical} iconOnly /> },
    { key: 'actions',     header: 'Actions',     render: (r: LabTestDto) => (
      <Button size="sm" className="gap-1.5" onClick={() => handleTakeLab(r)} disabled={assignLab.isPending}>
        <HandshakeIcon className="h-4 w-4" />Take
      </Button>
    )},
  ];

  const labActiveCols = [
    { key: 'testType',    header: 'Test Type' },
    { key: 'patientName', header: 'Patient' },
    { key: 'status',      header: 'Status',   render: (r: LabTestDto) => <StatusBadge status={normStatus(r.status).toLowerCase() as never} /> },
    { key: 'orderedAt',   header: 'Ordered',  render: (r: LabTestDto) => fmtDate(r.orderedAt) },
    { key: 'actions',     header: 'Actions',  render: (r: LabTestDto) => (
      <Button size="sm" onClick={() => openLabDialog(r)}>
        <FileText className="h-4 w-4 mr-1" />Enter Result
      </Button>
    )},
  ];

  const labDoneCols = [
    { key: 'testType',    header: 'Test Type' },
    { key: 'patientName', header: 'Patient' },
    { key: 'orderedAt',   header: 'Ordered',   render: (r: LabTestDto) => fmtDate(r.orderedAt) },
    { key: 'completedAt', header: 'Completed', render: (r: LabTestDto) => fmtDate(r.completedAt) },
    { key: 'isCritical',  header: 'Critical',  render: (r: LabTestDto) => <CriticalBadge isCritical={r.isCritical} showNormal /> },
    { key: 'actions',     header: 'Actions',    render: (r: LabTestDto) => (
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" onClick={() => openLabDialog(r, 'view')}>
          <FileText className="h-4 w-4 mr-1" />View
        </Button>
        <Button size="sm" variant="outline" onClick={() => openLabDialog(r, 'edit')}>
          Edit
        </Button>
      </div>
    )},
  ];

  const radAvailCols = [
    { key: 'orderType',   header: 'Order Type' },
    { key: 'patientName', header: 'Patient' },
    { key: 'bodyPart',    header: 'Body Part', render: (r: RadiologyOrderDto) => r.bodyPart ?? '—' },
    { key: 'doctorName',  header: 'Doctor' },
    { key: 'orderedAt',   header: 'Ordered',   render: (r: RadiologyOrderDto) => fmtDate(r.orderedAt) },
    { key: 'actions',     header: 'Actions',   render: (r: RadiologyOrderDto) => (
      <Button size="sm" className="gap-1.5" onClick={() => handleTakeRad(r)} disabled={assignRad.isPending}>
        <HandshakeIcon className="h-4 w-4" />Take
      </Button>
    )},
  ];

  const radActiveCols = [
    { key: 'orderType',   header: 'Order Type' },
    { key: 'patientName', header: 'Patient' },
    { key: 'bodyPart',    header: 'Body Part',  render: (r: RadiologyOrderDto) => r.bodyPart ?? '—' },
    { key: 'status',      header: 'Status',     render: (r: RadiologyOrderDto) => <StatusBadge status={normStatus(r.status).toLowerCase() as never} /> },
    { key: 'scheduledAt', header: 'Scheduled',  render: (r: RadiologyOrderDto) => fmtDate(r.scheduledAt) },
    { key: 'actions',     header: 'Actions',    render: (r: RadiologyOrderDto) => (
      <Button size="sm" onClick={() => openRadDialog(r)}>
        <FileText className="h-4 w-4 mr-1" />Enter Report
      </Button>
    )},
  ];

  const radDoneCols = [
    { key: 'orderType',   header: 'Order Type' },
    { key: 'patientName', header: 'Patient' },
    { key: 'orderedAt',   header: 'Ordered',    render: (r: RadiologyOrderDto) => fmtDate(r.orderedAt) },
    { key: 'completedAt', header: 'Completed',  render: (r: RadiologyOrderDto) => fmtDate(r.completedAt) },
    { key: 'isCritical',  header: 'Critical',   render: (r: RadiologyOrderDto) => <CriticalBadge isCritical={r.isCritical} showNormal /> },
    { key: 'actions',     header: 'Actions',     render: (r: RadiologyOrderDto) => (
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" onClick={() => openRadDialog(r, 'view')}>
          <FileText className="h-4 w-4 mr-1" />View
        </Button>
        <Button size="sm" variant="outline" onClick={() => openRadDialog(r, 'edit')}>
          Edit
        </Button>
      </div>
    )},
  ];

  const readOnly = (_status?: string | null) => false; // technician can always edit their own reports

  return (
    <DashboardLayout navItems={navItems} title="Test Requests">
      <PageHeader
        title="Lab & Radiology Requests"
        description="Manage diagnostic test and imaging requests"
        action={
          <Button variant="outline" size="sm" onClick={() => { refetchMyLabs(); refetchPendLabs(); refetchMyRad(); refetchPendRad(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />Refresh
          </Button>
        }
      />

      {isLoading && <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}

      {!isLoading && (
        <Tabs defaultValue="lab">
          <TabsList>
            <TabsTrigger value="lab" className="gap-2">
              <TestTube className="h-4 w-4" />Lab Tests
              {availableLabs.length > 0 && <Badge variant="destructive" className="ml-1">{availableLabs.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="radiology" className="gap-2">
              <Radiation className="h-4 w-4" />Radiology
              {availableRadList.length > 0 && <Badge variant="destructive" className="ml-1">{availableRadList.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lab">
            <Tabs defaultValue="available">
              <TabsList>
                <TabsTrigger value="available">Available ({availableLabs.length})</TabsTrigger>
                <TabsTrigger value="mine">My Tests ({activeLabs.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedLabs.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="available">
                <Card><CardContent className="pt-6">
                  {availableLabs.length === 0
                    ? <DiagnosticEmptyState message="No available lab tests" />
                    : <DataTable data={availableLabs} columns={labAvailCols} />}
                </CardContent></Card>
              </TabsContent>
              <TabsContent value="mine">
                <Card><CardContent className="pt-6">
                  {activeLabs.length === 0
                    ? <DiagnosticEmptyState message="No active tests. Take one from Available." />
                    : <DataTable data={activeLabs} columns={labActiveCols} />}
                </CardContent></Card>
              </TabsContent>
              <TabsContent value="completed">
                <Card><CardContent className="pt-6">
                  <DataTable data={completedLabs} columns={labDoneCols} emptyMessage="No completed lab tests" />
                </CardContent></Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="radiology">
            <Tabs defaultValue="available">
              <TabsList>
                <TabsTrigger value="available">Available ({availableRadList.length})</TabsTrigger>
                <TabsTrigger value="mine">My Orders ({activeRadList.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedRadList.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="available">
                <Card><CardContent className="pt-6">
                  {availableRadList.length === 0
                    ? <DiagnosticEmptyState message="No available radiology orders" />
                    : <DataTable data={availableRadList} columns={radAvailCols} />}
                </CardContent></Card>
              </TabsContent>
              <TabsContent value="mine">
                <Card><CardContent className="pt-6">
                  {activeRadList.length === 0
                    ? <DiagnosticEmptyState message="No active orders. Take one from Available." />
                    : <DataTable data={activeRadList} columns={radActiveCols} />}
                </CardContent></Card>
              </TabsContent>
              <TabsContent value="completed">
                <Card><CardContent className="pt-6">
                  <DataTable data={completedRadList} columns={radDoneCols} emptyMessage="No completed radiology orders" />
                </CardContent></Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={dialogOpen && activeType === 'lab'} onOpenChange={o => { if (!o) setDialogOpen(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'view' ? 'View Lab Result' : (selectedLab && isCompleted(selectedLab) ? 'Edit Lab Result' : 'Enter Lab Result')}
            </DialogTitle>
            <DialogDescription>{selectedLab?.testType} — {selectedLab?.patientName}</DialogDescription>
          </DialogHeader>
          {selectedLab && (
            <div className="space-y-4">
              <DiagnosticOrderMeta items={[
                { label: 'Test',    value: selectedLab.testType },
                { label: 'Patient', value: selectedLab.patientName },
                { label: 'Doctor',  value: selectedLab.doctorName },
                { label: 'Ordered', value: fmtDate(selectedLab.orderedAt) },
              ]} />
              <div>
                <Label>Result <span className="text-destructive">{dialogMode !== 'view' && '*'}</span></Label>
                <Textarea value={labForm.result} onChange={e => setLabForm(p => ({ ...p, result: e.target.value }))}
                  placeholder="Enter test result / findings..." rows={4} readOnly={dialogMode === 'view'}
                  className={dialogMode === 'view' ? 'bg-muted cursor-default' : ''} />
              </div>
              <div>
                <Label>Reference Range</Label>
                <Input value={labForm.referenceRange} onChange={e => setLabForm(p => ({ ...p, referenceRange: e.target.value }))}
                  placeholder="e.g. 4.5–11.0 × 10⁹/L" readOnly={dialogMode === 'view'}
                  className={dialogMode === 'view' ? 'bg-muted cursor-default' : ''} />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={labForm.notes} onChange={e => setLabForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Additional clinical notes..." rows={2} readOnly={dialogMode === 'view'}
                  className={dialogMode === 'view' ? 'bg-muted cursor-default' : ''} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={labForm.isCritical} onCheckedChange={v => setLabForm(p => ({ ...p, isCritical: v }))}
                  disabled={dialogMode === 'view'} id="lab-critical" />
                <Label htmlFor="lab-critical" className="text-destructive font-medium">Mark as Critical</Label>
              </div>
              {dialogMode === 'edit' && (
                <Button onClick={handleSubmitLab} className="w-full" disabled={isSubmitting}>
                  <CheckCircle className="h-4 w-4 mr-2" />{isSubmitting ? 'Saving...' : (selectedLab && isCompleted(selectedLab)) ? 'Update Result' : 'Save Result'}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen && activeType === 'radiology'} onOpenChange={o => { if (!o) setDialogOpen(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'view' ? 'View Radiology Report' : (selectedRad && isCompleted(selectedRad) ? 'Edit Radiology Report' : 'Enter Radiology Report')}
            </DialogTitle>
            <DialogDescription>{selectedRad?.orderType} — {selectedRad?.patientName}</DialogDescription>
          </DialogHeader>
          {selectedRad && (
            <div className="space-y-4">
              <DiagnosticOrderMeta items={[
                { label: 'Order Type', value: selectedRad.orderType },
                { label: 'Body Part',  value: selectedRad.bodyPart ?? '—' },
                { label: 'Patient',    value: selectedRad.patientName },
                { label: 'Doctor',     value: selectedRad.doctorName },
                ...(selectedRad.clinicalIndication
                  ? [{ label: 'Indication', value: selectedRad.clinicalIndication, fullWidth: true }]
                  : []),
              ]} />
              <div>
                <Label>Report Findings <span className="text-destructive">{dialogMode !== 'view' && '*'}</span></Label>
                <Textarea value={radForm.reportFindings} onChange={e => setRadForm(p => ({ ...p, reportFindings: e.target.value }))}
                  placeholder="Describe imaging findings..." rows={4} readOnly={dialogMode === 'view'}
                  className={dialogMode === 'view' ? 'bg-muted cursor-default' : ''} />
              </div>
              <div>
                <Label>Impression</Label>
                <Textarea value={radForm.impression} onChange={e => setRadForm(p => ({ ...p, impression: e.target.value }))}
                  placeholder="Radiologist impression / conclusion..." rows={2} readOnly={dialogMode === 'view'}
                  className={dialogMode === 'view' ? 'bg-muted cursor-default' : ''} />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input value={radForm.imageUrl} onChange={e => setRadForm(p => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="https://..." readOnly={dialogMode === 'view'}
                  className={dialogMode === 'view' ? 'bg-muted cursor-default' : ''} />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={radForm.notes} onChange={e => setRadForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Additional notes..." rows={2} readOnly={dialogMode === 'view'}
                  className={dialogMode === 'view' ? 'bg-muted cursor-default' : ''} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={radForm.isCritical} onCheckedChange={v => setRadForm(p => ({ ...p, isCritical: v }))}
                  disabled={dialogMode === 'view'} id="rad-critical" />
                <Label htmlFor="rad-critical" className="text-destructive font-medium">Mark as Critical</Label>
              </div>
              {dialogMode === 'edit' && (
                <Button onClick={handleSubmitRad} className="w-full" disabled={isSubmitting}>
                  <CheckCircle className="h-4 w-4 mr-2" />{isSubmitting ? 'Saving...' : (selectedRad && isCompleted(selectedRad)) ? 'Update Report' : 'Save Report'}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default TechnicianRequests;
