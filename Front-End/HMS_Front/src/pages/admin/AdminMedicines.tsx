import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { adminNavItems } from '@/constants/adminNavItems';
import { useMedicines } from '@/hooks/useMedicines';
import { MedicineDto } from '@/services/medicineService';

const AdminMedicines = () => {
  const { data: medicines = [], isLoading, error } = useMedicines();

  const columns = [
    { key: 'name', header: 'Medicine' },
    { key: 'genericName', header: 'Generic Name' },
    { key: 'description', header: 'Description', render: (m: MedicineDto) => m.description?.substring(0, 50) || '—' },
    { key: 'status', header: 'Status', render: (m: MedicineDto) => <StatusBadge status={m.status?.toLowerCase() as never} /> },
  ];

  return (
    <DashboardLayout navItems={adminNavItems} title="Medicine Stock">
      <PageHeader title="Medicine Stock" description="View current medicine inventory" />
      {isLoading && <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error instanceof Error ? error.message : 'Failed to load medicines'}</AlertDescription></Alert>}
      {!isLoading && !error && <DataTable data={medicines} columns={columns} emptyMessage="No medicines found" />}
    </DashboardLayout>
  );
};

export default AdminMedicines;
