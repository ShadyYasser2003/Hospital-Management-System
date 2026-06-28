import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LayoutDashboard, Pill, Package, FileText, User,
  Search, Eye, AlertCircle, CheckCircle, ShoppingCart,
} from 'lucide-react';
import { usePrescriptions, useDispensePrescription } from '@/hooks/usePrescriptions';
import { PrescriptionDto } from '@/services/prescriptionService';
import { toast } from 'sonner';

const navItems = [
  { label: 'Dashboard',    path: '/pharmacist',               icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Inventory',    path: '/pharmacist/inventory',     icon: <Package className="h-5 w-5" /> },
  { label: 'Prescriptions',path: '/pharmacist/prescriptions', icon: <FileText className="h-5 w-5" /> },
  { label: 'Dispense',     path: '/pharmacist/dispense',      icon: <Pill className="h-5 w-5" /> },
  { label: 'Profile',      path: '/pharmacist/profile',       icon: <User className="h-5 w-5" /> },
];

const PharmacistPrescriptions = () => {
  const { data: prescriptions = [], isLoading, error } = usePrescriptions();
  const dispense = useDispensePrescription();

  const [searchQuery, setSearchQuery]         = useState('');
  const [viewRx, setViewRx]                   = useState<PrescriptionDto | null>(null);
  const [confirmRx, setConfirmRx]             = useState<PrescriptionDto | null>(null);

  const pending   = prescriptions.filter(p => p.status?.toUpperCase() === 'PENDING');
  const dispensed = prescriptions.filter(p => p.status?.toUpperCase() === 'DISPENSED');

  const filtered = (list: PrescriptionDto[]) =>
    list.filter(p =>
      p.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  const handleDispense = async () => {
    if (!confirmRx) return;
    try {
      await dispense.mutateAsync(confirmRx.id);
      toast.success(`Prescription for ${confirmRx.patientName} dispensed — charges added to invoice`);
      setConfirmRx(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to dispense');
    }
  };

  // ── Prescription row ───────────────────────────────────────────────────────
  const RxCard = ({ rx, showDispense }: { rx: PrescriptionDto; showDispense: boolean }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/30 transition-all">
      <div className="min-w-0">
        <p className="font-semibold text-sm">{rx.patientName}</p>
        <p className="text-xs text-muted-foreground">Dr. {rx.doctorName} · {rx.prescriptionDate}</p>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {rx.items?.slice(0, 3).map((item, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {item.medicineName} ×{item.quantity}
            </Badge>
          ))}
          {(rx.items?.length ?? 0) > 3 && (
            <Badge variant="outline" className="text-xs">+{(rx.items?.length ?? 0) - 3} more</Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4 shrink-0">
        <StatusBadge status={rx.status?.toLowerCase() as never} />
        <Button variant="ghost" size="sm" onClick={() => setViewRx(rx)}>
          <Eye className="h-4 w-4" />
        </Button>
        {showDispense && (
          <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => setConfirmRx(rx)}>
            <ShoppingCart className="h-3.5 w-3.5" />Dispense
          </Button>
        )}
      </div>
    </div>
  );

  if (isLoading) return (
    <DashboardLayout navItems={navItems} title="Prescriptions">
      <PageHeader title="Prescriptions" description="Review and dispense prescribed medications" />
      <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout navItems={navItems} title="Prescriptions">
      <PageHeader title="Prescriptions" description="Review and dispense prescribed medications" />
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error instanceof Error ? error.message : 'Failed to load prescriptions'}</AlertDescription>
      </Alert>
    </DashboardLayout>
  );

  return (
    <DashboardLayout navItems={navItems} title="Prescriptions">
      <PageHeader title="Prescriptions" description="Review and dispense prescribed medications" />

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pending.length})
            {pending.length > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">{pending.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="dispensed">Dispensed ({dispensed.length})</TabsTrigger>
        </TabsList>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by patient or doctor…" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>

        <TabsContent value="pending">
          <Card><CardContent className="pt-6">
            {filtered(pending).length === 0
              ? <p className="text-center text-muted-foreground py-8">No pending prescriptions</p>
              : <div className="space-y-3">
                  {filtered(pending).map(rx => <RxCard key={rx.id} rx={rx} showDispense={true} />)}
                </div>
            }
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="dispensed">
          <Card><CardContent className="pt-6">
            {filtered(dispensed).length === 0
              ? <p className="text-center text-muted-foreground py-8">No dispensed prescriptions</p>
              : <div className="space-y-3">
                  {filtered(dispensed).map(rx => <RxCard key={rx.id} rx={rx} showDispense={false} />)}
                </div>
            }
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* ── View Details Dialog ── */}
      <Dialog open={!!viewRx} onOpenChange={() => setViewRx(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Prescription Details</DialogTitle></DialogHeader>
          {viewRx && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg">
                <div><p className="text-xs text-muted-foreground">Patient</p><p className="font-medium">{viewRx.patientName}</p></div>
                <div><p className="text-xs text-muted-foreground">Doctor</p><p className="font-medium">{viewRx.doctorName}</p></div>
                <div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{viewRx.prescriptionDate}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={viewRx.status?.toLowerCase() as never} /></div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Medications</h4>
                {viewRx.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{item.medicineName}</p>
                      <p className="text-xs text-muted-foreground">{item.dosage} · {item.frequency} · {item.duration} days</p>
                      {item.instructions && <p className="text-xs text-muted-foreground italic">{item.instructions}</p>}
                    </div>
                    <span className="text-sm text-muted-foreground">×{item.quantity}</span>
                  </div>
                ))}
              </div>
              {viewRx.notes && (
                <div><h4 className="font-medium text-sm mb-1">Notes</h4>
                  <p className="text-sm text-muted-foreground">{viewRx.notes}</p></div>
              )}
              {viewRx.status?.toUpperCase() === 'PENDING' && (
                <Button className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => { setViewRx(null); setConfirmRx(viewRx); }}>
                  <ShoppingCart className="h-4 w-4" />Dispense This Prescription
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Confirm Dispense Dialog ── */}
      <Dialog open={!!confirmRx} onOpenChange={() => setConfirmRx(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Confirm Dispensing</DialogTitle></DialogHeader>
          {confirmRx && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-semibold">{confirmRx.patientName}</p>
                <p className="text-sm text-muted-foreground">Prescribed by Dr. {confirmRx.doctorName}</p>
              </div>
              <div className="space-y-2">
                {confirmRx.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm p-2 border rounded">
                    <span className="font-medium">{item.medicineName}</span>
                    <span className="text-muted-foreground">×{item.quantity} · {item.dosage}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 p-3 rounded-lg">
                Dispensing will mark this prescription as dispensed and automatically add
                medication charges to the patient's invoice.
                The nurse will then be notified to administer the medications.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setConfirmRx(null)} className="flex-1">Cancel</Button>
                <Button onClick={handleDispense} className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={dispense.isPending}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {dispense.isPending ? 'Dispensing…' : 'Confirm Dispense'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PharmacistPrescriptions;
