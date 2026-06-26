import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, XCircle, ClipboardCheck } from 'lucide-react';
import { adminNavItems } from '@/constants/adminNavItems';
import { useAppointments, useConfirmAppointment, useCompleteAppointment, useCancelAppointment } from '@/hooks/useAppointments';
import { AppointmentDto } from '@/services/appointmentService';
import { toast } from 'sonner';

const AdminAppointments = () => {
  const { data: appointments = [], isLoading, error } = useAppointments();
  const confirmAppointment  = useConfirmAppointment();
  const completeAppointment = useCompleteAppointment();
  const cancelAppointment   = useCancelAppointment();

  const formatDate = (d: string) => d?.split('T')[0] ?? d;
  const formatTime = (t: string) => t?.substring(0, 5) ?? t;

  const handleConfirm = async (id: number) => {
    try {
      await confirmAppointment.mutateAsync(id);
      toast.success('Appointment confirmed');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to confirm'); }
  };

  const handleComplete = async (id: number) => {
    try {
      await completeAppointment.mutateAsync(id);
      toast.success('Appointment marked as completed');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to complete'); }
  };

  const handleCancel = async (id: number) => {
    try {
      await cancelAppointment.mutateAsync(id);
      toast.success('Appointment cancelled');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to cancel'); }
  };

  const columns = [
    { key: 'patientName',      header: 'Patient' },
    { key: 'doctorName',       header: 'Doctor' },
    { key: 'department',       header: 'Department' },
    { key: 'appointmentDate',  header: 'Date',   render: (a: AppointmentDto) => formatDate(a.appointmentDate) },
    { key: 'appointmentTime',  header: 'Time',   render: (a: AppointmentDto) => formatTime(a.appointmentTime) },
    { key: 'type',             header: 'Type',   render: (a: AppointmentDto) => <span className="capitalize">{a.type?.toLowerCase()}</span> },
    { key: 'notes',            header: 'Notes',  render: (a: AppointmentDto) => a.notes ? <span className="text-sm text-muted-foreground">{a.notes}</span> : '—' },
    { key: 'status',           header: 'Status', render: (a: AppointmentDto) => <StatusBadge status={a.status?.toLowerCase() as never} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (a: AppointmentDto) => {
        const status = a.status?.toUpperCase();
        return (
          <div className="flex gap-1">
            {status === 'PENDING' && (
              <Button
                variant="ghost" size="sm" title="Confirm appointment"
                onClick={() => handleConfirm(a.id)}
                disabled={confirmAppointment.isPending}
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
              </Button>
            )}
            {(status === 'PENDING' || status === 'CONFIRMED') && (
              <>
                <Button
                  variant="ghost" size="sm" title="Mark as completed"
                  onClick={() => handleComplete(a.id)}
                  disabled={completeAppointment.isPending}
                >
                  <ClipboardCheck className="h-4 w-4 text-blue-500" />
                </Button>
                <Button
                  variant="ghost" size="sm" title="Cancel appointment"
                  onClick={() => handleCancel(a.id)}
                  disabled={cancelAppointment.isPending}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <DashboardLayout navItems={adminNavItems} title="Appointments">
      <PageHeader title="All Appointments" description="View and manage all scheduled appointments" />
      {isLoading && <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error instanceof Error ? error.message : 'Failed to load appointments'}</AlertDescription></Alert>}
      {!isLoading && !error && <DataTable data={appointments} columns={columns} emptyMessage="No appointments found" />}
    </DashboardLayout>
  );
};

export default AdminAppointments;
