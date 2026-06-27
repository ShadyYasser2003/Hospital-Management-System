import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { usePatients } from '@/hooks/usePatients';
import { usePrescriptions, useDispensePrescription } from '@/hooks/usePrescriptions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  CheckCircle2, Pill, User, AlertCircle, ClipboardList,
  ChevronDown, ChevronUp, Syringe, Clock,
} from 'lucide-react';
import { nurseNavItems } from '@/constants/nurseNavItems';

// ── Local per-item administration log (stored in component state / localStorage) ──
interface AdminRecord {
  prescriptionId: number;
  itemIdx: number;
  medicineName: string;
  administeredAt: string;   // ISO string
  notes: string;
}

const STORAGE_KEY = 'nurse_admin_log';

function loadLog(): AdminRecord[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
  catch { return []; }
}
function saveLog(log: AdminRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
}

// ── Component ─────────────────────────────────────────────────────────────────
const NurseMedications = () => {
  const { data: patients = [] }                      = usePatients();
  const { data: prescriptions = [], isLoading }      = usePrescriptions();

  const [adminLog, setAdminLog]       = useState<AdminRecord[]>(loadLog);
  const [expanded, setExpanded]       = useState<Set<number>>(new Set());
  const [noteDialog, setNoteDialog]   = useState<{ rxId: number; itemIdx: number; name: string } | null>(null);
  const [noteText, setNoteText]       = useState('');

  const admittedIds = new Set(
    patients.filter(p => p.status?.toUpperCase() === 'ADMITTED').map(p => String(p.id))
  );

  const pending   = prescriptions.filter(p =>
    p.status?.toUpperCase() === 'PENDING' && admittedIds.has(String(p.patientId)));
  const dispensed = prescriptions.filter(p =>
    p.status?.toUpperCase() === 'DISPENSED' && admittedIds.has(String(p.patientId)));

  // ── helpers ──────────────────────────────────────────────────────────────
  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isAdministered = (rxId: number, itemIdx: number) =>
    adminLog.some(r => r.prescriptionId === rxId && r.itemIdx === itemIdx);

  const getRecord = (rxId: number, itemIdx: number) =>
    adminLog.find(r => r.prescriptionId === rxId && r.itemIdx === itemIdx);

  const openNoteDialog = (rxId: number, itemIdx: number, name: string) => {
    setNoteDialog({ rxId, itemIdx, name });
    setNoteText('');
  };

  const confirmAdminister = () => {
    if (!noteDialog) return;
    const record: AdminRecord = {
      prescriptionId: noteDialog.rxId,
      itemIdx: noteDialog.itemIdx,
      medicineName: noteDialog.name,
      administeredAt: new Date().toISOString(),
      notes: noteText,
    };
    const updated = [...adminLog, record];
    setAdminLog(updated);
    saveLog(updated);
    toast.success(`${noteDialog.name} marked as administered`);
    setNoteDialog(null);
  };

  const allItemsAdministered = (rx: PrescriptionDto) =>
    (rx.items ?? []).every((_, idx) => isAdministered(rx.id, idx));

  const handleMarkDispensed = async (rx: PrescriptionDto) => {
    try {
      await dispense.mutateAsync(rx.id);
      toast.success(`Prescription for ${rx.patientName} marked as dispensed`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    }
  };

  // ── Prescription card (pending) ───────────────────────────────────────────
  const PendingCard = ({ rx }: { rx: PrescriptionDto }) => {
    const open = expanded.has(rx.id);
    const allDone = allItemsAdministered(rx);
    const items = rx.items ?? [];
    const doneCount = items.filter((_, idx) => isAdministered(rx.id, idx)).length;

    return (
      <Card className={`transition-all ${allDone ? 'border-green-400/60' : 'hover:border-primary/30'}`}>
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{rx.patientName}</p>
                <p className="text-xs text-muted-foreground">
                  Dr. {rx.doctorName} · {rx.prescriptionDate}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={allDone ? 'default' : 'secondary'} className="text-xs">
                {doneCount}/{items.length} given
              </Badge>
              <Button size="sm" variant="ghost" onClick={() => toggleExpand(rx.id)}>
                {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        {open && (
          <CardContent className="px-4 pb-4 pt-1 space-y-3">
            <Separator />
            {items.map((item, idx) => {
              const done = isAdministered(rx.id, idx);
              const rec  = getRecord(rx.id, idx);
              return (
                <div key={idx}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 border text-sm
                    ${done ? 'bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-800'
                           : 'bg-muted/30 border-border'}`}>
                  <div className="flex items-start gap-2 min-w-0">
                    <Pill className={`h-4 w-4 mt-0.5 shrink-0 ${done ? 'text-green-500' : 'text-primary'}`} />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{item.medicineName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.dosage} · {item.frequency} · {item.duration}d · Qty {item.quantity}
                      </p>
                      {done && rec && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-0.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Given {new Date(rec.administeredAt).toLocaleString()}
                          {rec.notes ? ` — ${rec.notes}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  ) : (
                    <Button size="sm" variant="outline"
                      className="text-green-600 border-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 shrink-0 gap-1"
                      onClick={() => openNoteDialog(rx.id, idx, item.medicineName ?? '')}>
                      <Syringe className="h-3.5 w-3.5" />Give
                    </Button>
                  )}
                </div>
              );
            })}

            {allDone && (
              <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                onClick={() => handleMarkDispensed(rx)} disabled={dispense.isPending}>
                <CheckCircle2 className="h-4 w-4" />
                {dispense.isPending ? 'Updating...' : 'Mark Prescription as Dispensed'}
              </Button>
            )}

            {rx.notes && (
              <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />{rx.notes}
              </p>
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout navItems={nurseNavItems} title="Medication Administration">
      <PageHeader
        title="Medication Administration"
        description="Track and administer medications for admitted patients"
      />

      {isLoading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      )}

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

          {/* ── Pending tab ── */}
          <TabsContent value="pending" className="space-y-3 mt-4">
            {pending.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Pill className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No pending medications for admitted patients</p>
                </CardContent>
              </Card>
            ) : (
              pending.map(rx => <PendingCard key={rx.id} rx={rx} />)
            )}
          </TabsContent>

          {/* ── Dispensed tab ── */}
          <TabsContent value="dispensed" className="space-y-3 mt-4">
            {dispensed.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <CheckCircle2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No dispensed medications yet</p>
                </CardContent>
              </Card>
            ) : (
              dispensed.map(rx => (
                <Card key={rx.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-sm">{rx.patientName}</p>
                        <p className="text-xs text-muted-foreground">
                          Dr. {rx.doctorName} · {rx.prescriptionDate}
                        </p>
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
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* ── Administer note dialog ── */}
      <Dialog open={!!noteDialog} onOpenChange={() => setNoteDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Syringe className="h-5 w-5 text-primary" />
              Administer — {noteDialog?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="e.g., Patient took with water, no adverse reaction…"
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setNoteDialog(null)}>Cancel</Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={confirmAdminister}>
                Confirm Administration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default NurseMedications;
