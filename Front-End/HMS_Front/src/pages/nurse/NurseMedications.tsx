import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { usePatients } from '@/hooks/usePatients';
import { usePrescriptions, useDispensePrescription } from '@/hooks/usePrescriptions';
import { PrescriptionDto } from '@/services/prescriptionService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Syringe, CheckCircle2, Pill, User, AlertCircle, ClipboardList, Check } from 'lucide-react';
import { nurseNavItems } from '@/constants/nurseNavItems';

const NurseMedications = () => {
  const { user } = useAuth();
  const { data: patients = [] }      = usePatients();
  const { data: prescriptions = [], isLoading } = usePrescriptions();
  const dispense = useDispensePrescription();

  const admittedIds = new Set(patients.filter(p => p.status?.toUpperCase() === 'ADMITTED').map(p => String(p.id)));

  const pending   = prescriptions.filter(p => p.status?.toUpperCase() === 'PENDING'   && admittedIds.has(String(p.patientId)));
  const dispensed = prescriptions.filter(p => p.status?.toUpperCase() === 'DISPENSED' && admittedIds.has(String(p.patientId)));

  const handleMarkDispensed = async (rx: PrescriptionDto) => {
    try {
      await dispense.mutateAsync(rx.id);
      toast.success(`Prescription for ${rx.patientName} marked as dispensed`);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
  };

  return (
    <DashboardLayout navItems={nurseNavItems} title="Medication Administration">
      <PageHeader title="Medication Administration" description="Track and administer medications for admitted patients" />

      {isLoading && <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>}

      {!isLoading && (
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <ClipboardList className="h-4 w-4" />Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="dispensed" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />Dispensed ({dispensed.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-3 mt-4">
            {pending.length === 0
              ? <Card><CardContent className="py-12 text-center text-muted-foreground"><Pill className="h-10 w-10 mx-auto mb-3 opacity-30" /><p>No pending medications for admitted patients</p></CardContent></Card>
              : pending.map(rx => (
                <Card key={rx.id} className="hover:border-primary/30 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{rx.patientName}</p>
                          <p className="text-xs text-muted-foreground">Dr. {rx.doctorName} · {rx.prescriptionDate}</p>
                        </div>
                      </div>
                      <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700 text-white shrink-0"
                        onClick={() => handleMarkDispensed(rx)} disabled={dispense.isPending}>
                        <Check className="h-3.5 w-3.5" />Mark Dispensed
                      </Button>
                    </div>
                    <Separator className="mb-3" />
                    <div className="space-y-2">
                      {rx.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-md px-3 py-2 bg-muted/30 border border-border text-sm">
                          <div className="flex items-center gap-2">
                            <Pill className="h-3.5 w-3.5 text-primary" />
                            <span className="font-medium">{item.medicineName}</span>
                            <span className="text-muted-foreground hidden sm:inline">{item.dosage} · {item.frequency}</span>
                          </div>
                          <Badge variant="outline">Qty: {item.quantity}</Badge>
                        </div>
                      ))}
                    </div>
                    {rx.notes && <p className="mt-2 text-xs text-muted-foreground italic flex items-center gap-1"><AlertCircle className="h-3 w-3" />{rx.notes}</p>}
                  </CardContent>
                </Card>
              ))
            }
          </TabsContent>

          <TabsContent value="dispensed" className="space-y-3 mt-4">
            {dispensed.length === 0
              ? <Card><CardContent className="py-12 text-center text-muted-foreground"><CheckCircle2 className="h-10 w-10 mx-auto mb-3 opacity-30" /><p>No dispensed medications yet</p></CardContent></Card>
              : dispensed.map(rx => (
                <Card key={rx.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-sm">{rx.patientName}</p>
                        <p className="text-xs text-muted-foreground">Dr. {rx.doctorName} · {rx.prescriptionDate}</p>
                      </div>
                      <StatusBadge status="dispensed" />
                    </div>
                    <div className="mt-3 space-y-1">
                      {rx.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          <span>{item.medicineName} — {item.dosage}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            }
          </TabsContent>
        </Tabs>
      )}
    </DashboardLayout>
  );
};

export default NurseMedications;
