import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { adminNavItems } from '@/constants/adminNavItems';
import { useData } from '@/contexts/DataContext';
import { Invoice } from '@/types';

const AdminTransactions = () => {
  const { invoices } = useData();

  const columns = [
    { key: 'id', header: 'Invoice #' },
    { key: 'patientName', header: 'Patient' },
    { key: 'date', header: 'Date' },
    { key: 'totalAmount', header: 'Total', render: (inv: Invoice) => `${inv.totalAmount?.toFixed(2) ?? '0.00'}` },
    { key: 'paidAmount', header: 'Paid', render: (inv: Invoice) => `${inv.paidAmount?.toFixed(2) ?? '0.00'}` },
    { key: 'status', header: 'Status', render: (inv: Invoice) => <StatusBadge status={inv.status} /> },
  ];

  return (
    <DashboardLayout navItems={adminNavItems} title="Transactions">
      <PageHeader title="Patient Transactions" description="View all patient transaction reports" />
      <DataTable data={invoices} columns={columns} emptyMessage="No transactions found" />
    </DashboardLayout>
  );
};

export default AdminTransactions;
