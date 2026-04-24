import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { doctorNavItems } from './DoctorDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { MedicalReport } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Eye, FileText } from 'lucide-react';

const DoctorReports = () => {
  const { user } = useAuth();
  const { patients, medicalReports, addMedicalReport, addNotification } = useData();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [reportType, setReportType] = useState<'diagnosis' | 'lab' | 'imaging' | 'operation'>('diagnosis');
  const [findings, setFindings] = useState('');
  const [recommendations, setRecommendations] = useState('');

  const doctorReports = user ? medicalReports.filter(r => r.doctorId === user.id) : [];

  const handleCreateReport = () => {
    if (!selectedPatientId) {
      toast.error('Please select a patient');
      return;
    }
    
    if (!findings.trim()) {
      toast.error('Please enter findings');
      return;
    }

    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient || !user) return;

    addMedicalReport({
      patientId: patient.id,
      patientName: patient.name,
      doctorId: user.id,
      doctorName: user.name,
      type: reportType,
      date: new Date().toISOString().split('T')[0],
      findings,
      recommendations,
    });

    // Notify patient
    if (patient.userId) {
      addNotification({
        userId: patient.userId,
        title: 'New Medical Report',
        message: `${user.name} has added a new ${reportType} report to your medical records.`,
        type: 'info',
        read: false,
      });
    }

    toast.success('Medical report created');
    setDialogOpen(false);
    setSelectedPatientId('');
    setReportType('diagnosis');
    setFindings('');
    setRecommendations('');
  };

  const viewReport = (report: MedicalReport) => {
    setSelectedReport(report);
    setViewDialogOpen(true);
  };

  const columns = [
    { key: 'patientName', header: 'Patient' },
    { key: 'type', header: 'Type', render: (r: MedicalReport) => <span className="capitalize">{r.type}</span> },
    { key: 'date', header: 'Date' },
    { key: 'findings', header: 'Findings', render: (r: MedicalReport) => <span className="line-clamp-1">{r.findings}</span> },
    {
      key: 'actions',
      header: 'Actions',
      render: (r: MedicalReport) => (
        <Button variant="ghost" size="sm" onClick={() => viewReport(r)}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout navItems={doctorNavItems} title="Medical Reports">
      <PageHeader 
        title="Medical Reports" 
        description="Create and manage patient medical reports"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Create Medical Report
                </DialogTitle>
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
                  <Label>Report Type</Label>
                  <Select value={reportType} onValueChange={(v) => setReportType(v as typeof reportType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diagnosis">Diagnosis</SelectItem>
                      <SelectItem value="lab">Lab Report</SelectItem>
                      <SelectItem value="imaging">Imaging Report</SelectItem>
                      <SelectItem value="operation">Operation Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Findings</Label>
                  <Textarea
                    placeholder="Enter findings..."
                    value={findings}
                    onChange={(e) => setFindings(e.target.value)}
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Recommendations (Optional)</Label>
                  <Textarea
                    placeholder="Enter recommendations..."
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateReport}>Create Report</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable data={doctorReports} columns={columns} emptyMessage="No medical reports" />

      {/* View Report Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Medical Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Patient:</span> {selectedReport.patientName}</div>
                <div><span className="text-muted-foreground">Type:</span> <span className="capitalize">{selectedReport.type}</span></div>
                <div><span className="text-muted-foreground">Date:</span> {selectedReport.date}</div>
                <div><span className="text-muted-foreground">Doctor:</span> {selectedReport.doctorName}</div>
              </div>
              <div>
                <p className="font-medium mb-1">Findings:</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedReport.findings}</p>
              </div>
              {selectedReport.recommendations && (
                <div>
                  <p className="font-medium mb-1">Recommendations:</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedReport.recommendations}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DoctorReports;
