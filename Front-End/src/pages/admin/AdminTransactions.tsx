import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';
import { adminNavItems } from '@/constants/adminNavItems';
import { usePatients } from '@/hooks/usePatients';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import { PatientDto } from '@/services/patientService';
import { PrescriptionDto } from '@/services/prescriptionService';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminTransactions = () => {
  const { data: patients = [],      isLoading: ldPat,  error: errPat }  = usePatients();
  const { data: prescriptions = [], isLoading: ldRx,   error: errRx }   = usePrescriptions();

  const isLoading = ldPat || ldRx;
  const error = errPat ?? errRx;

  const patientCols = [
    { key: 'name',       header: 'Patient Name' },
    { key: 'nationalId', header: 'National ID' },
    { key: 'phone',      header: 'Phone' },
    { key: 'email',      header: 'Email' },
    { key: 'status',     header: 'Status', render: (p: PatientDto) => <StatusBadge status={p.status?.toLowerCase() as never} /> },
  ];

  const rxCols = [
    { key: 'patientName',      header: 'Patient' },
    { key: 'doctorName',       header: 'Doctor' },
    { key: 'prescriptionDate', header: 'Date' },
    { key: 'items', header: 'Items', render: (p: PrescriptionDto) => `${p.items?.length ?? 0} medication(s)` },
    { key: 'status', header: 'Status', render: (p: PrescriptionDto) => <StatusBadge status={p.status?.toLowerCase() as never} /> },
  ];

  return (
    <DashboardLayout navItems={adminNavItems} title="Transactions">
      <PageHeader title="Patient Transactions" description="Patient records and prescription activity" />

      <Card className="mb-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
        <CardContent className="flex items-start gap-3 py-3 px-4">
          <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Billing and invoice management is handled by the Accountant role. This view shows patient activity and prescription records.
          </p>
        </CardContent>
      </Card>

      {isLoading && <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error instanceof Error ? error.message : 'Failed to load data'}</AlertDescription></Alert>}

      {!isLoading && !error && (
        <Tabs defaultValue="patients">
          <TabsList>
            <TabsTrigger value="patients">Patients ({patients.length})</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions ({prescriptions.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="patients">
            <DataTable data={patients} columns={patientCols} emptyMessage="No patients found" />
          </TabsContent>
          <TabsContent value="prescriptions">
            <DataTable data={prescriptions} columns={rxCols} emptyMessage="No prescriptions found" />
          </TabsContent>
        </Tabs>
      )}
    </DashboardLayout>
  );
};

export default AdminTransactions;
