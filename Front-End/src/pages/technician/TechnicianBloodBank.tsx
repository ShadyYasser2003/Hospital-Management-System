import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import {
  useBloodUnits,
  useAddBloodUnit,
  useUpdateBloodUnit,
  useBloodRequests,
  useFulfillBloodRequest,
  useCancelBloodRequest,
} from '@/hooks/useBloodBank';
import { BloodUnitDto, BloodRequestDto } from '@/services/bloodBankService';
import {
  BLOOD_TYPES, URGENCY_LEVELS, UNIT_STATUSES,
  fmtBloodType, fmtUrgency, fmtDateTime, daysUntilExpiry,
  urgencyColor, inventorySummary,
} from '@/lib/bloodBankUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  LayoutDashboard, ClipboardList, Upload, User, Bell,
  Plus, Edit, Droplets, CheckCircle, XCircle, AlertCircle, Package, RefreshCw,
} from 'lucide-react';

// ── nav (extends existing technician nav) ────────────────────────────────────
export const techBloodBankNavItems = [
  { label: 'Dashboard',      path: '/technician',               icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Test Requests',  path: '/technician/requests',      icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'Blood Bank',     path: '/technician/blood-bank',    icon: <Droplets className="h-5 w-5" /> },
  { label: 'Upload Reports', path: '/technician/upload',        icon: <Upload className="h-5 w-5" /> },
  { label: 'Notifications',  path: '/technician/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'Profile',        path: '/technician/profile',       icon: <User className="h-5 w-5" /> },
];

// ── small helpers ─────────────────────────────────────────────────────────────
const UrgencyBadge = ({ urgency }: { urgency?: string }) => (
  <span className={`text-xs font-medium px-2 py-0.5 rounded border ${urgencyColor(urgency)}`}>
    {fmtUrgency(urgency)}
  </span>
);

const ExpiryChip = ({ expiryDate }: { expiryDate?: string }) => {
  const days = daysUntilExpiry(expiryDate);
  if (days === null) return <span className="text-muted-foreground text-xs">—</span>;
  if (days < 0)   return <Badge variant="destructive">Expired</Badge>;
  if (days <= 7)  return <Badge variant="destructive">{days}d</Badge>;
  if (days <= 30) return <Badge className="bg-yellow-500 text-white">{days}d</Badge>;
  return <span className="text-xs text-muted-foreground">{expiryDate}</span>;
};

// ── forms ─────────────────────────────────────────────────────────────────────
const emptyUnitForm = { bloodType: '', quantity: '', expiryDate: '', notes: '', status: 'AVAILABLE' };
type UnitForm = typeof emptyUnitForm;

// ─────────────────────────────────────────────────────────────────────────────

const TechnicianBloodBank: React.FC = () => {
  const { data: units = [],    isLoading: ldUnits,    refetch: refetchUnits }    = useBloodUnits();
  const { data: requests = [], isLoading: ldRequests, refetch: refetchRequests } = useBloodRequests();
  const addUnit    = useAddBloodUnit();
  const updateUnit = useUpdateBloodUnit();
  const fulfill    = useFulfillBloodRequest();
  const cancel     = useCancelBloodRequest();

  const [addOpen,    setAddOpen]    = useState(false);
  const [editOpen,   setEditOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState<BloodUnitDto | null>(null);
  const [unitForm,   setUnitForm]   = useState<UnitForm>(emptyUnitForm);
  const [editForm,   setEditForm]   = useState<UnitForm>(emptyUnitForm);

  const summary        = useMemo(() => inventorySummary(units), [units]);
  const totalAvailable = Object.values(summary).reduce((a, b) => a + b, 0);
  const pendingReqs    = requests.filter(r => r.status === 'PENDING');
  const reservedReqs   = requests.filter(r => r.status === 'RESERVED');

  // ── unit handlers ─────────────────────────────────────────────────────────
  const handleAddUnit = async () => {
    if (!unitForm.bloodType) { toast.error('Blood type required'); return; }
    const qty = parseInt(unitForm.quantity);
    if (!qty || qty <= 0)   { toast.error('Quantity must be > 0'); return; }
    try {
      await addUnit.mutateAsync({
        bloodType:  unitForm.bloodType,
        quantity:   qty,
        expiryDate: unitForm.expiryDate || undefined,
        notes:      unitForm.notes || undefined,
      });
      toast.success('Blood unit added');
      setAddOpen(false);
      setUnitForm(emptyUnitForm);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  const openEdit = (u: BloodUnitDto) => {
    setEditTarget(u);
    setEditForm({
      bloodType:  u.bloodType ?? '',
      quantity:   String(u.quantity ?? ''),
      expiryDate: u.expiryDate ?? '',
      notes:      u.notes ?? '',
      status:     u.status ?? 'AVAILABLE',
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    const qty = parseInt(editForm.quantity);
    if (isNaN(qty) || qty < 0) { toast.error('Invalid quantity'); return; }
    try {
      await updateUnit.mutateAsync({
        id: editTarget.id,
        payload: {
          quantity:   qty,
          expiryDate: editForm.expiryDate || undefined,
          status:     editForm.status,
          notes:      editForm.notes || undefined,
        },
      });
      toast.success('Unit updated');
      setEditOpen(false);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  // ── request handlers ──────────────────────────────────────────────────────
  const handleFulfill = async (r: BloodRequestDto) => {
    try {
      await fulfill.mutateAsync(r.id);
      toast.success(`Request #${r.id} completed — units marked USED`);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  const handleCancel = async (r: BloodRequestDto) => {
    try {
      await cancel.mutateAsync(r.id);
      toast.success(`Request #${r.id} cancelled — units released`);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  // ── columns ───────────────────────────────────────────────────────────────
  const unitCols = [
    { key: 'bloodType', header: 'Type',    render: (u: BloodUnitDto) => <span className="font-bold text-red-600">{fmtBloodType(u.bloodType)}</span> },
    { key: 'quantity',  header: 'Qty',     render: (u: BloodUnitDto) => <span className="font-medium">{u.quantity}</span> },
    { key: 'expiryDate',header: 'Expires', render: (u: BloodUnitDto) => <ExpiryChip expiryDate={u.expiryDate} /> },
    { key: 'status',    header: 'Status',  render: (u: BloodUnitDto) => <StatusBadge status={u.status?.toLowerCase()} /> },
    { key: 'notes',     header: 'Notes',   render: (u: BloodUnitDto) => <span className="text-xs text-muted-foreground">{u.notes?.slice(0, 40) ?? '—'}</span> },
    { key: 'actions',   header: '',        render: (u: BloodUnitDto) => (
      <Button variant="ghost" size="sm" onClick={() => openEdit(u)}><Edit className="h-4 w-4" /></Button>
    )},
  ];

  const reqCols = [
    { key: 'id',          header: '#',         render: (r: BloodRequestDto) => <span className="text-muted-foreground text-xs">#{r.id}</span> },
    { key: 'patientName', header: 'Patient' },
    { key: 'bloodType',   header: 'Blood Type', render: (r: BloodRequestDto) => <span className="font-bold text-red-600">{fmtBloodType(r.bloodType)}</span> },
    { key: 'quantity',    header: 'Qty',        render: (r: BloodRequestDto) => `${r.quantity}u` },
    { key: 'urgency',     header: 'Urgency',    render: (r: BloodRequestDto) => <UrgencyBadge urgency={r.urgency} /> },
    { key: 'status',      header: 'Status',     render: (r: BloodRequestDto) => <StatusBadge status={r.status?.toLowerCase()} /> },
    { key: 'requestedByName', header: 'Doctor' },
    { key: 'createdAt',   header: 'Date',       render: (r: BloodRequestDto) => fmtDateTime(r.createdAt) },
    { key: 'actions',     header: 'Actions',    render: (r: BloodRequestDto) => (
      <div className="flex gap-1">
        {r.status === 'RESERVED' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 px-2">
                <CheckCircle className="h-3.5 w-3.5 mr-1" />Dispense
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Dispense Blood Units</AlertDialogTitle>
                <AlertDialogDescription>
                  Confirm dispensing {r.quantity} unit(s) of {fmtBloodType(r.bloodType)} to {r.patientName}?
                  Blood units will be marked USED.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Back</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleFulfill(r)} className="bg-green-600 hover:bg-green-700">
                  Confirm Dispense
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {(r.status === 'PENDING' || r.status === 'RESERVED') && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 h-7 px-2">
                <XCircle className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Request</AlertDialogTitle>
                <AlertDialogDescription>
                  Cancel request #{r.id}?
                  {r.status === 'RESERVED' && ' Reserved units will return to AVAILABLE.'}
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

  const isLoading = ldUnits || ldRequests;

  return (
    <DashboardLayout navItems={techBloodBankNavItems} title="Blood Bank">
      <PageHeader
        title="Blood Bank"
        description="Manage inventory and process transfusion requests"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { refetchUnits(); refetchRequests(); }}>
              <RefreshCw className="h-4 w-4 mr-2" />Refresh
            </Button>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Add Blood Unit</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Blood Unit</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Blood Type <span className="text-destructive">*</span></Label>
                    <Select value={unitForm.bloodType} onValueChange={v => setUnitForm(p => ({ ...p, bloodType: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                      <SelectContent>{BLOOD_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quantity <span className="text-destructive">*</span></Label>
                    <Input type="number" min={1} value={unitForm.quantity}
                      onChange={e => setUnitForm(p => ({ ...p, quantity: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Expiry Date</Label>
                    <Input type="date" value={unitForm.expiryDate}
                      onChange={e => setUnitForm(p => ({ ...p, expiryDate: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea rows={2} value={unitForm.notes}
                      onChange={e => setUnitForm(p => ({ ...p, notes: e.target.value }))} />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddUnit} disabled={addUnit.isPending}>
                      {addUnit.isPending ? 'Adding…' : 'Add Unit'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={o => { setEditOpen(o); if (!o) setEditTarget(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Unit — {fmtBloodType(editTarget?.bloodType)}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Quantity</Label>
              <Input type="number" min={0} value={editForm.quantity}
                onChange={e => setEditForm(p => ({ ...p, quantity: e.target.value }))} />
            </div>
            <div>
              <Label>Expiry Date</Label>
              <Input type="date" value={editForm.expiryDate}
                onChange={e => setEditForm(p => ({ ...p, expiryDate: e.target.value }))} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={editForm.status} onValueChange={v => setEditForm(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{UNIT_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea rows={2} value={editForm.notes}
                onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={updateUnit.isPending}>
                {updateUnit.isPending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Available"    value={totalAvailable}      icon={<Droplets className="h-6 w-6" />} variant="primary" />
          <StatCard title="Pending Requests"   value={pendingReqs.length}  icon={<AlertCircle className="h-6 w-6" />} variant="warning" />
          <StatCard title="Ready to Dispense"  value={reservedReqs.length} icon={<Package className="h-6 w-6" />} variant="accent" />
          <StatCard title="Blood Types Stocked" value={Object.keys(summary).length} icon={<ClipboardList className="h-6 w-6" />} variant="success" />
        </div>
      )}

      {/* Quick inventory summary */}
      {!isLoading && (
        <div className="flex flex-wrap gap-2 mb-4">
          {BLOOD_TYPES.map(bt => {
            const qty = summary[bt.value] ?? 0;
            return (
              <span key={bt.value} className={`px-3 py-1 rounded-full text-sm font-semibold border
                ${qty === 0  ? 'bg-red-100 text-red-700 border-red-300' :
                  qty < 5    ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                               'bg-green-50 text-green-700 border-green-200'}`}>
                {bt.label}: {qty}
              </span>
            );
          })}
        </div>
      )}

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests" className="gap-2">
            <ClipboardList className="h-4 w-4" />Requests
            {reservedReqs.length > 0 && <Badge className="bg-green-600 text-white ml-1">{reservedReqs.length}</Badge>}
            {pendingReqs.length > 0  && <Badge variant="destructive" className="ml-1">{pendingReqs.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2">
            <Droplets className="h-4 w-4" />Inventory ({units.length})
          </TabsTrigger>
        </TabsList>

        {/* Requests tab */}
        <TabsContent value="requests">
          <Tabs defaultValue="reserved">
            <TabsList>
              <TabsTrigger value="reserved">
                Ready to Dispense ({reservedReqs.length})
                {reservedReqs.length > 0 && <Badge className="bg-green-600 text-white ml-1">{reservedReqs.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({pendingReqs.length})
              </TabsTrigger>
              <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="reserved">
              <Card><CardContent className="pt-4">
                {isLoading ? <Skeleton className="h-32 w-full" /> :
                  <DataTable
                    data={reservedReqs.map(r => ({ ...r, id: String(r.id) }))}
                    columns={reqCols as never}
                    emptyMessage="No reserved requests — all clear!"
                  />}
              </CardContent></Card>
            </TabsContent>
            <TabsContent value="pending">
              <Card><CardContent className="pt-4">
                {isLoading ? <Skeleton className="h-32 w-full" /> :
                  <DataTable
                    data={pendingReqs.map(r => ({ ...r, id: String(r.id) }))}
                    columns={reqCols as never}
                    emptyMessage="No pending requests"
                  />}
              </CardContent></Card>
            </TabsContent>
            <TabsContent value="all">
              <Card><CardContent className="pt-4">
                {isLoading ? <Skeleton className="h-32 w-full" /> :
                  <DataTable
                    data={requests.map(r => ({ ...r, id: String(r.id) }))}
                    columns={reqCols as never}
                    emptyMessage="No requests found"
                  />}
              </CardContent></Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Inventory tab */}
        <TabsContent value="inventory">
          <Card><CardContent className="pt-4">
            {isLoading ? <Skeleton className="h-32 w-full" /> :
              <DataTable
                data={units.map(u => ({ ...u, id: String(u.id) }))}
                columns={unitCols as never}
                emptyMessage="No blood units in inventory"
              />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default TechnicianBloodBank;
