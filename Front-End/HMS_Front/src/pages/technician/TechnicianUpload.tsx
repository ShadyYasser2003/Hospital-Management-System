import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useTestRequestsByTechnician, useCompleteTest } from '@/hooks/useTestRequests';
import { TestRequestDto } from '@/services/testRequestService';
import testRequestService from '@/services/testRequestService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { LayoutDashboard, ClipboardList, Upload, User, Bell, FileUp, FileText, CheckCircle } from 'lucide-react';

const navItems = [
  { label: 'Dashboard',     path: '/technician',               icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Test Requests', path: '/technician/requests',      icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'Upload Reports',path: '/technician/upload',        icon: <Upload className="h-5 w-5" /> },
  { label: 'Notifications', path: '/technician/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'Profile',       path: '/technician/profile',       icon: <User className="h-5 w-5" /> },
];

const TechnicianUpload = () => {
  const { user } = useAuth();
  const { data: techPage } = useTestRequestsByTechnician(user?.id);
  const completeTest = useCompleteTest();

  const tests = techPage?.content ?? [];
  const eligible = tests.filter(t => ['ACKNOWLEDGED', 'IN_PROGRESS'].includes(t.status?.toUpperCase()));
  const recentCompleted = tests
    .filter(t => t.status?.toUpperCase() === 'COMPLETED')
    .sort((a, b) => new Date(b.completedAt ?? '').getTime() - new Date(a.completedAt ?? '').getTime())
    .slice(0, 5);

  const [selectedId, setSelectedId]       = useState('');
  const [reportContent, setReportContent] = useState('');
  const [chargeAmount, setChargeAmount]   = useState('75');
  const [file, setFile]                   = useState<File | null>(null);
  const [uploading, setUploading]         = useState(false);

  const selectedRequest = tests.find(r => String(r.id) === selectedId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId)           { toast.error('Please select a test request'); return; }
    if (!reportContent.trim()) { toast.error('Please enter report content'); return; }
    if (!chargeAmount || parseFloat(chargeAmount) <= 0) { toast.error('Please enter a valid charge'); return; }

    setUploading(true);
    try {
      let reportUrl = `report_${selectedId}.pdf`;

      // Upload file if selected
      if (file) {
        const result = await testRequestService.uploadReport(selectedId, file);
        reportUrl = result.reportUrl;
      }

      await completeTest.mutateAsync({
        id: Number(selectedId),
        results: reportContent,
        reportUrl,
        charges: parseFloat(chargeAmount),
      });

      toast.success('Report submitted — charges sent to billing');
      setSelectedId('');
      setReportContent('');
      setChargeAmount('75');
      setFile(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to submit report');
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Upload Reports">
      <PageHeader title="Upload Diagnostic Reports" description="Upload test results and send charges to billing" />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Upload Report</CardTitle>
              <CardDescription>Select a test request and upload the diagnostic report</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label>Select Test Request *</Label>
                  <Select value={selectedId} onValueChange={setSelectedId}>
                    <SelectTrigger><SelectValue placeholder="Select a test request" /></SelectTrigger>
                    <SelectContent>
                      {eligible.length === 0
                        ? <SelectItem value="none" disabled>No requests available</SelectItem>
                        : eligible.map(r => (
                          <SelectItem key={r.id} value={String(r.id)}>
                            {r.testType} — {r.patientName} ({r.status})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedRequest && (
                  <div className="p-4 bg-muted/50 rounded-lg grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-muted-foreground">Patient</p><p className="font-medium">{selectedRequest.patientName}</p></div>
                    <div><p className="text-muted-foreground">Test Type</p><p className="font-medium">{selectedRequest.testType}</p></div>
                    <div><p className="text-muted-foreground">Doctor</p><p className="font-medium">{selectedRequest.doctorName}</p></div>
                    <div><p className="text-muted-foreground">Priority</p>
                      <p className={`font-medium ${selectedRequest.priority?.toUpperCase() === 'URGENT' ? 'text-destructive' : ''}`}>
                        {selectedRequest.priority}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <Label>Upload File (Optional)</Label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">PDF, DOC, or image files accepted (max 20MB)</p>
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
                  <Input type="number" value={chargeAmount} onChange={(e) => setChargeAmount(e.target.value)} min="0" step="0.01" required />
                </div>

                <Button type="submit" className="w-full" disabled={!selectedId || uploading || completeTest.isPending}>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading || completeTest.isPending ? 'Submitting...' : 'Submit Report & Send Charges'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />Recent Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentCompleted.length === 0
                ? <p className="text-muted-foreground text-sm text-center py-4">No recent reports</p>
                : (
                  <div className="space-y-3">
                    {recentCompleted.map(r => (
                      <div key={r.id} className="p-3 rounded-lg border bg-card">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">{r.testType}</p>
                            <p className="text-xs text-muted-foreground">{r.patientName}</p>
                          </div>
                          <CheckCircle className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                          <span>{r.completedAt?.split('T')[0]}</span>
                          <span className="font-medium text-foreground">{r.charges ? `$${r.charges}` : '—'}</span>
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
