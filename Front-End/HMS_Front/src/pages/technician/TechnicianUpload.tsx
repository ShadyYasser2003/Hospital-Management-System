import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { TestRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { LayoutDashboard, ClipboardList, Upload, User, FileUp, FileText, CheckCircle } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/technician', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Test Requests', path: '/technician/requests', icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'Upload Reports', path: '/technician/upload', icon: <Upload className="h-5 w-5" /> },
  { label: 'Profile', path: '/technician/profile', icon: <User className="h-5 w-5" /> },
];

const TechnicianUpload = () => {
  const { user } = useAuth();
  const { testRequests, updateTestRequest, addLabCharge, addNotification } = useData();
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [chargeAmount, setChargeAmount] = useState('75');
  const [fileName, setFileName] = useState('');

  // Get in-progress requests that need reports
  const eligibleRequests = testRequests.filter(
    r => r.status === 'acknowledged' || r.status === 'in-progress'
  );

  const selectedRequest = testRequests.find(r => r.id === selectedRequestId);

  const handleFileSimulation = () => {
    // Simulate file upload
    setFileName(`report_${Date.now()}.pdf`);
    toast.success('File selected (simulated)');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRequestId) {
      toast.error('Please select a test request');
      return;
    }

    if (!reportContent.trim()) {
      toast.error('Please enter report content');
      return;
    }

    if (!chargeAmount || parseFloat(chargeAmount) <= 0) {
      toast.error('Please enter a valid charge amount');
      return;
    }

    const request = testRequests.find(r => r.id === selectedRequestId);
    if (!request) {
      toast.error('Invalid request selected');
      return;
    }

    // Update test request
    updateTestRequest(selectedRequestId, {
      status: 'completed',
      completedDate: new Date().toISOString().split('T')[0],
      results: reportContent,
      reportUrl: fileName || `report_${selectedRequestId}.pdf`,
      charges: parseFloat(chargeAmount),
    });

    // Send charge to accountant
    addLabCharge({
      testRequestId: selectedRequestId,
      patientId: request.patientId,
      patientName: request.patientName,
      testType: request.testType,
      amount: parseFloat(chargeAmount),
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    });

    // Notify Doctor
    addNotification({
      userId: request.doctorId,
      role: 'doctor',
      title: 'Test Report Uploaded',
      message: `${request.testType} report for ${request.patientName} is ready for review`,
      type: 'success',
      read: false,
    });

    // Notify Accountant
    addNotification({
      userId: '',
      role: 'accountant',
      title: 'New Lab Charge',
      message: `Lab charge of $${chargeAmount} pending for ${request.patientName}`,
      type: 'info',
      read: false,
    });

    toast.success('Report uploaded and charges sent successfully');
    
    // Reset form
    setSelectedRequestId('');
    setReportContent('');
    setChargeAmount('75');
    setFileName('');
  };

  // Recent completed reports
  const recentReports = testRequests
    .filter(r => r.status === 'completed')
    .sort((a, b) => new Date(b.completedDate || '').getTime() - new Date(a.completedDate || '').getTime())
    .slice(0, 5);

  return (
    <DashboardLayout navItems={navItems} title="Upload Reports">
      <PageHeader
        title="Upload Diagnostic Reports"
        description="Upload test results and send charges to billing"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Upload Report</CardTitle>
              <CardDescription>
                Select a test request and upload the diagnostic report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label>Select Test Request *</Label>
                  <Select value={selectedRequestId} onValueChange={setSelectedRequestId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a test request" />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleRequests.length === 0 ? (
                        <SelectItem value="" disabled>No requests available</SelectItem>
                      ) : (
                        eligibleRequests.map((request) => (
                          <SelectItem key={request.id} value={request.id}>
                            {request.testType} - {request.patientName} ({request.status})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {selectedRequest && (
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Patient</p>
                        <p className="font-medium">{selectedRequest.patientName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Test Type</p>
                        <p className="font-medium">{selectedRequest.testType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Requesting Doctor</p>
                        <p className="font-medium">{selectedRequest.doctorName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Priority</p>
                        <p className={`font-medium ${selectedRequest.priority === 'urgent' ? 'text-destructive' : ''}`}>
                          {selectedRequest.priority}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label>Upload File (Optional)</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handleFileSimulation} className="flex-1">
                      <FileUp className="h-4 w-4 mr-2" />
                      {fileName || 'Select File'}
                    </Button>
                    {fileName && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => setFileName('')}>
                        ×
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">PDF, DOC, or image files accepted</p>
                </div>

                <div>
                  <Label>Report Content / Results *</Label>
                  <Textarea
                    value={reportContent}
                    onChange={(e) => setReportContent(e.target.value)}
                    placeholder="Enter detailed test results, findings, and observations..."
                    rows={8}
                    required
                  />
                </div>

                <div>
                  <Label>Test Charges ($) *</Label>
                  <Input
                    type="number"
                    value={chargeAmount}
                    onChange={(e) => setChargeAmount(e.target.value)}
                    placeholder="Enter charge amount"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={!selectedRequestId}>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Report & Send Charges
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentReports.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No recent reports</p>
              ) : (
                <div className="space-y-3">
                  {recentReports.map((report) => (
                    <div key={report.id} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{report.testType}</p>
                          <p className="text-xs text-muted-foreground">{report.patientName}</p>
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>{report.completedDate}</span>
                        <span className="font-medium text-foreground">${report.charges}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TechnicianUpload;
