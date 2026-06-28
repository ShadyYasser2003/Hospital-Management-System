import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import { useMedicines } from '@/hooks/useMedicines';
import { PrescriptionDto } from '@/services/prescriptionService';
import prescriptionService from '@/services/prescriptionService';
import { useQueryClient } from '@tanstack/react-query';
import { PRESCRIPTIONS_KEY } from '@/hooks/usePrescriptions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { LayoutDashboard, Pill, Package, FileText, User, CheckCircle, AlertTriangle, ShoppingCart } from 'lucide-react';

const navItems = [
  { label: 'Dashboard',    path: '/pharmacist',              icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Inventory',    path: '/pharmacist/inventory',    icon: <Package className="h-5 w-5" /> },
  { label: 'Prescriptions',path: '/pharmacist/prescriptions',icon: <FileText className="h-5 w-5" /> },
  { label: 'Dispense',     path: '/pharmacist/dispense',     icon: <Pill className="h-5 w-5" /> },
  { label: 'Profile',      path: '/pharmacist/profile',      icon: <User className="h-5 w-5" /> },
];

const PharmacistDispense = () => {
  const { data: prescriptions = [], isLoading } = usePrescriptions();
  const { data: medicines = [] }                = useMedicines();
  const qc = useQueryClient();

  const [selectedRx, setSelectedRx] = useState<PrescriptionDto | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dispensing, setDispensing] = useState(false);

  const pending = prescriptions.filter(p => p.status?.toUpperCase() === 'PENDING');

  const handleDispense = async () => {
    if (!selectedRx) return;
    setDispensing(true);
    try {
      await prescriptionService.dispense(selectedRx.id);
      qc.invalidateQueries({ queryKey: [PRESCRIPTIONS_KEY] });
      toast.success(`Prescription for ${selectedRx.patientName} dispensed — charges sent to billing`);
      setDialogOpen(false);
      setSelectedRx(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to dispense');
    } finally {
      setDispensing(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Dispense Medications">
      <PageHeader title="Dispense Medications" description="Dispense prescribed medications to patients" />

      {isLoading && <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>}

      {!isLoading && pending.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No pending prescriptions to dispense</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && pending.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pending.map((rx) => (
            <Card key={rx.id} className="hover:border-primary/40 transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{rx.patientName}</CardTitle>
                    <p className="text-sm text-muted-foreground">Dr. {rx.doctorName}</p>
                    <p className="text-xs text-muted-foreground">{rx.prescriptionDate}</p>
                  </div>
                  <StatusBadge status={rx.status?.toLowerCase() as never} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5 mb-4">
                  {rx.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="font-medium">{item.medicineName}</span>
                      <span className="text-muted-foreground">×{item.quantity} · {item.dosage}</span>
                    </div>
                  ))}
                </div>
                {rx.notes && (
                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-3">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>{rx.notes}</span>
                  </div>
                )}
                <Button className="w-full gap-2" onClick={() => { setSelectedRx(rx); setDialogOpen(true); }}>
                  <ShoppingCart className="h-4 w-4" />Dispense
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Confirm Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Confirm Dispensing</DialogTitle></DialogHeader>
          {selectedRx && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium">{selectedRx.patientName}</p>
                <p className="text-sm text-muted-foreground">Prescribed by Dr. {selectedRx.doctorName}</p>
                <p className="text-xs text-muted-foreground">{selectedRx.prescriptionDate}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Medications:</h4>
                {selectedRx.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 border rounded text-sm">
                    <div>
                      <p className="font-medium">{item.medicineName}</p>
                      <p className="text-xs text-muted-foreground">{item.dosage} · {item.frequency} · {item.duration} days</p>
                    </div>
                    <span className="text-muted-foreground">×{item.quantity}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                Dispensing will mark this prescription as dispensed and automatically trigger billing.
              </p>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">Cancel</Button>
                <Button onClick={handleDispense} className="flex-1" disabled={dispensing}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {dispensing ? 'Dispensing...' : 'Confirm Dispense'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PharmacistDispense;
