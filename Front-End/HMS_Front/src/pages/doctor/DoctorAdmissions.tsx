import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { doctorNavItems } from './DoctorDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { AdmissionRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Plus, Bed } from 'lucide-react';

const DoctorAdmissions = () => {
  const { user } = useAuth();
  const { patients, admissionRequests, addAdmissionRequest, wards } = useData();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent' | 'emergency'>('normal');
  const [wardPreference, setWardPreference] = useState('');

  const doctorAdmissions = user ? admissionRequests.filter(a => a.doctorId === user.id) : [];

  const handleCreateAdmission = () => {
    if (!selectedPatientId) {
      toast.error('Please select a patient');
      return;
    }
    
    if (!reason.trim()) {
      toast.error('Please enter admission reason');
      return;
    }

    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient || !user) return;

    addAdmissionRequest({
      patientId: patient.id,
      patientName: patient.name,
      doctorId: user.id,
      doctorName: user.name,
      reason,
      priority,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      wardPreference,
    });

    toast.success('Admission request submitted');
    setDialogOpen(false);
    setSelectedPatientId('');
    setReason('');
    setPriority('normal');
    setWardPreference('');
  };

  const columns = [
    { key: 'patientName', header: 'Patient' },
    { key: 'reason', header: 'Reason', render: (a: AdmissionRequest) => <span className="line-clamp-1">{a.reason}</span> },
    { key: 'requestDate', header: 'Request Date' },
    { 
      key: 'priority', 
      header: 'Priority', 
      render: (a: AdmissionRequest) => (
        <span className={`capitalize ${a.priority === 'emergency' ? 'text-destructive font-bold' : a.priority === 'urgent' ? 'text-warning font-semibold' : ''}`}>
          {a.priority}
        </span>
      )
    },
    { key: 'wardPreference', header: 'Ward Preference', render: (a: AdmissionRequest) => a.wardPreference || 'Any' },
    { key: 'status', header: 'Status', render: (a: AdmissionRequest) => <StatusBadge status={a.status} /> },
  ];

  return (
    <DashboardLayout navItems={doctorNavItems} title="Admissions">
      <PageHeader 
        title="Admission Requests" 
        description="Request patient admissions and bed allocations"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Request Admission
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bed className="h-5 w-5" />
                  Request Patient Admission
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
                  <Label>Reason for Admission</Label>
                  <Textarea
                    placeholder="Enter reason for admission..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Priority</Label>
                  <RadioGroup value={priority} onValueChange={(v) => setPriority(v as 'normal' | 'urgent' | 'emergency')} className="flex gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="normal" id="p-normal" />
                      <Label htmlFor="p-normal" className="font-normal">Normal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="urgent" id="p-urgent" />
                      <Label htmlFor="p-urgent" className="font-normal text-warning">Urgent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="emergency" id="p-emergency" />
                      <Label htmlFor="p-emergency" className="font-normal text-destructive">Emergency</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Ward Preference (Optional)</Label>
                  <Select value={wardPreference} onValueChange={setWardPreference}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ward..." />
                    </SelectTrigger>
                    <SelectContent>
                      {wards.map((ward) => (
                        <SelectItem key={ward.id} value={ward.name}>
                          {ward.name} ({ward.availableBeds} available)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateAdmission}>Submit Request</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable data={doctorAdmissions} columns={columns} emptyMessage="No admission requests" />
    </DashboardLayout>
  );
};

export default DoctorAdmissions;
