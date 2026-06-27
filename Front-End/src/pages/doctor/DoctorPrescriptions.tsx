import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { doctorNavItems } from './DoctorDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Pill, Trash2, Eye, AlertCircle } from 'lucide-react';
import { useDoctorPatients, usePatients } from '@/hooks/usePatients';
import { usePrescriptions, useCreatePrescription } from '@/hooks/usePrescriptions';
import { useMedicines } from '@/hooks/useMedicines';
import { PrescriptionDto } from '@/services/prescriptionService';

const DoctorPrescriptions = () => {
  const { user } = useAuth();
  const { data: patients = [] } = useDoctorPatients(user?.id);
  const { data: prescriptions = [], isLoading, error } = usePrescriptions();
  const { data: medicines = [] } = useMedicines();
  const createPrescription = useCreatePrescription();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionDto | null>(null);

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [items, setItems] = useState<{ medicineId: number; medicineName: string; dosage: string; frequency: string; duration: number; quantity: number; instructions: string }[]>([]);
  const [notes, setNotes] = useState('');

  const [newMed, setNewMed] = useState({ medicineId: 0, medicineName: '', dosage: '', frequency: '', duration: 7, quantity: 1, instructions: '' });

  const doctorPrescriptions = user ? prescriptions.filter((p) => String(p.doctorId) === user.id) : [];

  const addMedication = () => {
    if (!newMed.medicineId || !newMed.dosage || !newMed.frequency) {
      toast.error('Please fill all medication fields');
      return;
    }
    setItems([...items, { ...newMed }]);
    setNewMed({ medicineId: 0, medicineName: '', dosage: '', frequency: '', duration: 7, quantity: 1, instructions: '' });
  };

  const removeMedication = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleCreatePrescription = async () => {
    if (!selectedPatientId) { toast.error('Please select a patient'); return; }
    if (items.length === 0) { toast.error('Please add at least one medication'); return; }
    if (!user) return;
    try {
      await createPrescription.mutateAsync({
        patientId: Number(selectedPatientId),
        doctorId: Number(user.id),
        notes,
        items: items.map(({ medicineId, dosage, frequency, duration, quantity, instructions }) => ({
          medicineId, dosage, frequency, duration, quantity, instructions,
        })),
      });
      toast.success('Prescription created and sent to pharmacy');
      setDialogOpen(false);
      setSelectedPatientId('');
      setItems([]);
      setNotes('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create prescription');
    }
  };

  const viewPrescription = (prescription: PrescriptionDto) => {
    setSelectedPrescription(prescription);
    setViewDialogOpen(true);
  };

  const columns = [
    { key: 'patientName', header: 'Patient' },
    { key: 'prescriptionDate', header: 'Date' },
    { key: 'items', header: 'Medications', render: (p: PrescriptionDto) => `${p.items?.length ?? 0} item(s)` },
    { key: 'status', header: 'Status', render: (p: PrescriptionDto) => <StatusBadge status={p.status?.toLowerCase() as never} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (p: PrescriptionDto) => (
        <Button variant="ghost" size="sm" onClick={() => viewPrescription(p)}><Eye className="h-4 w-4" /></Button>
      ),
    },
  ];

  return (
    <DashboardLayout navItems={doctorNavItems} title="Prescriptions">
      <PageHeader
        title="Prescriptions"
        description="Create and manage prescriptions"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />New Prescription</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create Prescription</DialogTitle></DialogHeader>
              <div className="space-y-6">
                <div>
                  <Label>Select Patient</Label>
                  <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger><SelectValue placeholder="Select patient..." /></SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.name} - {p.nationalId}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><Pill className="h-4 w-4" />Add Medication</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Medicine</Label>
                        <Select
                          value={newMed.medicineId ? String(newMed.medicineId) : ''}
                          onValueChange={(v) => {
                            const med = medicines.find(m => String(m.id) === v);
                            setNewMed({ ...newMed, medicineId: Number(v), medicineName: med?.name || '' });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select medicine..." />
                          </SelectTrigger>
                          <SelectContent>
                            {medicines.length === 0 ? (
                              <SelectItem value="_empty" disabled>No medicines available</SelectItem>
                            ) : (
                              medicines.map((m) => (
                                <SelectItem key={m.id} value={String(m.id)}>
                                  {m.name}{m.genericName ? ` (${m.genericName})` : ''}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>Dosage</Label><Input placeholder="e.g., 500mg" value={newMed.dosage} onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })} /></div>
                      <div><Label>Frequency</Label><Input placeholder="e.g., Twice daily" value={newMed.frequency} onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })} /></div>
                      <div><Label>Duration (days)</Label><Input type="number" min={1} value={newMed.duration} onChange={(e) => setNewMed({ ...newMed, duration: parseInt(e.target.value) || 1 })} /></div>
                      <div><Label>Quantity</Label><Input type="number" min={1} value={newMed.quantity} onChange={(e) => setNewMed({ ...newMed, quantity: parseInt(e.target.value) || 1 })} /></div>
                      <div><Label>Instructions</Label><Input placeholder="e.g., Take with food" value={newMed.instructions} onChange={(e) => setNewMed({ ...newMed, instructions: e.target.value })} /></div>
                    </div>
                    <Button type="button" variant="secondary" onClick={addMedication}><Plus className="h-4 w-4 mr-2" />Add Medication</Button>
                  </CardContent>
                </Card>

                {items.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-base">Medications ({items.length})</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                              <p className="font-medium">{item.medicineName}</p>
                              <p className="text-sm text-muted-foreground">{item.dosage} • {item.frequency} • {item.duration} days • Qty: {item.quantity}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeMedication(idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div><Label>Notes</Label><Textarea placeholder="Additional instructions..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} /></div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreatePrescription} disabled={createPrescription.isPending}>
                    {createPrescription.isPending ? 'Creating...' : 'Create & Send to Pharmacy'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading && <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error instanceof Error ? error.message : 'Failed to load prescriptions'}</AlertDescription></Alert>}
      {!isLoading && !error && (
        <DataTable
          data={doctorPrescriptions.map(p => ({ ...p, id: String(p.id) }))}
          columns={columns}
          emptyMessage="No prescriptions found"
        />
      )}

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Prescription Details</DialogTitle></DialogHeader>
          {selectedPrescription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Patient:</span> {selectedPrescription.patientName}</div>
                <div><span className="text-muted-foreground">Date:</span> {selectedPrescription.prescriptionDate}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Status:</span> <StatusBadge status={selectedPrescription.status?.toLowerCase() as never} /></div>
              </div>
              <div>
                <p className="font-medium mb-2">Medications:</p>
                <div className="space-y-2">
                  {selectedPrescription.items?.map((item, idx) => (
                    <div key={idx} className="p-3 bg-muted rounded-lg">
                      <p className="font-medium">{item.medicineName}</p>
                      <p className="text-sm text-muted-foreground">{item.dosage} • {item.frequency} • {item.duration} days • Qty: {item.quantity}</p>
                      {item.instructions && <p className="text-xs text-muted-foreground">{item.instructions}</p>}
                    </div>
                  ))}
                </div>
              </div>
              {selectedPrescription.notes && (
                <div><p className="font-medium mb-1">Notes:</p><p className="text-sm text-muted-foreground">{selectedPrescription.notes}</p></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DoctorPrescriptions;
