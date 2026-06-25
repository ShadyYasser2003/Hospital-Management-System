import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import { doctorNavItems } from './DoctorDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { usePatients } from '@/hooks/usePatients';
import { useExternalHospitals } from '@/hooks/useExternalHospitals';
import { useTransfers, useCreateTransfer, useSendTransfer } from '@/hooks/useTransfers';
import { TransferRequestDto } from '@/services/transferService';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  Send, Plus, Building2, AlertCircle, Clock, CheckCircle2, XCircle,
  TestTube, Radiation, FileText, Mail, User, Calendar,
} from 'lucide-react';
import { fmtDate } from '@/lib/diagnosticUtils';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  PENDING: { label: 'Pending',  icon: <Clock className="h-3.5 w-3.5" />,        cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  SENT:    { label: 'Sent',     icon: <CheckCircle2 className="h-3.5 w-3.5" />, cls: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  FAILED:  { label: 'Failed',   icon: <XCircle className="h-3.5 w-3.5" />,      cls: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status?.toUpperCase()] ?? STATUS_CONFIG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
};

const emptyForm = {
  patientId:        '',
  toHospitalId:     '',
  reason:           '',
  includeLabTests:  false,
  includeRadiology: false,
  includeDiagnoses: false,
};

const DoctorTransfer: React.FC = () => {
  const { user } = useAuth();

  const { data: patients  = [] }           = usePatients();
  const { data: hospitals = [] }           = useExternalHospitals();
  const { data: transfers = [], isLoading, error } = useTransfers();
  const createTransfer = useCreateTransfer();
  const sendTransfer   = useSendTransfer();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [sendingId, setSendingId]   = useState<number | null>(null);

  const activeHospitals = hospitals.filter(h => h.isActive);
  const myTransfers = transfers.filter(t => String(t.requestedById) === user?.id);

  const validate = (): string | null => {
    if (!form.patientId)    return 'Select a patient';
    if (!form.toHospitalId) return 'Select a destination hospital';
    if (!form.reason.trim()) return 'Reason for transfer is required';
    return null;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }
    if (!user?.id) return;
    try {
      const result = await createTransfer.mutateAsync({
        patientId:        Number(form.patientId),
        requestedById:    Number(user.id),
        toHospitalId:     Number(form.toHospitalId),
        reason:           form.reason,
        includeLabTests:  form.includeLabTests,
        includeRadiology: form.includeRadiology,
        includeDiagnoses: form.includeDiagnoses,
      });
      toast.success(`Transfer request created for ${result.patientName}`);
      setDialogOpen(false);
      setForm(emptyForm);
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to create transfer'); }
  };

  const handleSend = async (transfer: TransferRequestDto) => {
    setSendingId(transfer.id);
    try {
      await sendTransfer.mutateAsync(transfer.id);
      toast.success(`Report sent to ${transfer.toHospitalName}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send report');
    } finally {
      setSendingId(null);
    }
  };

  const selectedPatient  = patients.find(p => String(p.id) === form.patientId);
  const selectedHospital = activeHospitals.find(h => String(h.id) === form.toHospitalId);

  const columns = [
    { key: 'patientName',    header: 'Patient',
      render: (t: TransferRequestDto) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center"><User className="h-3.5 w-3.5 text-primary" /></div>
          <span className="font-medium">{t.patientName}</span>
        </div>
      )},
    { key: 'toHospitalName', header: 'Destination Hospital',
      render: (t: TransferRequestDto) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm font-medium">{t.toHospitalName}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{t.toHospitalEmail}</p>
          </div>
        </div>
      )},
    { key: 'includes',        header: 'Includes',
      render: (t: TransferRequestDto) => (
        <div className="flex gap-1 flex-wrap">
          {t.includeLabTests  && <Badge variant="secondary" className="text-xs gap-1"><TestTube className="h-3 w-3" />Labs</Badge>}
          {t.includeRadiology && <Badge variant="secondary" className="text-xs gap-1"><Radiation className="h-3 w-3" />Radiology</Badge>}
          {t.includeDiagnoses && <Badge variant="secondary" className="text-xs gap-1"><FileText className="h-3 w-3" />Diagnoses</Badge>}
          {!t.includeLabTests && !t.includeRadiology && !t.includeDiagnoses && <span className="text-xs text-muted-foreground">Basic only</span>}
        </div>
      )},
    { key: 'createdAt', header: 'Created',    render: (t: TransferRequestDto) => (
        <span className="flex items-center gap-1 text-sm"><Calendar className="h-3.5 w-3.5 text-muted-foreground" />{fmtDate(t.createdAt)}</span>
      )},
    { key: 'status',    header: 'Status',     render: (t: TransferRequestDto) => <StatusBadge status={t.status} /> },
    { key: 'actions',   header: 'Actions',
      render: (t: TransferRequestDto) => {
        const status = t.status?.toUpperCase();
        if (status === 'SENT') {
          return <span className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" />Sent</span>;
        }
        return (
          <Button
            size="sm"
            variant={status === 'FAILED' ? 'destructive' : 'default'}
            className="gap-1.5"
            onClick={() => handleSend(t)}
            disabled={sendingId === t.id}
          >
            <Send className="h-3.5 w-3.5" />
            {sendingId === t.id ? 'Sending…' : status === 'FAILED' ? 'Retry Send' : 'Send Report'}
          </Button>
        );
      }},
  ];

  return (
    <DashboardLayout navItems={doctorNavItems} title="Patient Transfers">
      <PageHeader
        title="Patient Transfers"
        description="Transfer patients to external hospitals with a full medical report"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Transfer</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Create Transfer Request</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-5 pt-2">

                <div>
                  <Label>Patient <span className="text-destructive">*</span></Label>
                  <Select value={form.patientId} onValueChange={v => setForm(p => ({ ...p, patientId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select patient..." /></SelectTrigger>
                    <SelectContent>
                      {patients.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name} — {p.nationalId}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPatient && (
                  <div className="p-3 rounded-lg bg-muted/40 border text-sm grid grid-cols-2 gap-2">
                    <div><p className="text-muted-foreground text-xs">Gender</p><p>{selectedPatient.gender ?? '—'}</p></div>
                    <div><p className="text-muted-foreground text-xs">Blood Type</p><p>{selectedPatient.bloodType ?? '—'}</p></div>
                    <div className="col-span-2"><p className="text-muted-foreground text-xs">Diagnosis</p><p>{selectedPatient.diagnosis ?? '—'}</p></div>
                  </div>
                )}

                <div>
                  <Label>Destination Hospital <span className="text-destructive">*</span></Label>
                  <Select value={form.toHospitalId} onValueChange={v => setForm(p => ({ ...p, toHospitalId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select hospital..." /></SelectTrigger>
                    <SelectContent>
                      {activeHospitals.length === 0
                        ? <SelectItem value="_none" disabled>No active hospitals</SelectItem>
                        : activeHospitals.map(h => <SelectItem key={h.id} value={String(h.id)}><span className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" />{h.name}</span></SelectItem>)}
                    </SelectContent>
                  </Select>
                  {selectedHospital && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Mail className="h-3 w-3" />Report will be sent to: <strong>{selectedHospital.email}</strong></p>
                  )}
                </div>

                <div>
                  <Label>Reason for Transfer <span className="text-destructive">*</span></Label>
                  <Textarea
                    value={form.reason}
                    onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                    placeholder="Clinical reason for transferring the patient..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="mb-3 block">Include in Report</Label>
                  <div className="space-y-3">
                    {[
                      { key: 'includeLabTests',  label: 'Lab Test Results',    icon: <TestTube className="h-4 w-4 text-primary" /> },
                      { key: 'includeRadiology', label: 'Radiology Reports',   icon: <Radiation className="h-4 w-4 text-primary" /> },
                      { key: 'includeDiagnoses', label: 'Diagnoses & Notes',   icon: <FileText className="h-4 w-4 text-primary" /> },
                    ].map(({ key, label, icon }) => (
                      <div key={key} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                        {icon}
                        <Label htmlFor={key} className="flex-1 cursor-pointer font-normal">{label}</Label>
                        <Checkbox
                          id={key}
                          checked={(form as Record<string, unknown>)[key] as boolean}
                          onCheckedChange={v => setForm(p => ({ ...p, [key]: v === true }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-1 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300 flex gap-2">
                  <Mail className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>The backend will generate a PDF report and email it directly to the selected hospital when you click "Send Report".</p>
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createTransfer.isPending}>
                    {createTransfer.isPending ? 'Creating…' : 'Create Transfer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading && <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>}
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error instanceof Error ? error.message : 'Failed to load transfers'}</AlertDescription></Alert>}

      {!isLoading && !error && (
        myTransfers.length === 0 ? (
          <Card>
            <CardContent className="py-16 flex flex-col items-center text-muted-foreground gap-3">
              <Building2 className="h-12 w-12 opacity-20" />
              <p className="font-medium">No transfer requests yet</p>
              <p className="text-sm">Create a transfer to send a patient's report to an external hospital.</p>
            </CardContent>
          </Card>
        ) : (
          <DataTable data={myTransfers} columns={columns} emptyMessage="No transfers found" />
        )
      )}
    </DashboardLayout>
  );
};

export default DoctorTransfer;
