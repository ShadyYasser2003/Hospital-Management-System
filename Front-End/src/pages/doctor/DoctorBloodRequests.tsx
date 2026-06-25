import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { usePatients } from '@/hooks/usePatients';
import { useBloodRequests, useCreateBloodRequest, useCancelBloodRequest } from '@/hooks/useBloodBank';
import { BloodRequestDto } from '@/services/bloodBankService';
import {
  BLOOD_TYPES, URGENCY_LEVELS,
  fmtBloodType, fmtUrgency, fmtDateTime, urgencyColor,
} from '@/lib/bloodBankUtils';
import { doctorNavItems } from './DoctorDashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Droplets, XCircle, AlertCircle, Eye, RefreshCw } from 'lucide-react';

// ── Urgency badge ─────────────────────────────────────────────────────────────
const UrgencyBadge = ({ urgency }: { urgency?: string }) => (
  <span className={`text-xs font-medium px-2 py-0.5 rounded border ${urgencyColor(urgency)}`}>
    {fmtUrgency(urgency)}
  </span>
);

// ── Auto-reserve result banner ────────────────────────────────────────────────
const ReserveResultBanner = ({ status }: { status: string }) => {
  if (status === 'RESERVED') return (
    <Alert className="border-green-300 bg-green-50">
      <AlertDescription className="text-green-800 font-medium">
        ✅ Blood units were automatically reserved from stock. The request is ready to be fulfilled.
      </AlertDescription>
    </Alert>
  );
  if (status === 'PENDING') return (
    <Alert className="border-yellow-300 bg-yellow-50">
      <AlertDescription className="text-yellow-800 font-medium">
        ⏳ Insufficient stock. The request is pending — blood bank staff will be notified.
      </AlertDescription>
    </Alert>
  );
  return null;
};

const emptyForm = { patientId: '', bloodType: '', quantity: '', urgency: 'MEDIUM', notes: '' };
type RequestForm = typeof emptyForm;

// ─────────────────────────────────────────────────────────────────────────────

