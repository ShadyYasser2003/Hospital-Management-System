import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { adminNavItems } from '@/constants/adminNavItems';
import {
  useBloodUnits,
  useAddBloodUnit,
  useUpdateBloodUnit,
  useBloodRequests,
  useFulfillBloodRequest,
  useCancelBloodRequest,
  useBloodDonations,
  useRecordBloodDonation,
} from '@/hooks/useBloodBank';
import { BloodUnitDto, BloodRequestDto, BloodDonationDto } from '@/services/bloodBankService';
import { usePatients } from '@/hooks/usePatients';
import {
  BLOOD_TYPES, URGENCY_LEVELS, UNIT_STATUSES,
  fmtBloodType, fmtUrgency, fmtDateTime, daysUntilExpiry, urgencyColor, inventorySummary,
} from '@/lib/bloodBankUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Plus, Edit, Droplets, CheckCircle, XCircle, AlertCircle,
  Package, ClipboardList, Heart,
} from 'lucide-react';

// ── helper: urgency badge ─────────────────────────────────────────────────────
const UrgencyBadge = ({ urgency }: { urgency?: string }) => (
  <span className={`text-xs font-medium px-2 py-0.5 rounded border ${urgencyColor(urgency)}`}>
    {fmtUrgency(urgency)}
  </span>
);

// ── helper: expiry chip ───────────────────────────────────────────────────────
const ExpiryChip = ({ expiryDate }: { expiryDate?: string }) => {
  const days = daysUntilExpiry(expiryDate);
  if (days === null) return <span className="text-muted-foreground text-xs">—</span>;
  if (days < 0)  return <Badge variant="destructive">Expired</Badge>;
  if (days <= 7) return <Badge variant="destructive">{days}d</Badge>;
  if (days <= 30) return <Badge className="bg-yellow-500 text-white">{days}d</Badge>;
  return <span className="text-xs text-muted-foreground">{expiryDate}</span>;
};

// ── empty unit form ───────────────────────────────────────────────────────────
const emptyUnitForm = { bloodType: '', quantity: '', expiryDate: '', notes: '', status: 'AVAILABLE' };
type UnitForm = typeof emptyUnitForm;

const emptyDonation: BloodDonationDto = {
  donorName: '', donorPhone: '', donorNationalId: '',
  bloodType: '', quantity: 1, notes: '',
  donationType: 'GENERAL', targetPatientId: undefined,
};

// ─────────────────────────────────────────────────────────────────────────────

