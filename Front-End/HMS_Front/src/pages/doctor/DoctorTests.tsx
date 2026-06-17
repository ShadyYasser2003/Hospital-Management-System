import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { doctorNavItems } from './DoctorDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { usePatients } from '@/hooks/usePatients';
import { useTestRequestsByDoctor, useCreateTestRequest } from '@/hooks/useTestRequests';
import { TestRequestDto } from '@/services/testRequestService';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Eye, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

const TEST_TYPES = [
  'Blood Panel', 'CBC', 'Lipid Profile', 'Liver Function', 'Kidney Function',
  'Thyroid Panel', 'Glucose Test', 'Urinalysis', 'X-Ray', 'CT Scan',
  'MRI Scan', 'Ultrasound', 'ECG', 'EEG', 'Colonoscopy',
];

const DoctorTests = () => {
  const { user } = useAuth();
  const { data: patients = [] }                                = usePatients();
  const { data: tests = [], isLoading }                        = useTestRequestsByDoctor(user?.id);
  const createTest = useCreateTestRequest();

  const [dialogOpen, setDialogOpen]           = useState(false);
  const [viewDialogOpen, setViewDialogOpen]   = useState(false);
  const [selectedTest, setSelectedTest]       = useState<TestRequestDto | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [testType, setTestType]               = useState('');
  const [priority, setPriority]               = useState<'NORMAL' | 'URGENT'>('NORMAL');
  const [description, setDescription]         = useState('');
  const [charges, setCharges]                 = useState('');

  const pending   = tests.filter(t => ['PENDING', 'ACKNOWLEDGED'].includes(t.status?.toUpperCase()));
  const inProgress = tests.filter(t => t.status?.toUpperCase() === 'IN_PROGRESS');
  const completed  = tests.filter(t => t.status?.toUpperCase() === 'COMPLETED');

  const handleCreate = async () => {
    if (!selectedPatientId) { toast.error('Select a patient'); return; }
    if (!testType)          { toast.error('Select a test type'); return; }
    if (!user?.id)          return;

    try {
      await createTest.mutateAsync({
        patientId: Number(selectedPatientId),
        doctorId: Number(user.id),
        testType,
        priority,
        description: description || undefined,
        charges: charges ? Number(charges) : undefined,
      });
      toast.success('Test request sent to lab');
      setDialogOpen(false);
      setSelectedPatientId('');
      setTestType('');
      setPriority('NORMAL');
      setDescription('');
      setCharges('');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  const columns = [
    { key: 'patientName', header: 'Patient' },
    { key: 'testType',    header: 'Test Type' },
    { key: 'description', header: 'Description', render: (t: TestRequestDto) => t.description ? <span className="text-sm text-muted-foreground">{t.description.substring(0, 40)}{t.description.length > 40 ? '…' : ''}</span> : '—' },
    { key: 'requestedAt', header: 'Requested', render: (t: TestRequestDto) => t.requestedAt?.split('T')[0] },
    { key: 'charges',     header: 'Charges', render: (t: TestRequestDto) => t.charges != null ? `$${t.charges}` : '—' },
    { key: 'priority',    header: 'Priority', render: (t: TestRequestDto) => (
      <span className={t.priority?.toUpperCase() === 'URGENT' ? 'text-destructive font-semibold' : ''}>{t.priority}</span>
    )},
    { key: 'status', header: 'Status', render: (t: TestRequestDto) => <StatusBadge status={t.status?.toLowerCase() as never} /> },
    { key: 'actions', header: 'Actions', render: (t: TestRequestDto) => (
      <Button variant="ghost" size="sm" onClick={() => { setSelectedTest(t); setViewDialogOpen(true); }}>
        <Eye className="h-4 w-4" />
      </Button>
    )},
  ];

  return (
    <DashboardLayout navItems={doctorNavItems} title="Test Requests">
      <PageHeader
        title="Lab & Imaging Requests"
        description="Request and track diagnostic tests"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Test Request</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Request Diagnostic Test</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Patient</Label>
                  <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger><SelectValue placeholder="Select patient..." /></SelectTrigger>
                    <SelectContent>
                      {patients.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name} — {p.nationalId}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Test Type</Label>
                  <Select value={testType} onValueChange={setTestType}>
                    <SelectTrigger><SelectValue placeholder="Select test type..." /></SelectTrigger>
                    <SelectContent>
                      {TEST_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <RadioGroup value={priority} onValueChange={(v) => setPriority(v as 'NORMAL' | 'URGENT')} className="flex gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="NORMAL" id="normal" />
                      <Label htmlFor="normal" className="font-normal">Normal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="URGENT" id="urgent" />
                      <Label htmlFor="urgent" className="font-normal text-destructive">Urgent</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Additional details about the test..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Estimated Charges</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 150.00"
                    value={charges}
                    onChange={(e) => setCharges(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreate} disabled={createTest.isPending}>
                    {createTest.isPending ? 'Sending...' : 'Send Request'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading && <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}

      {!isLoading && (
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress ({inProgress.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            <DataTable data={pending} columns={columns} emptyMessage="No pending test requests" />
          </TabsContent>
          <TabsContent value="in-progress">
            <DataTable data={inProgress} columns={columns} emptyMessage="No tests in progress" />
          </TabsContent>
          <TabsContent value="completed">
            <DataTable data={completed} columns={columns} emptyMessage="No completed tests" />
          </TabsContent>
        </Tabs>
      )}

      {/* View Test Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Test Request Details</DialogTitle></DialogHeader>
          {selectedTest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Patient:</span> {selectedTest.patientName}</div>
                <div><span className="text-muted-foreground">Test Type:</span> {selectedTest.testType}</div>
                <div><span className="text-muted-foreground">Requested:</span> {selectedTest.requestedAt?.split('T')[0]}</div>
                <div><span className="text-muted-foreground">Priority:</span> <span className="capitalize">{selectedTest.priority}</span></div>
                <div><span className="text-muted-foreground">Technician:</span> {selectedTest.technicianName ?? 'Not assigned'}</div>
                <div><span className="text-muted-foreground">Charges:</span> {selectedTest.charges != null ? `$${selectedTest.charges}` : '—'}</div>
                {selectedTest.description && (
                  <div className="col-span-2"><span className="text-muted-foreground">Description:</span> {selectedTest.description}</div>
                )}
                <div className="col-span-2"><span className="text-muted-foreground">Status:</span> <StatusBadge status={selectedTest.status?.toLowerCase() as never} /></div>
              </div>
              {selectedTest.status?.toUpperCase() === 'COMPLETED' && (
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="font-medium">Results</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedTest.results || 'Results available in attached report'}</p>
                    {selectedTest.reportUrl && (
                      <a href={selectedTest.reportUrl} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" className="mt-2">View Full Report</Button>
                      </a>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DoctorTests;