const DoctorBloodRequests: React.FC = () => {
  const { user }              = useAuth();
  const { data: patients = [] } = usePatients();
  const { data: allRequests = [], isLoading, error, refetch } = useBloodRequests();
  const createRequest = useCreateBloodRequest();
  const cancelRequest = useCancelBloodRequest();

  const [addOpen,    setAddOpen]    = useState(false);
  const [viewOpen,   setViewOpen]   = useState(false);
  const [selected,   setSelected]   = useState<BloodRequestDto | null>(null);
  const [form,       setForm]       = useState<RequestForm>(emptyForm);
  const [lastResult, setLastResult] = useState<string | null>(null);

  // Show only this doctor's requests
  const myRequests = allRequests.filter(
    r => String(r.requestedById) === String(user?.id),
  );
  const pendingList   = myRequests.filter(r => r.status === 'PENDING');
  const reservedList  = myRequests.filter(r => r.status === 'RESERVED');
  const completedList = myRequests.filter(r => r.status === 'COMPLETED');
  const cancelledList = myRequests.filter(r => r.status === 'CANCELLED');

  const handleCreate = async () => {
    if (!form.patientId)  { toast.error('Please select a patient'); return; }
    if (!form.bloodType)  { toast.error('Please select a blood type'); return; }
    const qty = parseInt(form.quantity);
    if (!qty || qty <= 0) { toast.error('Quantity must be > 0'); return; }
    if (!user?.id)        { toast.error('Not authenticated'); return; }
    try {
      const result = await createRequest.mutateAsync({
        patientId:    Number(form.patientId),
        requestedById: Number(user.id),
        bloodType:    form.bloodType,
        quantity:     qty,
        urgency:      form.urgency || 'MEDIUM',
        notes:        form.notes || undefined,
      });
      setLastResult(result.status);
      setAddOpen(false);
      setForm(emptyForm);
      toast.success(
        result.status === 'RESERVED'
          ? 'Request created — units auto-reserved!'
          : 'Request created — awaiting stock availability',
      );
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  const handleCancel = async (r: BloodRequestDto) => {
    try {
      await cancelRequest.mutateAsync(r.id);
      toast.success(`Request #${r.id} cancelled`);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  const cols = [
    { key: 'patientName', header: 'Patient' },
    { key: 'bloodType',   header: 'Blood Type', render: (r: BloodRequestDto) => (
      <span className="font-semibold text-red-600">{fmtBloodType(r.bloodType)}</span>
    )},
    { key: 'quantity',    header: 'Qty',         render: (r: BloodRequestDto) => `${r.quantity} units` },
    { key: 'urgency',     header: 'Urgency',     render: (r: BloodRequestDto) => <UrgencyBadge urgency={r.urgency} /> },
    { key: 'status',      header: 'Status',      render: (r: BloodRequestDto) => <StatusBadge status={r.status?.toLowerCase()} /> },
    { key: 'createdAt',   header: 'Requested',   render: (r: BloodRequestDto) => fmtDateTime(r.createdAt) },
    { key: 'actions',     header: 'Actions',     render: (r: BloodRequestDto) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => { setSelected(r); setViewOpen(true); }}>
          <Eye className="h-4 w-4" />
        </Button>
        {(r.status === 'PENDING' || r.status === 'RESERVED') && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
                <XCircle className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Request</AlertDialogTitle>
                <AlertDialogDescription>
                  Cancel blood request #{r.id} for {r.patientName}?
                  {r.status === 'RESERVED' && ' Reserved units will be released back to inventory.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleCancel(r)} className="bg-destructive hover:bg-destructive/90">Cancel</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    )},
  ];

  return (
    <DashboardLayout navItems={doctorNavItems} title="Blood Bank">
      <PageHeader
        title="Blood Requests"
        description="Request blood units for patients"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />Refresh
            </Button>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Request Blood</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Blood Request</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Patient <span className="text-destructive">*</span></Label>
                    <Select value={form.patientId} onValueChange={v => setForm(p => ({ ...p, patientId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select patient…" /></SelectTrigger>
                      <SelectContent>
                        {patients.map(pt => (
                          <SelectItem key={pt.id} value={String(pt.id)}>
                            {pt.name} — {pt.nationalId}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Blood Type <span className="text-destructive">*</span></Label>
                      <Select value={form.bloodType} onValueChange={v => setForm(p => ({ ...p, bloodType: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                        <SelectContent>
                          {BLOOD_TYPES.map(bt => <SelectItem key={bt.value} value={bt.value}>{bt.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Quantity <span className="text-destructive">*</span></Label>
                      <Input type="number" min={1} value={form.quantity}
                        onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
                        placeholder="Units needed" />
                    </div>
                  </div>
                  <div>
                    <Label>Urgency</Label>
                    <Select value={form.urgency} onValueChange={v => setForm(p => ({ ...p, urgency: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {URGENCY_LEVELS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea value={form.notes} rows={2}
                      onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                      placeholder="Clinical context or special requirements…" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={createRequest.isPending}>
                      <Droplets className="h-4 w-4 mr-2" />
                      {createRequest.isPending ? 'Sending…' : 'Send Request'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Show last request outcome */}
      {lastResult && (
        <div className="mb-4">
          <ReserveResultBanner status={lastResult} />
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load requests. Try refreshing.</AlertDescription>
        </Alert>
      )}

      {isLoading
        ? <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        : (
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({myRequests.length})</TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({pendingList.length})
                {pendingList.length > 0 && <Badge variant="destructive" className="ml-1">{pendingList.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="reserved">Reserved ({reservedList.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedList.length})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled ({cancelledList.length})</TabsTrigger>
            </TabsList>
            {[
              { value: 'all',       data: myRequests,   empty: 'No blood requests found' },
              { value: 'pending',   data: pendingList,  empty: 'No pending requests' },
              { value: 'reserved',  data: reservedList, empty: 'No reserved requests' },
              { value: 'completed', data: completedList,empty: 'No completed requests' },
              { value: 'cancelled', data: cancelledList,empty: 'No cancelled requests' },
            ].map(tab => (
              <TabsContent key={tab.value} value={tab.value}>
                <DataTable
                  data={tab.data.map(r => ({ ...r, id: String(r.id) }))}
                  columns={cols as never}
                  emptyMessage={tab.empty}
                />
              </TabsContent>
            ))}
          </Tabs>
        )
      }

      {/* Detail dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Blood Request Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  ['Patient',    selected.patientName],
                  ['Doctor',     selected.requestedByName],
                  ['Blood Type', fmtBloodType(selected.bloodType)],
                  ['Quantity',   `${selected.quantity} units`],
                  ['Urgency',    fmtUrgency(selected.urgency)],
                  ['Requested',  fmtDateTime(selected.createdAt)],
                  ['Fulfilled',  fmtDateTime(selected.fulfilledAt)],
                ].map(([label, value]) => (
                  <React.Fragment key={label}>
                    <span className="font-medium text-muted-foreground">{label}</span>
                    <span className={label === 'Blood Type' ? 'font-bold text-red-600' : ''}>{value}</span>
                  </React.Fragment>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="font-medium text-muted-foreground">Status</span>
                <StatusBadge status={selected.status?.toLowerCase()} />
              </div>
              {selected.notes && (
                <div>
                  <span className="font-medium text-muted-foreground block mb-1">Notes</span>
                  <p className="text-sm bg-muted rounded p-2">{selected.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DoctorBloodRequests;
