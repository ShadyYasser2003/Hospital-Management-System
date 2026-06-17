import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { adminNavItems } from '@/constants/adminNavItems';
import { useInvoices } from '@/hooks/useInvoices';
import { InvoiceDto } from '@/services/invoiceService';

const AdminTransactions = () => {
  const { data: page, isLoading, error } = useInvoices(0, 100);
  const invoices = page?.content ?? [];

  const columns = [
    { key: 'invoiceNumber', header: 'Invoice #' },
    { key: 'patientName',   header: 'Patient' },
    { key: 'createdAt',     header: 'Date',    render: (i: InvoiceDto) => i.createdAt?.split('T')[0] },
    { key: 'totalAmount',   header: 'Total',   render: (i: InvoiceDto) => `$${i.totalAmount?.toFixed(2) ?? '0.00'}` },
    { key: 'paidAmount',    header: 'Paid',    render: (i: InvoiceDto) => `$${i.paidAmount?.toFixed(2) ?? '0.00'}` },
    { key: 'balance',       header: 'Balance', render: (i: InvoiceDto) => `$${i.balance?.toFixed(2) ?? '0.00'}` },
    { key: 'status',        header: 'Status',  render: (i: InvoiceDto) => <StatusBadge status={i.status?.toLowerCase() as never} /> },
  ];

  return (
    <DashboardLayout navItems={adminNavItems} title="Transactions">
      <PageHeader title="Patient Transactions" description="View all patient billing and payment records" />
      {isLoading && <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error instanceof Error ? error.message : 'Failed to load transactions'}</AlertDescription></Alert>}
      {!isLoading && !error && <DataTable data={invoices} columns={columns} emptyMessage="No transactions found" />}
    </DashboardLayout>
  );
};

export default AdminTransactions;
