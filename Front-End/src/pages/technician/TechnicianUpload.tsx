import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DiagnosticOrderMeta from '@/components/shared/DiagnosticOrderMeta';
import { useAuth } from '@/contexts/AuthContext';
import { useLabTestsByTechnician, useEnterLabResult } from '@/hooks/useLabTests';
import { useRadiologyOrdersByTechnician, useEnterRadiologyReport } from '@/hooks/useRadiologyOrders';
import { LabTestDto } from '@/services/labTestService';
import { RadiologyOrderDto } from '@/services/radiologyService';
import {
  fmtDate, isCompleted,
  validateLabResultPayload, validateRadiologyReportPayload,
  defaultLabResultForm, defaultRadiologyReportForm,
  LabResultFormValues, RadiologyReportFormValues,
} from '@/lib/diagnosticUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { LayoutDashboard, ClipboardList, Upload, User, Bell, FileText, CheckCircle, TestTube, Radiation } from 'lucide-react';

import { technicianNavItems as navItems } from '@/constants/technicianNavItems';

interface RecentItem { id: number; label: string; patient: string; completedAt?: string | null; }

const RecentList: React.FC<{ items: RecentItem[] }> = ({ items }) => (
  <Card>
    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" />Recent</CardTitle></CardHeader>
    <CardContent>
      {items.length === 0
        ? <p className="text-muted-foreground text-sm text-center py-4">No recent entries</p>
        : (
          <div className="space-y-3">
            {items.map(r => (
              <div key={r.id} className="p-3 rounded-lg border bg-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{r.label}</p>
                    <p className="text-xs text-muted-foreground">{r.patient}</p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{fmtDate(r.completedAt)}</p>
              </div>
            ))}
          </div>
        )}
    </CardContent>
  </Card>
);

