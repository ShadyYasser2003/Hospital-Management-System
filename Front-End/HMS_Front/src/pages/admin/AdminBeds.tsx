import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useData } from '@/contexts/DataContext';
import { AdmissionRequest } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminNavItems } from '@/constants/adminNavItems';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, BedDouble, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBeds } from '@/hooks/useBeds';
import { BedDto } from '@/services/bedService';

const priorityVariant: Record<string, string> = {
  normal: 'secondary',
  urgent: 'outline',
  emergency: 'destructive',
};

const AdminBeds = () => {
  const { data: beds = [] } = useBeds();
  const { wards, admissionRequests, updateAdmissionRequest, updateBed, updatePatient, addNotification } = useData();
  const { toast } = useToast();

  const [approveDialog, setApproveDialog] = useState<{ open: boolean; request: AdmissionRequest | null }>({ open: false, request: null });
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; request: AdmissionRequest | null }>({ open: false, request: null });
  const [selectedBedId, setSelectedBedId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const pendingRequests = admissionRequests.filter(r => r.status === 'pending');
  const availableBeds = beds.filter(b => b.status === 'available');

  const bedColumns = [
    { key: 'bedNumber', header: 'Bed Number' },
    { key: 'wardName', header: 'Ward' },
    { key: 'status', header: 'Status', render: (bed: BedDto) => <StatusBadge status={bed.status?.toLowerCase() as never} /> },
    { key: 'patientName', header: 'Patient', render: (bed: BedDto) => bed.patientName || '-' },
  ];

  const handleApprove = () => {
    if (!approveDialog.request || !selectedBedId) return;
    const bed = beds.find(b => b.id === selectedBedId);
    if (!bed) return;

    updateAdmissionRequest(approveDialog.request.id, {
      status: 'approved',
      bedId: bed.id,
      bedNumber: bed.bedNumber,
    });

    updateBed(bed.id, {
      status: 'occupied',
      patientId: approveDialog.request.patientId,
      patientName: approveDialog.request.patientName,
    });

    updatePatient(approveDialog.request.patientId, { status: 'admitted' });

    addNotification({
      userId: approveDialog.request.doctorId,
      title: 'Admission Request Approved',
      message: `Admission request for ${approveDialog.request.patientName} has been approved. Assigned bed: ${bed.bedNumber}`,
      type: 'success',
      read: false,
    });

    toast({ title: 'Approved', description: `Bed ${bed.bedNumber} assigned to ${approveDialog.request.patientName}` });
    setApproveDialog({ open: false, request: null });
    setSelectedBedId('');
  };

  const handleReject = () => {
    if (!rejectDialog.request) return;
    const req = rejectDialog.request;

    updateAdmissionRequest(req.id, {
      status: 'rejected',
      rejectionReason,
    });

    addNotification({
      userId: req.doctorId,
      title: 'Admission Request Rejected',
      message: `Admission request for ${req.patientName} has been rejected. Reason: ${rejectionReason || 'Not specified'}`,
      type: 'error',
      read: false,
    });

    toast({ title: 'Rejected', description: `Admission request for ${req.patientName} was rejected`, variant: 'destructive' });
    setRejectDialog({ open: false, request: null });
    setRejectionReason('');
  };

  const requestColumns = [
    { key: 'patientName', header: 'Patient' },
    { key: 'doctorName', header: 'Doctor' },
    { key: 'wardPreference', header: 'Preferred Ward', render: (r: AdmissionRequest) => r.wardPreference || '-' },
    { key: 'reason', header: 'Reason' },
    { key: 'priority', header: 'Priority', render: (r: AdmissionRequest) => (
      <Badge variant={priorityVariant[r.priority] as any}>
        {r.priority.charAt(0).toUpperCase() + r.priority.slice(1)}
      </Badge>
    )},
    { key: 'requestDate', header: 'Request Date' },
    { key: 'actions', header: 'Actions', render: (r: AdmissionRequest) => (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => { setApproveDialog({ open: true, request: r }); setSelectedBedId(''); }}>
          <CheckCircle className="h-4 w-4 mr-1" /> Approve
        </Button>
        <Button size="sm" variant="destructive" onClick={() => { setRejectDialog({ open: true, request: r }); setRejectionReason(''); }}>
          <XCircle className="h-4 w-4 mr-1" /> Reject
        </Button>
      </div>
    )},
  ];

  return (
    <DashboardLayout navItems={adminNavItems} title="Beds & Wards">
      <PageHeader title="Beds & Wards Management" description="Manage hospital beds and admission requests" />

      {/* Ward Summary */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        {wards.map((ward) => (
          <Card key={ward.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{ward.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{ward.availableBeds}/{ward.totalBeds}</p>
              <p className="text-sm text-muted-foreground">Available beds</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Admission Requests */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Pending Admission Requests
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingRequests.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No pending admission requests</p>
          ) : (
            <DataTable data={pendingRequests} columns={requestColumns} />
          )}
        </CardContent>
      </Card>

      {/* Beds Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BedDouble className="h-5 w-5 text-primary" />
            Bed Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable data={beds} columns={bedColumns} />
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={approveDialog.open} onOpenChange={(open) => setApproveDialog({ open, request: open ? approveDialog.request : null })}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Approve Admission Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Patient: <span className="font-medium text-foreground">{approveDialog.request?.patientName}</span></p>
              <p className="text-sm text-muted-foreground">Reason: <span className="font-medium text-foreground">{approveDialog.request?.reason}</span></p>
              <p className="text-sm text-muted-foreground">Preferred Ward: <span className="font-medium text-foreground">{approveDialog.request?.wardPreference || '-'}</span></p>
            </div>
            <div className="space-y-2">
              <Label>Select Bed</Label>
              <Select value={selectedBedId} onValueChange={setSelectedBedId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an available bed..." />
                </SelectTrigger>
                <SelectContent>
                  {availableBeds.map(bed => (
                    <SelectItem key={bed.id} value={bed.id}>
                      {bed.bedNumber} — {bed.wardName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableBeds.length === 0 && (
                <p className="text-sm text-destructive">No available beds at the moment</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialog({ open: false, request: null })}>Cancel</Button>
            <Button onClick={handleApprove} disabled={!selectedBedId}>
              <CheckCircle className="h-4 w-4 mr-1" /> Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, request: open ? rejectDialog.request : null })}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Reject Admission Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">Patient: <span className="font-medium text-foreground">{rejectDialog.request?.patientName}</span></p>
            <div className="space-y-2">
              <Label>Rejection Reason (optional)</Label>
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, request: null })}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject}>
              <XCircle className="h-4 w-4 mr-1" /> Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminBeds;