const AdminBloodBank: React.FC = () => {
  const { data: units = [],    isLoading: ldUnits,    error: errUnits,    refetch: refetchUnits }    = useBloodUnits();
  const { data: requests = [], isLoading: ldRequests, error: errRequests, refetch: refetchRequests } = useBloodRequests();
  const { data: donations = [], refetch: refetchDonations } = useBloodDonations();
  const { data: patients = [] } = usePatients();
  const addUnit     = useAddBloodUnit();
  const updateUnit  = useUpdateBloodUnit();
  const fulfill     = useFulfillBloodRequest();
  const cancel      = useCancelBloodRequest();
  const recordDonation = useRecordBloodDonation();

  // ── dialogs ─────────────────────────────────────────────────────────────────
  const [addOpen,      setAddOpen]      = useState(false);
  const [editOpen,     setEditOpen]     = useState(false);
  const [editTarget,   setEditTarget]   = useState<BloodUnitDto | null>(null);
  const [unitForm,     setUnitForm]     = useState<UnitForm>(emptyUnitForm);
  const [editForm,     setEditForm]     = useState<UnitForm>(emptyUnitForm);
  const [donationOpen, setDonationOpen] = useState(false);
  const [donationForm, setDonationForm] = useState<BloodDonationDto>(emptyDonation);

  // ── search ──────────────────────────────────────────────────────────────────
  const [unitSearch, setUnitSearch] = useState('');
  const [reqSearch,  setReqSearch]  = useState('');

  // ── derived data ─────────────────────────────────────────────────────────────
  const summary = useMemo(() => inventorySummary(units), [units]);
  const totalAvailable = Object.values(summary).reduce((a, b) => a + b, 0);
  const pendingCount   = requests.filter(r => r.status === 'PENDING').length;
  const reservedCount  = requests.filter(r => r.status === 'RESERVED').length;

  const filteredUnits    = units.filter(u =>
    fmtBloodType(u.bloodType).toLowerCase().includes(unitSearch.toLowerCase()) ||
    u.status?.toLowerCase().includes(unitSearch.toLowerCase()),
  );
  const filteredRequests = requests.filter(r =>
    r.patientName?.toLowerCase().includes(reqSearch.toLowerCase()) ||
    fmtBloodType(r.bloodType).toLowerCase().includes(reqSearch.toLowerCase()) ||
    r.status?.toLowerCase().includes(reqSearch.toLowerCase()),
  );

  // ── handlers: units ──────────────────────────────────────────────────────────
  const handleAddUnit = async () => {
    if (!unitForm.bloodType) { toast.error('Blood type is required'); return; }
    const qty = parseInt(unitForm.quantity);
    if (!qty || qty <= 0) { toast.error('Quantity must be > 0'); return; }
    try {
      await addUnit.mutateAsync({
        bloodType: unitForm.bloodType,
        quantity: qty,
        expiryDate: unitForm.expiryDate || undefined,
        notes: unitForm.notes || undefined,
      });
      toast.success('Blood unit added to inventory');
      setAddOpen(false);
      setUnitForm(emptyUnitForm);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  const openEdit = (u: BloodUnitDto) => {
    setEditTarget(u);
    setEditForm({
      bloodType: u.bloodType ?? '',
      quantity:  String(u.quantity ?? ''),
      expiryDate: u.expiryDate ?? '',
      notes:     u.notes ?? '',
      status:    u.status ?? 'AVAILABLE',
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
      toast.success('Blood unit updated');
      setEditOpen(false);
      setEditTarget(null);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  // ── handlers: requests ────────────────────────────────────────────────────────
  const handleFulfill = async (req: BloodRequestDto) => {
    try {
      await fulfill.mutateAsync(req.id);
      toast.success(`Request #${req.id} completed — units marked as used`);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  const handleCancel = async (req: BloodRequestDto) => {
    try {
      await cancel.mutateAsync(req.id);
      toast.success(`Request #${req.id} cancelled`);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  // ── handlers: donations ───────────────────────────────────────────────────────
  const handleRecordDonation = async () => {
    if (!donationForm.donorName.trim()) { toast.error('Donor name is required'); return; }
    if (!donationForm.bloodType)        { toast.error('Blood type is required'); return; }
    if (!donationForm.quantity || donationForm.quantity <= 0) { toast.error('Quantity must be > 0'); return; }
    if (donationForm.donationType === 'SPECIFIC_PATIENT' && !donationForm.targetPatientId) {
      toast.error('Please select the target patient'); return;
    }
    try {
      await recordDonation.mutateAsync(donationForm);
      toast.success(
        donationForm.donationType === 'SPECIFIC_PATIENT'
          ? `Donation recorded — units reserved for ${patients.find(p => p.id === donationForm.targetPatientId)?.name}`
          : 'Donation recorded — units added to general inventory',
      );
      setDonationOpen(false);
      setDonationForm(emptyDonation);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to record donation'); }
  };

  // ── table columns ─────────────────────────────────────────────────────────────
  const unitCols = [
    { key: 'bloodType', header: 'Blood Type', render: (u: BloodUnitDto) => (
      <span className="font-semibold text-red-600">{fmtBloodType(u.bloodType)}</span>
    )},
    { key: 'quantity',   header: 'Quantity',   render: (u: BloodUnitDto) => (
      <span className="font-medium">{u.quantity} units</span>
    )},
    { key: 'expiryDate', header: 'Expires',    render: (u: BloodUnitDto) => <ExpiryChip expiryDate={u.expiryDate} /> },
    { key: 'status',     header: 'Status',     render: (u: BloodUnitDto) => <StatusBadge status={u.status?.toLowerCase()} /> },
    { key: 'notes',      header: 'Notes',      render: (u: BloodUnitDto) => (
      <span className="text-sm text-muted-foreground">{u.notes ? u.notes.slice(0, 40) : '—'}</span>
    )},
    { key: 'actions', header: 'Actions', render: (u: BloodUnitDto) => (
      <Button variant="ghost" size="sm" onClick={() => openEdit(u)}>
        <Edit className="h-4 w-4" />
      </Button>
    )},
  ];

  const reqCols = [
    { key: 'id',           header: '#',          render: (r: BloodRequestDto) => <span className="text-muted-foreground text-xs">#{r.id}</span> },
    { key: 'patientName',  header: 'Patient' },
    { key: 'bloodType',    header: 'Blood Type',  render: (r: BloodRequestDto) => (
      <span className="font-semibold text-red-600">{fmtBloodType(r.bloodType)}</span>
    )},
    { key: 'quantity',     header: 'Qty',         render: (r: BloodRequestDto) => `${r.quantity} u` },
    { key: 'urgency',      header: 'Urgency',     render: (r: BloodRequestDto) => <UrgencyBadge urgency={r.urgency} /> },
    { key: 'status',       header: 'Status',      render: (r: BloodRequestDto) => <StatusBadge status={r.status?.toLowerCase()} /> },
    { key: 'requestedByName', header: 'Doctor' },
    { key: 'createdAt',    header: 'Requested',   render: (r: BloodRequestDto) => fmtDateTime(r.createdAt) },
    { key: 'actions',      header: 'Actions',     render: (r: BloodRequestDto) => (
      <div className="flex gap-1">
        {r.status === 'RESERVED' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" className="text-green-700 border-green-300 hover:bg-green-50">
                <CheckCircle className="h-3.5 w-3.5 mr-1" />Complete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Complete Blood Request</AlertDialogTitle>
                <AlertDialogDescription>
                  Mark request #{r.id} as completed? Blood units will be marked as USED.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleFulfill(r)} className="bg-green-600 hover:bg-green-700">
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {(r.status === 'PENDING' || r.status === 'RESERVED') && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                <XCircle className="h-3.5 w-3.5 mr-1" />Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Request</AlertDialogTitle>
                <AlertDialogDescription>
                  Cancel request #{r.id}? If units were reserved they will be released back to inventory.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleCancel(r)} className="bg-destructive hover:bg-destructive/90">
                  Cancel Request
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    )},
  ];

  const isLoading = ldUnits || ldRequests;

  return (
    <DashboardLayout navItems={adminNavItems} title="Blood Bank">
      <PageHeader
        title="Blood Bank Management"
        description="Manage blood inventory and transfusion requests"
        action={
          <div className="flex gap-2">
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Add Blood Unit</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Blood Unit to Inventory</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Blood Type <span className="text-destructive">*</span></Label>
                    <Select value={unitForm.bloodType} onValueChange={v => setUnitForm(p => ({ ...p, bloodType: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select blood type..." /></SelectTrigger>
                      <SelectContent>{BLOOD_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quantity (units) <span className="text-destructive">*</span></Label>
                    <Input type="number" min={1} value={unitForm.quantity}
                      onChange={e => setUnitForm(p => ({ ...p, quantity: e.target.value }))}
                      placeholder="e.g. 10" />
                  </div>
                  <div>
                    <Label>Expiry Date</Label>
                    <Input type="date" value={unitForm.expiryDate}
                      onChange={e => setUnitForm(p => ({ ...p, expiryDate: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea value={unitForm.notes} rows={2}
                      onChange={e => setUnitForm(p => ({ ...p, notes: e.target.value }))}
                      placeholder="Donor info, bag number…" />
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

      {/* Edit unit dialog */}
      <Dialog open={editOpen} onOpenChange={o => { setEditOpen(o); if (!o) setEditTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Blood Unit — {fmtBloodType(editTarget?.bloodType)}</DialogTitle>
          </DialogHeader>
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
              <Textarea value={editForm.notes} rows={2}
                onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={updateUnit.isPending}>
                {updateUnit.isPending ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stat cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Available Units" value={totalAvailable} icon={<Droplets className="h-6 w-6" />} variant="primary" />
          <StatCard title="Pending Requests"      value={pendingCount}   icon={<ClipboardList className="h-6 w-6" />} variant="warning" />
          <StatCard title="Reserved Requests"     value={reservedCount}  icon={<Package className="h-6 w-6" />} variant="accent" />
          <StatCard title="Blood Types in Stock"  value={Object.keys(summary).length} icon={<AlertCircle className="h-6 w-6" />} variant="success" />
        </div>
      )}

      {/* Inventory summary badges */}
      {!isLoading && Object.keys(summary).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {BLOOD_TYPES.map(bt => {
            const qty = summary[bt.value] ?? 0;
            return qty > 0 ? (
              <span key={bt.value} className={`px-3 py-1 rounded-full text-sm font-semibold border
                ${qty < 5 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                {bt.label}: {qty}
              </span>
            ) : null;
          })}
        </div>
      )}

      {(errUnits || errRequests) && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load data. Try refreshing.</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="inventory">
        <TabsList>
          <TabsTrigger value="inventory" className="gap-2">
            <Droplets className="h-4 w-4" />Inventory ({units.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            <ClipboardList className="h-4 w-4" />All Requests ({requests.length})
            {pendingCount > 0 && <Badge variant="destructive" className="ml-1">{pendingCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="donations" className="gap-2">
            <Heart className="h-4 w-4 text-red-500" />Donations ({donations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <div className="mb-3">
            <Input placeholder="Search by blood type or status…" value={unitSearch}
              onChange={e => setUnitSearch(e.target.value)} className="max-w-sm" />
          </div>
          {isLoading
            ? <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            : <DataTable data={filteredUnits.map(u => ({ ...u, id: String(u.id) }))} columns={unitCols as never} emptyMessage="No blood units in inventory" />}
        </TabsContent>

        <TabsContent value="requests">
          <div className="mb-3">
            <Input placeholder="Search by patient, blood type, or status…" value={reqSearch}
              onChange={e => setReqSearch(e.target.value)} className="max-w-sm" />
          </div>
          {isLoading
            ? <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            : (
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All ({filteredRequests.length})</TabsTrigger>
                  <TabsTrigger value="pending">Pending ({filteredRequests.filter(r => r.status === 'PENDING').length})</TabsTrigger>
                  <TabsTrigger value="reserved">Reserved ({filteredRequests.filter(r => r.status === 'RESERVED').length})</TabsTrigger>
                  <TabsTrigger value="completed">Completed ({filteredRequests.filter(r => r.status === 'COMPLETED').length})</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  <DataTable data={filteredRequests.map(r => ({ ...r, id: String(r.id) }))} columns={reqCols as never} emptyMessage="No requests found" />
                </TabsContent>
                <TabsContent value="pending">
                  <DataTable data={filteredRequests.filter(r => r.status === 'PENDING').map(r => ({ ...r, id: String(r.id) }))} columns={reqCols as never} emptyMessage="No pending requests" />
                </TabsContent>
                <TabsContent value="reserved">
                  <DataTable data={filteredRequests.filter(r => r.status === 'RESERVED').map(r => ({ ...r, id: String(r.id) }))} columns={reqCols as never} emptyMessage="No reserved requests" />
                </TabsContent>
                <TabsContent value="completed">
                  <DataTable data={filteredRequests.filter(r => r.status === 'COMPLETED').map(r => ({ ...r, id: String(r.id) }))} columns={reqCols as never} emptyMessage="No completed requests" />
                </TabsContent>
              </Tabs>
            )
          }
        </TabsContent>

        {/* ── Donations Tab ─────────────────────────────────────────────── */}
        <TabsContent value="donations">
          <div className="flex justify-end mb-3">
            <Dialog open={donationOpen} onOpenChange={setDonationOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-red-600 hover:bg-red-700">
                  <Heart className="h-4 w-4" />Record Donation
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />Record Blood Donation
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Donation Type */}
                  <div>
                    <Label>Donation Type *</Label>
                    <Select
                      value={donationForm.donationType}
                      onValueChange={v => setDonationForm(p => ({
                        ...p,
                        donationType: v as 'GENERAL' | 'SPECIFIC_PATIENT',
                        targetPatientId: undefined,
                      }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GENERAL">General Inventory — available for any patient</SelectItem>
                        <SelectItem value="SPECIFIC_PATIENT">Directed — for a specific patient</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Target patient — only when SPECIFIC */}
                  {donationForm.donationType === 'SPECIFIC_PATIENT' && (
                    <div>
                      <Label>Target Patient *</Label>
                      <Select
                        value={donationForm.targetPatientId ? String(donationForm.targetPatientId) : ''}
                        onValueChange={v => setDonationForm(p => ({ ...p, targetPatientId: Number(v) }))}
                      >
                        <SelectTrigger><SelectValue placeholder="Select patient…" /></SelectTrigger>
                        <SelectContent>
                          {patients.map(pt => (
                            <SelectItem key={pt.id} value={String(pt.id)}>
                              {pt.name}{pt.bloodType ? ` (${pt.bloodType})` : ''} — {pt.nationalId}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Donor info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Label>Donor Name *</Label>
                      <Input value={donationForm.donorName}
                        onChange={e => setDonationForm(p => ({ ...p, donorName: e.target.value }))}
                        placeholder="Full name" />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={donationForm.donorPhone ?? ''}
                        onChange={e => setDonationForm(p => ({ ...p, donorPhone: e.target.value }))}
                        placeholder="Phone number" />
                    </div>
                    <div>
                      <Label>National ID</Label>
                      <Input value={donationForm.donorNationalId ?? ''}
                        onChange={e => setDonationForm(p => ({ ...p, donorNationalId: e.target.value }))}
                        placeholder="National ID" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Blood Type *</Label>
                      <Select value={donationForm.bloodType}
                        onValueChange={v => setDonationForm(p => ({ ...p, bloodType: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                        <SelectContent>
                          {BLOOD_TYPES.map(bt => (
                            <SelectItem key={bt.value} value={bt.value}>{bt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Quantity (units) *</Label>
                      <Input type="number" min={1} value={donationForm.quantity}
                        onChange={e => setDonationForm(p => ({ ...p, quantity: Number(e.target.value) }))} />
                    </div>
                  </div>

                  <div>
                    <Label>Notes</Label>
                    <Textarea value={donationForm.notes ?? ''} rows={2}
                      onChange={e => setDonationForm(p => ({ ...p, notes: e.target.value }))}
                      placeholder="Optional notes…" />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setDonationOpen(false)}>Cancel</Button>
                    <Button onClick={handleRecordDonation} disabled={recordDonation.isPending}
                      className="bg-red-600 hover:bg-red-700">
                      <Heart className="h-4 w-4 mr-2" />
                      {recordDonation.isPending ? 'Recording…' : 'Record Donation'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Donations table */}
          <DataTable
            data={donations.map(d => ({ ...d, id: String(d.id) }))}
            columns={[
              { key: 'donorName',   header: 'Donor' },
              { key: 'donorPhone',  header: 'Phone',      render: (d: BloodDonationDto) => d.donorPhone ?? '—' },
              { key: 'bloodType',   header: 'Blood Type', render: (d: BloodDonationDto) => (
                <span className="font-semibold text-red-600">{fmtBloodType(d.bloodType)}</span>
              )},
              { key: 'quantity',    header: 'Units',      render: (d: BloodDonationDto) => `${d.quantity} unit(s)` },
              { key: 'donationType',header: 'Type',       render: (d: BloodDonationDto) => (
                <Badge variant={d.donationType === 'SPECIFIC_PATIENT' ? 'default' : 'secondary'}>
                  {d.donationType === 'SPECIFIC_PATIENT' ? `→ ${d.targetPatientName}` : 'General'}
                </Badge>
              )},
              { key: 'bloodUnitId', header: 'Unit Status', render: (d: BloodDonationDto) => (
                <span className="text-xs text-muted-foreground">
                  {d.donationType === 'SPECIFIC_PATIENT' ? 'Reserved' : 'In Inventory'}
                </span>
              )},
              { key: 'createdAt',   header: 'Date',       render: (d: BloodDonationDto) =>
                d.createdAt ? d.createdAt.split('T')[0] : '—' },
            ] as never}
            emptyMessage="No donations recorded yet"
          />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AdminBloodBank;