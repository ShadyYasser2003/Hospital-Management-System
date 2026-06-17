import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { adminNavItems } from '@/constants/adminNavItems';
import { useTestRequests } from '@/hooks/useTestRequests';
import { TestRequestDto } from '@/services/testRequestService';

/**
 * AdminDiagnosis — shows all completed lab/imaging test results across the hospital.
 * Previously used mock data; now reads from /api/test-requests.
 */
const AdminDiagnosis = () => {
  const { data: tests = [], isLoading } = useTestRequests();

  const completed = tests.filter(t => t.status?.toUpperCase() === 'COMPLETED');

  const columns = [
    { key: 'patientName',  header: 'Patient' },
    { key: 'doctorName',   header: 'Doctor' },
    { key: 'technicianName', header: 'Technician', render: (t: TestRequestDto) => t.technicianName ?? '—' },
    { key: 'testType',     header: 'Test Type' },
    { key: 'completedAt',  header: 'Date', render: (t: TestRequestDto) => t.completedAt?.split('T')[0] ?? '—' },
    { key: 'results',      header: 'Results', render: (t: TestRequestDto) => (
      <span className="line-clamp-2 text-sm">{t.results || '—'}</span>
    )},
    { key: 'status', header: 'Status', render: (t: TestRequestDto) => <StatusBadge status={t.status?.toLowerCase() as never} /> },
  ];

  return (
    <DashboardLayout navItems={adminNavItems} title="Diagnosis Reports">
      <PageHeader title="Diagnosis & Lab Reports" description="All completed diagnostic test results" />
      {isLoading
        ? <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        : <DataTable data={completed} columns={columns} emptyMessage="No completed test results" />
      }
    </DashboardLayout>
  );
};

export default AdminDiagnosis;