const LabUploadPanel: React.FC = () => {
  const { user } = useAuth();
  const { data: myLabs = [] } = useLabTestsByTechnician(user?.id);
  const enterLabResult = useEnterLabResult();

  const eligible = myLabs.filter(t => !isCompleted(t));
  const recent: RecentItem[] = myLabs
    .filter(isCompleted)
    .sort((a, b) => new Date(b.completedAt ?? '').getTime() - new Date(a.completedAt ?? '').getTime())
    .slice(0, 5)
    .map(r => ({ id: r.id, label: r.testType, patient: r.patientName, completedAt: r.completedAt }));

  const [selectedId, setSelectedId] = useState('');
  const [form, setForm]             = useState<LabResultFormValues>(defaultLabResultForm);
  const selected = eligible.find(r => String(r.id) === selectedId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) { toast.error('Select a lab test'); return; }
    const v = validateLabResultPayload(form);
    if (!v.valid) { toast.error(v.error); return; }
    try {
      await enterLabResult.mutateAsync({ id: Number(selectedId), payload: form });
      toast.success('Lab result saved');
      setSelectedId('');
      setForm(defaultLabResultForm);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Enter Lab Result</CardTitle>
            <CardDescription>Record test findings for an assigned lab test</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label>Select Lab Test <span className="text-destructive">*</span></Label>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger><SelectValue placeholder="Select a test..." /></SelectTrigger>
                  <SelectContent>
                    {eligible.length === 0
                      ? <SelectItem value="_empty" disabled>No active lab tests</SelectItem>
                      : eligible.map(r => (
                        <SelectItem key={r.id} value={String(r.id)}>
                          {r.testType} — {r.patientName} ({r.status})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              {selected && (
                <DiagnosticOrderMeta items={[
                  { label: 'Patient', value: selected.patientName },
                  { label: 'Test',    value: selected.testType },
                  { label: 'Doctor',  value: selected.doctorName },
                  { label: 'Ordered', value: fmtDate(selected.orderedAt) },
                ]} />
              )}
              <div>
                <Label>Result / Findings <span className="text-destructive">*</span></Label>
                <Textarea value={form.result} onChange={e => setForm(p => ({ ...p, result: e.target.value }))}
                  placeholder="Enter test results and findings..." rows={6} />
              </div>
              <div>
                <Label>Reference Range</Label>
                <Input value={form.referenceRange} onChange={e => setForm(p => ({ ...p, referenceRange: e.target.value }))}
                  placeholder="e.g. 4.5–11.0 × 10⁹/L" />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Clinical notes or observations..." rows={3} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.isCritical} onCheckedChange={v => setForm(p => ({ ...p, isCritical: v }))} id="lab-critical" />
                <Label htmlFor="lab-critical" className="text-destructive font-medium">Mark as Critical Result</Label>
              </div>
              <Button type="submit" className="w-full" disabled={!selectedId || enterLabResult.isPending}>
                <CheckCircle className="h-4 w-4 mr-2" />
                {enterLabResult.isPending ? 'Saving...' : 'Save Lab Result'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <RecentList items={recent} />
    </div>
  );
};

const RadiologyUploadPanel: React.FC = () => {
  const { user } = useAuth();
  const { data: myRad = [] } = useRadiologyOrdersByTechnician(user?.id);
  const enterReport = useEnterRadiologyReport();

  const eligible = myRad.filter(r => !isCompleted(r));
  const recent: RecentItem[] = myRad
    .filter(isCompleted)
    .sort((a, b) => new Date(b.completedAt ?? '').getTime() - new Date(a.completedAt ?? '').getTime())
    .slice(0, 5)
    .map(r => ({ id: r.id, label: r.orderType, patient: r.patientName, completedAt: r.completedAt }));

  const [selectedId, setSelectedId] = useState('');
  const [form, setForm]             = useState<RadiologyReportFormValues>(defaultRadiologyReportForm);
  const selected = eligible.find(r => String(r.id) === selectedId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) { toast.error('Select a radiology order'); return; }
    const v = validateRadiologyReportPayload(form);
    if (!v.valid) { toast.error(v.error); return; }
    try {
      await enterReport.mutateAsync({ id: Number(selectedId), payload: form });
      toast.success('Radiology report saved');
      setSelectedId('');
      setForm(defaultRadiologyReportForm);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Enter Radiology Report</CardTitle>
            <CardDescription>Record imaging findings for an assigned radiology order</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label>Select Radiology Order <span className="text-destructive">*</span></Label>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger><SelectValue placeholder="Select an order..." /></SelectTrigger>
                  <SelectContent>
                    {eligible.length === 0
                      ? <SelectItem value="_empty" disabled>No active radiology orders</SelectItem>
                      : eligible.map(r => (
                        <SelectItem key={r.id} value={String(r.id)}>
                          {r.orderType} — {r.patientName} ({r.status})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              {selected && (
                <DiagnosticOrderMeta items={[
                  { label: 'Patient',    value: selected.patientName },
                  { label: 'Order Type', value: selected.orderType },
                  { label: 'Body Part',  value: selected.bodyPart ?? '—' },
                  { label: 'Doctor',     value: selected.doctorName },
                  ...(selected.clinicalIndication
                    ? [{ label: 'Clinical Indication', value: selected.clinicalIndication, fullWidth: true as const }]
                    : []),
                ]} />
              )}
              <div>
                <Label>Report Findings <span className="text-destructive">*</span></Label>
                <Textarea value={form.reportFindings} onChange={e => setForm(p => ({ ...p, reportFindings: e.target.value }))}
                  placeholder="Describe imaging findings in detail..." rows={6} />
              </div>
              <div>
                <Label>Impression</Label>
                <Textarea value={form.impression} onChange={e => setForm(p => ({ ...p, impression: e.target.value }))}
                  placeholder="Radiologist's impression / conclusion..." rows={3} />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="https://storage.example.com/scan.dcm" />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Additional notes..." rows={2} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.isCritical} onCheckedChange={v => setForm(p => ({ ...p, isCritical: v }))} id="rad-critical" />
                <Label htmlFor="rad-critical" className="text-destructive font-medium">Mark as Critical Finding</Label>
              </div>
              <Button type="submit" className="w-full" disabled={!selectedId || enterReport.isPending}>
                <CheckCircle className="h-4 w-4 mr-2" />
                {enterReport.isPending ? 'Saving...' : 'Save Radiology Report'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <RecentList items={recent} />
    </div>
  );
};

const TechnicianUpload: React.FC = () => (
  <DashboardLayout navItems={navItems} title="Upload Reports">
    <PageHeader title="Enter Diagnostic Reports" description="Submit results for lab tests and radiology orders" />
    <Tabs defaultValue="lab">
      <TabsList className="mb-6">
        <TabsTrigger value="lab" className="gap-2"><TestTube className="h-4 w-4" />Lab Tests</TabsTrigger>
        <TabsTrigger value="radiology" className="gap-2"><Radiation className="h-4 w-4" />Radiology</TabsTrigger>
      </TabsList>
      <TabsContent value="lab"><LabUploadPanel /></TabsContent>
      <TabsContent value="radiology"><RadiologyUploadPanel /></TabsContent>
    </Tabs>
  </DashboardLayout>
);

export default TechnicianUpload;
