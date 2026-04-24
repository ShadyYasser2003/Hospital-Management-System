import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { TestRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { LayoutDashboard, ClipboardList, Upload, User, CheckCircle, FileText, DollarSign } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/technician', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Test Requests', path: '/technician/requests', icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'Upload Reports', path: '/technician/upload', icon: <Upload className="h-5 w-5" /> },
  { label: 'Profile', path: '/technician/profile', icon: <User className="h-5 w-5" /> },
];

const TechnicianRequests = () => {
  const { user } = useAuth();
  const { testRequests, updateTestRequest, addLabCharge, addNotification } = useData();
  const [selectedRequest, setSelectedRequest] = useState<TestRequest | null>(null);
  const [reportContent, setReportContent] = useState('');
  const [chargeAmount, setChargeAmount] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const pendingRequests = testRequests.filter(r => r.status === 'pending');
  const inProgressRequests = testRequests.filter(r => r.status === 'acknowledged' || r.status === 'in-progress');
  const completedRequests = testRequests.filter(r => r.status === 'completed');

  const handleAcknowledge = (request: TestRequest) => {
    updateTestRequest(request.id, { status: 'acknowledged' });
    toast.success('Test request acknowledged');
  };

  const handleStartTest = (request: TestRequest) => {
    updateTestRequest(request.id, { status: 'in-progress' });
    toast.success('Test started');
  };

  const openCompleteDialog = (request: TestRequest) => {
    if (request.status === 'pending') {
      toast.error('Please acknowledge the request first');
      return;
    }
    setSelectedRequest(request);
    setReportContent('');
    setChargeAmount('75');
    setDialogOpen(true);
  };

  const handleComplete = () => {
    if (!selectedRequest) return;
    
    if (!reportContent.trim()) {
      toast.error('Please enter the report content');
      return;
    }

    if (!chargeAmount || parseFloat(chargeAmount) <= 0) {
      toast.error('Please enter a valid charge amount');
      return;
    }

    // Update test request with results
    updateTestRequest(selectedRequest.id, {
      status: 'completed',
      completedDate: new Date().toISOString().split('T')[0],
      results: reportContent,
      reportUrl: `report_${selectedRequest.id}.pdf`,
      charges: parseFloat(chargeAmount),
    });

    // Send charge to accountant
    addLabCharge({
      testRequestId: selectedRequest.id,
      patientId: selectedRequest.patientId,
      patientName: selectedRequest.patientName,
      testType: selectedRequest.testType,
      amount: parseFloat(chargeAmount),
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    });

    // Notify Doctor
    addNotification({
      userId: selectedRequest.doctorId,
      role: 'doctor',
      title: 'Test Report Ready',
      message: `${selectedRequest.testType} report for ${selectedRequest.patientName} is now available`,
      type: 'success',
      read: false,
    });

    // Notify Accountant
    addNotification({
      userId: '',
      role: 'accountant',
      title: 'New Lab Charge',
      message: `Lab charge of $${chargeAmount} for ${selectedRequest.patientName} - ${selectedRequest.testType}`,
      type: 'info',
      read: false,
    });

    toast.success('Test completed and charges sent to accountant');
    setDialogOpen(false);
    setSelectedRequest(null);
  };

  const pendingColumns = [
    { key: 'testType', header: 'Test Type' },
    { key: 'patientName', header: 'Patient' },
    { key: 'doctorName', header: 'Requesting Doctor' },
    { key: 'priority', header: 'Priority', render: (r: TestRequest) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        r.priority === 'urgent' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
      }`}>
        {r.priority}
      </span>
    )},
    { key: 'requestDate', header: 'Request Date' },
    {
      key: 'actions',
      header: 'Actions',
      render: (request: TestRequest) => (
        <Button size="sm" onClick={() => handleAcknowledge(request)}>
          <CheckCircle className="h-4 w-4 mr-1" />
          Acknowledge
        </Button>
      ),
    },
  ];

  const inProgressColumns = [
    { key: 'testType', header: 'Test Type' },
    { key: 'patientName', header: 'Patient' },
    { key: 'status', header: 'Status', render: (r: TestRequest) => <StatusBadge status={r.status} /> },
    { key: 'requestDate', header: 'Request Date' },
    {
      key: 'actions',
      header: 'Actions',
      render: (request: TestRequest) => (
        <div className="flex gap-2">
          {request.status === 'acknowledged' && (
            <Button size="sm" variant="outline" onClick={() => handleStartTest(request)}>
              Start Test
            </Button>
          )}
          <Button size="sm" onClick={() => openCompleteDialog(request)}>
            <Upload className="h-4 w-4 mr-1" />
            Complete
          </Button>
        </div>
      ),
    },
  ];

  const completedColumns = [
    { key: 'testType', header: 'Test Type' },
    { key: 'patientName', header: 'Patient' },
    { key: 'requestDate', header: 'Requested' },
    { key: 'completedDate', header: 'Completed' },
    { key: 'charges', header: 'Charges', render: (r: TestRequest) => r.charges ? `$${r.charges}` : 'N/A' },
    {
      key: 'actions',
      header: 'Report',
      render: (request: TestRequest) => (
        <Button size="sm" variant="ghost" onClick={() => {
          setSelectedRequest(request);
          setReportContent(request.results || '');
          setDialogOpen(true);
        }}>
          <FileText className="h-4 w-4 mr-1" />
          View
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Test Requests">
      <PageHeader
        title="Lab & Imaging Requests"
        description="Manage diagnostic test requests and upload reports"
      />

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress ({inProgressRequests.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardContent className="pt-6">
              {pendingRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending requests</p>
              ) : (
                <DataTable data={pendingRequests} columns={pendingColumns} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in-progress">
          <Card>
            <CardContent className="pt-6">
              {inProgressRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No tests in progress</p>
              ) : (
                <DataTable data={inProgressRequests} columns={inProgressColumns} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardContent className="pt-6">
              {completedRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No completed tests</p>
              ) : (
                <DataTable data={completedRequests} columns={completedColumns} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Complete/View Report Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedRequest?.status === 'completed' ? 'View Report' : 'Upload Report & Complete Test'}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Test Type</p>
                  <p className="font-medium">{selectedRequest.testType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Patient</p>
                  <p className="font-medium">{selectedRequest.patientName}</p>
                </div>
              </div>

              <div>
                <Label>Report / Results *</Label>
                <Textarea
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  placeholder="Enter test results and findings..."
                  rows={6}
                  readOnly={selectedRequest.status === 'completed'}
                  className={selectedRequest.status === 'completed' ? 'bg-muted' : ''}
                />
              </div>

              {selectedRequest.status !== 'completed' && (
                <>
                  <div>
                    <Label>Test Charges ($) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={chargeAmount}
                        onChange={(e) => setChargeAmount(e.target.value)}
                        placeholder="Enter charge amount"
                        className="pl-10"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <Button onClick={handleComplete} className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Test & Send Charges
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
