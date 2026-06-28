import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { usePatients } from '@/hooks/usePatients';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import { PrescriptionDto } from '@/services/prescriptionService';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

// ── Administration log (localStorage) ────────────────────────────────────────
interface AdminRecord {
  prescriptionId: number;
  itemIdx: number;
  medicineName: string;
  administeredAt: string;
  notes: string;
}

const STORAGE_KEY = 'nurse_admin_log';
const loadLog = (): AdminRecord[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
  catch { return []; }
};
const saveLog = (log: AdminRecord[]) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));

// ─────────────────────────────────────────────────────────────────────────────
const NurseMedications = () => {
  const { data: patients = [] }                 = usePatients();
  const { data: prescriptions = [], isLoading } = usePrescriptions();

  const [adminLog, setAdminLog]     = useState<AdminRecord[]>(loadLog);
  const [expanded, setExpanded]     = useState<Set<number>>(new Set());
  const [noteDialog, setNoteDialog] = useState<{ rxId: number; itemIdx: number; name: string } | null>(null);
  const [noteText, setNoteText]     = useState('');

  const admittedIds = new Set(
    patients.filter(p => p.status?.toUpperCase() === 'ADMITTED').map(p => String(p.id))
  );

  /** Dispensed by pharmacist → nurse can administer */
  const readyToAdminister = prescriptions.filter(p =>
    p.status?.toUpperCase() === 'DISPENSED' && admittedIds.has(String(p.patientId)));

  /** Still pending pharmacy */
  const waitingDispense = prescriptions.filter(p =>
    p.status?.toUpperCase() === 'PENDING' && admittedIds.has(String(p.patientId)));

  // ── helpers ───────────────────────────────────────────────────────────────
  const toggle = (id: number) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const isAdministered = (rxId: number, idx: number) =>
    adminLog.some(r => r.prescriptionId === rxId && r.itemIdx === idx);

  const getRecord = (rxId: number, idx: number) =>
    adminLog.find(r => r.prescriptionId === rxId && r.itemIdx === idx);

  const confirmAdminister = () => {
    if (!noteDialog) return;
    const rec: AdminRecord = {
      prescriptionId: noteDialog.rxId,
      itemIdx:        noteDialog.itemIdx,
      medicineName:   noteDialog.name,
      administeredAt: new Date().toISOString(),
      notes:          noteText,
    };
    const updated = [...adminLog, rec];
    setAdminLog(updated);
    saveLog(updated);
    toast.success(`${noteDialog.name} marked as administered`);
    setNoteDialog(null);
    setNoteText('');
  };

  // ── Dispensed prescription card ───────────────────────────────────────────
  const DispensedCard = ({ rx }: { rx: PrescriptionDto }) => {
    const open      = expanded.has(rx.id);
    const items     = rx.items ?? [];
    const doneCount = items.filter((_, i) => isAdministered(rx.id, i)).length;
    const allDone   = items.length > 0 && doneCount === items.length;

    return (
      <Card className={`transition-all ${allDone ? 'border-green-400/60' : 'hover:border-primary/30'}`}>
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{rx.patientName}</p>
                <p className="text-xs text-muted-foreground">Dr. {rx.doctorName} · {rx.prescriptionDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={allDone ? 'default' : 'secondary'} className="text-xs">
                {doneCount}/{items.length} given
              </Badge>
              <Button size="sm" variant="ghost" onClick={() => toggle(rx.id)}>
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
                <div key={idx} className={`flex items-center justify-between rounded-lg px-3 py-2.5 border text-sm
                  ${done
                    ? 'bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-800'
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
                  {done
                    ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    : (
                      <Button size="sm" variant="outline"
                        className="text-green-600 border-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 shrink-0 gap-1"
                        onClick={() => { setNoteDialog({ rxId: rx.id, itemIdx: idx, name: item.medicineName ?? '' }); setNoteText(''); }}>
                        <Syringe className="h-3.5 w-3.5" />Give
                      </Button>
                    )
                  }
                </div>
              );
            })}
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
        description="Administer dispensed medications to admitted patients"
      />

      {isLoading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      )}

      {!isLoading && (
        <Tabs defaultValue="ready">
          <TabsList>
            <TabsTrigger value="ready" className="gap-2">
              <Syringe className="h-4 w-4" />Ready to Administer ({readyToAdminister.length})
            </TabsTrigger>
            <TabsTrigger value="waiting" className="gap-2">
              <ClipboardList className="h-4 w-4" />Waiting for Pharmacy ({waitingDispense.length})
            </TabsTrigger>
          </TabsList>

          {/* ── Ready ── */}
          <TabsContent value="ready" className="space-y-3 mt-4">
            {readyToAdminister.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Syringe className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No medications ready to administer</p>
                  <p className="text-sm mt-1">Medications appear here after the pharmacist dispenses them</p>
                </CardContent>
              </Card>
            ) : readyToAdminister.map(rx => <DispensedCard key={rx.id} rx={rx} />)}
          </TabsContent>

          {/* ── Waiting pharmacy ── */}
          <TabsContent value="waiting" className="space-y-3 mt-4">
            {waitingDispense.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Pill className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No prescriptions waiting for pharmacy</p>
                </CardContent>
              </Card>
            ) : waitingDispense.map(rx => (
              <Card key={rx.id} className="border-l-4 border-l-yellow-400">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-sm">{rx.patientName}</p>
                      <p className="text-xs text-muted-foreground">Dr. {rx.doctorName} · {rx.prescriptionDate}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                      Pending Pharmacy
                    </Badge>
                  </div>
                  <div className="mt-3 space-y-1">
                    {rx.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Pill className="h-3.5 w-3.5" />
                        <span>{item.medicineName} — {item.dosage} × {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
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
