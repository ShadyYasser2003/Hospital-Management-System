import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Pill, Package, FileText, User, Search, Eye, AlertCircle } from 'lucide-react';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import { PrescriptionDto } from '@/services/prescriptionService';

const navItems = [
  { label: 'Dashboard', path: '/pharmacist', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Inventory', path: '/pharmacist/inventory', icon: <Package className="h-5 w-5" /> },
  { label: 'Prescriptions', path: '/pharmacist/prescriptions', icon: <FileText className="h-5 w-5" /> },
  { label: 'Dispense', path: '/pharmacist/dispense', icon: <Pill className="h-5 w-5" /> },
  { label: 'Profile', path: '/pharmacist/profile', icon: <User className="h-5 w-5" /> },
];

const PharmacistPrescriptions = () => {
  const { data: prescriptions = [], isLoading, error } = usePrescriptions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionDto | null>(null);

  const pending = prescriptions.filter((p) => p.status?.toUpperCase() === 'PENDING');
  const dispensed = prescriptions.filter((p) => p.status?.toUpperCase() === 'DISPENSED');

  const filteredPending = pending.filter(
    (p) =>
      p.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const columns = [
    { key: 'patientName', header: 'Patient' },
    { key: 'doctorName', header: 'Doctor' },
    { key: 'prescriptionDate', header: 'Date' },
    { key: 'items', header: 'Items', render: (p: PrescriptionDto) => `${p.items?.length ?? 0} medication(s)` },
    { key: 'status', header: 'Status', render: (p: PrescriptionDto) => <StatusBadge status={p.status?.toLowerCase() as never} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (prescription: PrescriptionDto) => (
        <button onClick={() => setSelectedPrescription(prescription)} className="flex items-center gap-1 text-primary hover:underline text-sm">
          <Eye className="h-4 w-4" />View
        </button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout navItems={navItems} title="Prescriptions">
        <PageHeader title="Prescriptions" description="View prescriptions from doctors" />
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout navItems={navItems} title="Prescriptions">
        <PageHeader title="Prescriptions" description="View prescriptions from doctors" />
        <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error instanceof Error ? error.message : 'Failed to load prescriptions'}</AlertDescription></Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Prescriptions">
      <PageHeader title="Prescriptions" description="View prescriptions from doctors" />

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="dispensed">Dispensed ({dispensed.length})</TabsTrigger>
        </TabsList>

        <div className="mb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by patient or doctor..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </div>

        <TabsContent value="pending">
          <Card><CardContent className="pt-6">
            {filteredPending.length === 0
              ? <p className="text-center text-muted-foreground py-8">No pending prescriptions</p>
              : <DataTable data={filteredPending} columns={columns} />}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="dispensed">
          <Card><CardContent className="pt-6">
            {dispensed.length === 0
              ? <p className="text-center text-muted-foreground py-8">No dispensed prescriptions</p>
              : <DataTable data={dispensed} columns={columns} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedPrescription} onOpenChange={() => setSelectedPrescription(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Prescription Details</DialogTitle></DialogHeader>
          {selectedPrescription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div><p className="text-xs text-muted-foreground">Patient</p><p className="font-medium">{selectedPrescription.patientName}</p></div>
                <div><p className="text-xs text-muted-foreground">Doctor</p><p className="font-medium">{selectedPrescription.doctorName}</p></div>
                <div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{selectedPrescription.prescriptionDate}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={selectedPrescription.status?.toLowerCase() as never} /></div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Medications</h4>
                <div className="space-y-2">
                  {selectedPrescription.items?.map((item, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{item.medicineName}</p>
                          <p className="text-sm text-muted-foreground">{item.dosage} • {item.frequency}</p>
                          {item.instructions && <p className="text-xs text-muted-foreground">{item.instructions}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Qty: {item.quantity}</p>
                          <p className="text-xs text-muted-foreground">{item.duration} days</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {selectedPrescription.notes && (
                <div><h4 className="font-medium mb-1">Notes</h4><p className="text-sm text-muted-foreground">{selectedPrescription.notes}</p></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PharmacistPrescriptions;
