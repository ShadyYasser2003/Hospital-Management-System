import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { doctorNavItems } from './DoctorDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { TestRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Plus, Eye, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

const testTypes = [
  'Blood Panel', 'CBC', 'Lipid Profile', 'Liver Function', 'Kidney Function',
  'Thyroid Panel', 'Glucose Test', 'Urinalysis', 'X-Ray', 'CT Scan', 
  'MRI Scan', 'Ultrasound', 'ECG', 'EEG', 'Colonoscopy'
];

const DoctorTests = () => {
  const { user } = useAuth();
  const { patients, testRequests, addTestRequest, addNotification, getUsersByRole } = useData();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestRequest | null>(null);
  
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [testType, setTestType] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');

  const doctorTests = user ? testRequests.filter(t => t.doctorId === user.id) : [];
  const pendingTests = doctorTests.filter(t => t.status === 'pending' || t.status === 'acknowledged');
  const inProgressTests = doctorTests.filter(t => t.status === 'in-progress');
  const completedTests = doctorTests.filter(t => t.status === 'completed');
  const technicians = getUsersByRole('technician');

  const handleCreateTest = () => {
    if (!selectedPatientId) {
      toast.error('Please select a patient');
      return;
    }
    
    if (!testType) {
      toast.error('Please select a test type');
      return;
    }

    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient || !user) return;

    addTestRequest({
      patientId: patient.id,
      patientName: patient.name,
      doctorId: user.id,
      doctorName: user.name,
      testType,
      priority,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0],
    });

    // Notify all technicians
    technicians.forEach(tech => {
      addNotification({
        userId: tech.id,
        title: 'New Test Request',
        message: `${priority === 'urgent' ? '🚨 URGENT: ' : ''}New ${testType} request for ${patient.name} from ${user.name}`,
        type: priority === 'urgent' ? 'warning' : 'info',
        read: false,
        role: 'technician',
      });
    });

    toast.success('Test request sent to lab');
    setDialogOpen(false);
    setSelectedPatientId('');
    setTestType('');
    setPriority('normal');
  };

  const viewTest = (test: TestRequest) => {
    setSelectedTest(test);
    setViewDialogOpen(true);
  };

  const columns = [
    { key: 'patientName', header: 'Patient' },
    { key: 'testType', header: 'Test Type' },
    { key: 'requestDate', header: 'Request Date' },
    { 
      key: 'priority', 
      header: 'Priority', 
      render: (t: TestRequest) => (
        <span className={`capitalize ${t.priority === 'urgent' ? 'text-destructive font-semibold' : ''}`}>
          {t.priority}
        </span>
      )
    },
    { key: 'status', header: 'Status', render: (t: TestRequest) => <StatusBadge status={t.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (t: TestRequest) => (
        <Button variant="ghost" size="sm" onClick={() => viewTest(t)}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout navItems={doctorNavItems} title="Test Requests">
      <PageHeader 
        title="Lab & Imaging Requests" 
        description="Request and track diagnostic tests"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Test Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Diagnostic Test</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label>Select Patient</Label>
                  <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient..." />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} - {p.nationalId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Test Type</Label>
                  <Select value={testType} onValueChange={setTestType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select test type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {testTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Priority</Label>
                  <RadioGroup value={priority} onValueChange={(v) => setPriority(v as 'normal' | 'urgent')} className="flex gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="normal" id="normal" />
                      <Label htmlFor="normal" className="font-normal">Normal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="urgent" id="urgent" />
                      <Label htmlFor="urgent" className="font-normal text-destructive">Urgent</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateTest}>Send Request</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending ({pendingTests.length})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({inProgressTests.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <DataTable data={pendingTests} columns={columns} emptyMessage="No pending test requests" />
        </TabsContent>

        <TabsContent value="in-progress">
          <DataTable data={inProgressTests} columns={columns} emptyMessage="No tests in progress" />
        </TabsContent>

        <TabsContent value="completed">
          <DataTable data={completedTests} columns={columns} emptyMessage="No completed tests" />
        </TabsContent>
      </Tabs>

      {/* View Test Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Request Details</DialogTitle>
          </DialogHeader>
          {selectedTest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Patient:</span> {selectedTest.patientName}</div>
                <div><span className="text-muted-foreground">Test Type:</span> {selectedTest.testType}</div>
                <div><span className="text-muted-foreground">Request Date:</span> {selectedTest.requestDate}</div>
                <div><span className="text-muted-foreground">Priority:</span> <span className="capitalize">{selectedTest.priority}</span></div>
                <div className="col-span-2"><span className="text-muted-foreground">Status:</span> <StatusBadge status={selectedTest.status} /></div>
              </div>
              
              {selectedTest.status === 'completed' && (
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="font-medium">Results</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedTest.results || 'Results available in attached report'}</p>
                    {selectedTest.reportUrl && (
                      <Button variant="outline" size="sm" className="mt-2">
                        View Full Report
                      </Button>
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
