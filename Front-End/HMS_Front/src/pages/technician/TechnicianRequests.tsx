import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import {
  useTestRequestsByTechnician,
  useTestRequestsByStatus,
  useAcknowledgeTest,
  useStartTest,
  useCompleteTest,
  useTakeRequest,
} from '@/hooks/useTestRequests';
import { TestRequestDto } from '@/services/testRequestService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  LayoutDashboard, ClipboardList, Upload, User, Bell,
  CheckCircle, FileText, DollarSign, HandshakeIcon, RefreshCw,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard',     path: '/technician',               icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Test Requests', path: '/technician/requests',      icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'Upload Reports',path: '/technician/upload',        icon: <Upload className="h-5 w-5" /> },
  { label: 'Notifications', path: '/technician/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'Profile',       path: '/technician/profile',       icon: <User className="h-5 w-5" /> },
];

const TechnicianRequests = () => {
  const { user } = useAuth();

  // My assigned requests
  const { data: myPage, isLoading: loadingMine, refetch: refetchMine } =
    useTestRequestsByTechnician(user?.id);

  // All PENDING (unassigned) requests
  const { data: available = [], isLoading: loadingAvailable, refetch: refetchAvailable } =
    useTestRequestsByStatus('PENDING');

  const acknowledgeTest = useAcknowledgeTest();
  const startTest       = useStartTest();
  const completeTest    = useCompleteTest();
  const takeRequest     = useTakeRequest();

  const myTests    = myPage?.content ?? [];
  const inProgress = myTests.filter(t => ['ACKNOWLEDGED', 'IN_PROGRESS'].includes(t.status?.toUpperCase()));
  const completed  = myTests.filter(t => t.status?.toUpperCase() === 'COMPLETED');

  // Filter available: only truly PENDING, not already taken by anyone
  const myIds = new Set(myTests.map(t => t.id));
  const availableFiltered = available.filter(
    t => t.status?.toUpperCase() === 'PENDING' && !myIds.has(t.id)
  );

  const [selectedRequest, setSelectedRequest] = useState<TestRequestDto | null>(null);
  const [reportContent, setReportContent]     = useState('');
  const [chargeAmount, setChargeAmount]       = useState('');
  const [dialogOpen, setDialogOpen]           = useState(false);

  const handleTake = async (r: TestRequestDto) => {
    if (!user?.id) return;
    // Double-check status before calling API
    if (r.status?.toUpperCase() !== 'PENDING') {
      toast.error('This request is no longer available');
      refetchAvailable();
      return;
    }
    try {
      await takeRequest.mutateAsync({ id: r.id, technicianId: Number(user.id) });
      toast.success(`You took the "${r.testType}" request for ${r.patientName}`);
      refetchMine();
      refetchAvailable();
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      // Any error means the request is no longer available — refresh and inform
      toast.error('This request is no longer available. The list has been refreshed.');
      refetchAvailable();
      refetchMine();
    }
  };

  const handleAcknowledge = async (r: TestRequestDto) => {
    try { await acknowledgeTest.mutateAsync(r.id); toast.success('Acknowledged'); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  const handleStart = async (r: TestRequestDto) => {
    try { await startTest.mutateAsync(r.id); toast.success('Test started'); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  const openComplete = (r: TestRequestDto) => {
    setSelectedRequest(r);
    setReportContent('');
    setChargeAmount('75');
    setDialogOpen(true);
  };

  const handleComplete = async () => {
    if (!selectedRequest) return;
    if (!reportContent.trim()) { toast.error('Please enter report content'); return; }
    if (!chargeAmount || parseFloat(chargeAmount) <= 0) { toast.error('Please enter a valid charge'); return; }
    try {
      await completeTest.mutateAsync({
        id: selectedRequest.id,
        results: reportContent,
        reportUrl: `report_${selectedRequest.id}.pdf`,
        charges: parseFloat(chargeAmount),
      });
      toast.success('Test completed — results sent to doctor');
      setDialogOpen(false);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  // ── column definitions ────────────────────────────────────────────────────

  const availableCols = [
    { key: 'testType',    header: 'Test Type' },
    { key: 'patientName', header: 'Patient' },
    { key: 'doctorName',  header: 'Doctor' },
    { key: 'description', header: 'Description', render: (r: TestRequestDto) => r.description ? <span className="text-sm text-muted-foreground">{r.description.substring(0, 40)}{r.description.length > 40 ? '…' : ''}</span> : '—' },
    { key: 'priority',    header: 'Priority', render: (r: TestRequestDto) => (
      <Badge variant={r.priority?.toUpperCase() === 'URGENT' ? 'destructive' : 'secondary'}>
        {r.priority}
      </Badge>
    )},
    { key: 'requestedAt', header: 'Requested', render: (r: TestRequestDto) => r.requestedAt?.split('T')[0] },
    { key: 'actions', header: 'Actions', render: (r: TestRequestDto) => (
      <Button size="sm" className="gap-1.5 bg-primary" onClick={() => handleTake(r)} disabled={takeRequest.isPending}>
        <HandshakeIcon className="h-4 w-4" />Take Request
      </Button>
    )},
  ];

  const inProgressCols = [
    { key: 'testType',    header: 'Test Type' },
    { key: 'patientName', header: 'Patient' },
    { key: 'description', header: 'Description', render: (r: TestRequestDto) => r.description ? <span className="text-sm text-muted-foreground">{r.description.substring(0, 40)}{r.description.length > 40 ? '…' : ''}</span> : '—' },
    { key: 'status',      header: 'Status', render: (r: TestRequestDto) => <StatusBadge status={r.status?.toLowerCase() as never} /> },
    { key: 'requestedAt', header: 'Requested', render: (r: TestRequestDto) => r.requestedAt?.split('T')[0] },
    { key: 'actions', header: 'Actions', render: (r: TestRequestDto) => (
      <div className="flex gap-2">
        {r.status?.toUpperCase() === 'ACKNOWLEDGED' && (
          <Button size="sm" variant="outline" onClick={() => handleStart(r)}>Start</Button>
        )}
        <Button size="sm" onClick={() => openComplete(r)}>
          <Upload className="h-4 w-4 mr-1" />Complete
        </Button>
      </div>
    )},
  ];

  const completedCols = [
    { key: 'testType',    header: 'Test Type' },
    { key: 'patientName', header: 'Patient' },
    { key: 'requestedAt', header: 'Requested', render: (r: TestRequestDto) => r.requestedAt?.split('T')[0] },
    { key: 'completedAt', header: 'Completed',  render: (r: TestRequestDto) => r.completedAt?.split('T')[0] ?? '—' },
    { key: 'charges',     header: 'Charges',    render: (r: TestRequestDto) => r.charges ? `$${r.charges}` : '—' },
    { key: 'actions', header: 'Report', render: (r: TestRequestDto) => (
      <Button size="sm" variant="ghost" onClick={() => { setSelectedRequest(r); setReportContent(r.results ?? ''); setDialogOpen(true); }}>
        <FileText className="h-4 w-4 mr-1" />View
      </Button>
    )},
  ];

  const isLoading = loadingMine || loadingAvailable;

  return (
    <DashboardLayout navItems={navItems} title="Test Requests">
      <PageHeader
        title="Lab & Imaging Requests"
        description="Manage diagnostic test requests"
        action={
          <Button variant="outline" size="sm" onClick={() => { refetchMine(); refetchAvailable(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />Refresh
          </Button>
        }
      />

      {isLoading && <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}

      {!isLoading && (
        <Tabs defaultValue="available">
          <TabsList>
            <TabsTrigger value="available" className="gap-2">
              Available Requests
              {availableFiltered.length > 0 && (
                <Badge variant="destructive" className="ml-1">{availableFiltered.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="mine" className="gap-2">
              My Requests
              {inProgress.length > 0 && (
                <Badge variant="secondary" className="ml-1">{inProgress.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completed.length})
            </TabsTrigger>
          </TabsList>

          {/* ── Available (PENDING, unassigned) ── */}
          <TabsContent value="available">
            <Card>
              <CardContent className="pt-6">
                {availableFiltered.length === 0
                  ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No available requests</p>
                      <p className="text-sm mt-1">New test requests from doctors will appear here</p>
                    </div>
                  )
                  : <DataTable data={availableFiltered} columns={availableCols} />
                }
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── My assigned / in-progress ── */}
          <TabsContent value="mine">
            <Card>
              <CardContent className="pt-6">
                {inProgress.length === 0
                  ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <p>No active requests. Take a request from the Available tab.</p>
                    </div>
                  )
                  : <DataTable data={inProgress} columns={inProgressCols} />
                }
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Completed ── */}
          <TabsContent value="completed">
            <Card>
              <CardContent className="pt-6">
                <DataTable data={completed} columns={completedCols} emptyMessage="No completed tests" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Complete / View Report Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedRequest?.status?.toUpperCase() === 'COMPLETED' ? 'View Report' : 'Complete Test'}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.status?.toUpperCase() === 'COMPLETED'
                ? `Results for ${selectedRequest?.testType} — ${selectedRequest?.patientName}`
                : `Enter results and charges for ${selectedRequest?.testType}`}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg text-sm">
                <div><p className="text-muted-foreground">Test Type</p><p className="font-medium">{selectedRequest.testType}</p></div>
                <div><p className="text-muted-foreground">Patient</p><p className="font-medium">{selectedRequest.patientName}</p></div>
              </div>
              <div>
                <Label>Report / Results *</Label>
                <Textarea
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  placeholder="Enter test results and findings..."
                  rows={6}
                  readOnly={selectedRequest.status?.toUpperCase() === 'COMPLETED'}
                  className={selectedRequest.status?.toUpperCase() === 'COMPLETED' ? 'bg-muted' : ''}
                />
              </div>
              {selectedRequest.status?.toUpperCase() !== 'COMPLETED' && (
                <>
                  <div>
                    <Label>Test Charges ($) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={chargeAmount}
                        onChange={(e) => setChargeAmount(e.target.value)}
                        className="pl-10"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <Button onClick={handleComplete} className="w-full" disabled={completeTest.isPending}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {completeTest.isPending ? 'Completing...' : 'Complete Test & Send Charges'}
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default TechnicianRequests;
