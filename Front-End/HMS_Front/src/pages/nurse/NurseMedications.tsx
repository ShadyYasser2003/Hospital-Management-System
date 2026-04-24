import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Prescription } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Syringe, CheckCircle2, Pill, User, AlertCircle, ClipboardList, History, Search, Calendar, Check,
} from 'lucide-react';
import { nurseNavItems } from '@/constants/nurseNavItems';

const NurseMedications = () => {
  const { user } = useAuth();
  const { prescriptions, patients, medicationAdministrations, addMedicationAdministration, updatePrescription, addNotification } = useData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [formData, setFormData] = useState({
    medicationId: '',
    dosage: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    notes: '',
  });

  const admittedPatients = patients.filter(p => p.status === 'admitted');

  const pendingPrescriptions = prescriptions.filter(p =>
    admittedPatients.some(pt => pt.id === p.patientId) &&
    p.status !== 'cancelled',
  );

  const isDuplicate = (prescriptionId: string, medicationName: string, date: string, time: string) =>
    medicationAdministrations.some(a =>
      a.prescriptionId === prescriptionId &&
      a.medicationName === medicationName &&
      a.administeredAt.includes(date) &&
      a.administeredAt.includes(time),
    );

  const isMedDone = (prescriptionId: string, medicationName: string) =>
    medicationAdministrations.some(a =>
      a.prescriptionId === prescriptionId && a.medicationName === medicationName,
    );

  /** One-click mark a single medication as done with current timestamp */
  const handleMarkDone = (prescription: Prescription, medId: string) => {
    const medication = prescription.medications.find(m => m.id === medId);
    if (!medication) return;

    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);

    if (isDuplicate(prescription.id, medication.name, date, time)) {
      toast.error('Already recorded at this time');
      return;
    }

    addMedicationAdministration({
      patientId: prescription.patientId,
      patientName: prescription.patientName,
      prescriptionId: prescription.id,
      medicationName: medication.name,
      dosage: medication.dosage,
      administeredAt: `${date}T${time}:00`,
      administeredBy: user?.name || 'Nurse',
      nurseId: user?.id || '',
      notes: '',
    });

    // Mark prescription as dispensed when all meds are done
    const allDone = prescription.medications.every(m =>
      m.id === medId || isMedDone(prescription.id, m.name),
    );
    if (allDone) {
      updatePrescription(prescription.id, { status: 'dispensed' });
    }

    addNotification({
      userId: prescription.doctorId,
      role: 'doctor',
      title: 'Medication Administered',
      message: `${medication.name} administered to ${prescription.patientName} by ${user?.name}`,
      type: 'info',
      read: false,
    });

    toast.success(`${medication.name} marked as done`);
  };

  const handleOpenDialog = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setFormData({
      medicationId: '',
      dosage: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      notes: '',
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setSelectedPrescription(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrescription || !formData.medicationId || !formData.dosage) {
      toast.error('Please fill in all required fields');
      return;
    }

    const medication = selectedPrescription.medications.find(m => m.id === formData.medicationId);
    if (!medication) { toast.error('Invalid medication selected'); return; }

    const administeredAt = `${formData.date}T${formData.time}:00`;

    if (isDuplicate(selectedPrescription.id, medication.name, formData.date, formData.time)) {
      toast.error('This medication has already been recorded at this time');
      return;
    }

    addMedicationAdministration({
      patientId: selectedPrescription.patientId,
      patientName: selectedPrescription.patientName,
      prescriptionId: selectedPrescription.id,
      medicationName: medication.name,
      dosage: formData.dosage,
      administeredAt,
      administeredBy: user?.name || 'Nurse',
      nurseId: user?.id || '',
      notes: formData.notes,
    });

    addNotification({
      userId: selectedPrescription.doctorId,
      role: 'doctor',
      title: 'Medication Administered',
      message: `${medication.name} administered to ${selectedPrescription.patientName} by ${user?.name}`,
      type: 'info',
      read: false,
    });

    toast.success('Medication administered and recorded successfully');
    setDialogOpen(false);
    setSelectedPrescription(null);
  };

  const [logSearch, setLogSearch] = useState('');
  const [logDateFilter, setLogDateFilter] = useState('');

  const sortedAdministrations = [...medicationAdministrations].sort(
    (a, b) => new Date(b.administeredAt).getTime() - new Date(a.administeredAt).getTime(),
  );

  const filteredLog = sortedAdministrations.filter((a) => {
    const matchSearch =
      !logSearch ||
      a.patientName.toLowerCase().includes(logSearch.toLowerCase()) ||
      a.medicationName.toLowerCase().includes(logSearch.toLowerCase()) ||
      a.administeredBy.toLowerCase().includes(logSearch.toLowerCase());
    const matchDate = !logDateFilter || a.administeredAt.startsWith(logDateFilter);
    return matchSearch && matchDate;
  });

  return (
    <DashboardLayout navItems={nurseNavItems} title="Medication Administration">
      <PageHeader
        title="Medication Administration"
        description="Record and track medication doses for admitted patients"
      />

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Pending Prescriptions
            {pendingPrescriptions.length > 0 && (
              <Badge variant="secondary" className="ml-1">{pendingPrescriptions.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="log" className="gap-2">
            <History className="h-4 w-4" />
            Administration Log
            {medicationAdministrations.length > 0 && (
              <Badge variant="secondary" className="ml-1">{medicationAdministrations.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Pending prescriptions tab ── */}
        <TabsContent value="pending" className="space-y-4">
          {pendingPrescriptions.length === 0 ? (
            <Card>
              <CardContent className="py-14 text-center text-muted-foreground">
                <Pill className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No pending prescriptions</p>
                <p className="text-sm mt-1">Prescriptions for admitted patients will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingPrescriptions.map((prescription) => (
                <Card key={prescription.id} className="hover:shadow-sm hover:border-primary/30 transition-all">
                  <CardContent className="p-4">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm">{prescription.patientName}</p>
                            <StatusBadge status={prescription.status} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Dr. {prescription.doctorName} · {prescription.date}
                          </p>
                        </div>
                      </div>
                      {/* Detailed log button */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 gap-1.5 text-xs"
                        onClick={() => handleOpenDialog(prescription)}
                      >
                        <Syringe className="h-3.5 w-3.5" />
                        Log Details
                      </Button>
                    </div>

                    <Separator className="mb-3" />

                    {/* Per-medication mark-done rows */}
                    <div className="space-y-2">
                      {prescription.medications.map((med) => {
                        const done = isMedDone(prescription.id, med.name);
                        return (
                          <div
                            key={med.id}
                            className={`flex items-center justify-between gap-3 rounded-md px-3 py-2 border transition-colors ${
                              done
                                ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                                : 'bg-muted/30 border-border'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Pill className={`h-3.5 w-3.5 shrink-0 ${done ? 'text-green-600' : 'text-primary'}`} />
                              <span className="text-sm font-medium truncate">{med.name}</span>
                              <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">
                                {med.dosage} · {med.frequency}
                              </span>
                            </div>
                            {done ? (
                              <Badge className="gap-1 bg-green-100 text-green-700 border-green-200 hover:bg-green-100 shrink-0 dark:bg-green-900/30 dark:text-green-400">
                                <CheckCircle2 className="h-3 w-3" /> Done
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                className="h-7 px-3 gap-1.5 text-xs shrink-0 bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleMarkDone(prescription, med.id)}
                              >
                                <Check className="h-3.5 w-3.5" />
                                Mark Done
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {prescription.notes && (
                      <div className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span className="italic">{prescription.notes}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Administration Log tab ── */}
        <TabsContent value="log" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by patient, medication or nurse…"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 w-full sm:w-44"
                type="date"
                value={logDateFilter}
                onChange={(e) => setLogDateFilter(e.target.value)}
              />
            </div>
            {(logSearch || logDateFilter) && (
              <Button variant="ghost" size="sm" onClick={() => { setLogSearch(''); setLogDateFilter(''); }}>
                Clear
              </Button>
            )}
          </div>

          {filteredLog.length === 0 ? (
            <Card>
              <CardContent className="py-14 text-center text-muted-foreground">
                <History className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No administration records found</p>
                <p className="text-sm mt-1">Records will appear here after medications are administered</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredLog.map((record) => (
                <Card key={record.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-full bg-green-50 dark:bg-green-950/20 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm">{record.medicationName}</p>
                          <Badge variant="secondary" className="text-xs">{record.dosage}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Patient: <span className="font-medium text-foreground">{record.patientName}</span>
                        </p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Syringe className="h-3 w-3" />
                            Administered by {record.administeredBy}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(record.administeredAt).toLocaleString([], {
                              year: 'numeric', month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {record.notes && (
                          <p className="mt-1.5 text-xs text-muted-foreground italic border-l-2 border-muted pl-2">
                            {record.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Administer Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Syringe className="h-5 w-5 text-primary" /> Log Administration Details
            </DialogTitle>
          </DialogHeader>

          {selectedPrescription && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/40 border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Patient</p>
                <p className="font-semibold">{selectedPrescription.patientName}</p>
                <p className="text-xs text-muted-foreground">
                  Prescribed by Dr. {selectedPrescription.doctorName}
                </p>
              </div>

              <Separator />

              <div>
                <Label>Select Medication <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.medicationId}
                  onValueChange={(value) => {
                    const med = selectedPrescription.medications.find(m => m.id === value);
                    setFormData({ ...formData, medicationId: value, dosage: med?.dosage || '' });
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select medication" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedPrescription.medications.map((med) => (
                      <SelectItem key={med.id} value={med.id}>
                        {med.name} — {med.dosage} ({med.frequency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Dosage Administered <span className="text-destructive">*</span></Label>
                <Input
                  className="mt-1"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  placeholder="e.g. 10mg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date <span className="text-destructive">*</span></Label>
                  <Input
                    className="mt-1"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Time <span className="text-destructive">*</span></Label>
                  <Input
                    className="mt-1"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Nurse Notes</Label>
                <Textarea
                  className="mt-1"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any observations or notes…"
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full gap-2">
                <Syringe className="h-4 w-4" /> Record Administration
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default NurseMedications;
