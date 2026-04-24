import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { adminNavItems } from '@/constants/adminNavItems';
import { useAppointments } from '@/hooks/useAppointments';
import { AppointmentDto } from '@/services/appointmentService';

const AdminAppointments = () => {
  const { data: appointments = [], isLoading, error } = useAppointments();

  const formatDate = (d: string) => d?.split('T')[0] ?? d;
  const formatTime = (t: string) => t?.substring(0, 5) ?? t;

  const columns = [
    { key: 'patientName', header: 'Patient' },
    { key: 'doctorName', header: 'Doctor' },
    { key: 'department', header: 'Department' },
    { key: 'appointmentDate', header: 'Date', render: (a: AppointmentDto) => formatDate(a.appointmentDate) },
    { key: 'appointmentTime', header: 'Time', render: (a: AppointmentDto) => formatTime(a.appointmentTime) },
    { key: 'type', header: 'Type', render: (a: AppointmentDto) => <span className="capitalize">{a.type?.toLowerCase()}</span> },
    { key: 'status', header: 'Status', render: (a: AppointmentDto) => <StatusBadge status={a.status?.toLowerCase() as never} /> },
  ];

  return (
    <DashboardLayout navItems={adminNavItems} title="Appointments">
      <PageHeader title="All Appointments" description="View all scheduled appointments" />
      {isLoading && <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error instanceof Error ? error.message : 'Failed to load appointments'}</AlertDescription></Alert>}
      {!isLoading && !error && <DataTable data={appointments} columns={columns} emptyMessage="No appointments found" />}
    </DashboardLayout>
  );
};

export default AdminAppointments;
