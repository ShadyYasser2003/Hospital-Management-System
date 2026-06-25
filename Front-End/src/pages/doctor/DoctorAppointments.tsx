import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { doctorNavItems } from './DoctorDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useAppointmentsByDoctor,
  useConfirmAppointment,
  useCompleteAppointment,
  useCancelAppointment,
} from '@/hooks/useAppointments';
import { AppointmentDto } from '@/services/appointmentService';

const DoctorAppointments = () => {
  const { user } = useAuth();
  const { data: appointments = [], isLoading, error } = useAppointmentsByDoctor(user?.id);
  const confirmMutation = useConfirmAppointment();
  const completeMutation = useCompleteAppointment();
  const cancelMutation = useCancelAppointment();

  const pending = appointments.filter(a => a.status?.toUpperCase() === 'PENDING');
  const confirmed = appointments.filter(a => a.status?.toUpperCase() === 'CONFIRMED');
  const completed = appointments.filter(a => a.status?.toUpperCase() === 'COMPLETED');

  const handleApprove = async (a: AppointmentDto) => {
    try {
      await confirmMutation.mutateAsync(a.id);
      toast.success('Appointment confirmed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to confirm appointment');
    }
  };

  const handleReject = async (a: AppointmentDto) => {
    try {
      await cancelMutation.mutateAsync(a.id);
      toast.success('Appointment cancelled');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel appointment');
    }
  };

  const handleComplete = async (a: AppointmentDto) => {
    try {
      await completeMutation.mutateAsync(a.id);
      toast.success('Appointment marked as completed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to complete appointment');
    }
  };

  const formatDate = (d: string) => d?.split('T')[0] ?? d;
  const formatTime = (t: string) => t?.substring(0, 5) ?? t;

  const columns = [
    { key: 'patientName', header: 'Patient' },
    { key: 'appointmentDate', header: 'Date', render: (a: AppointmentDto) => formatDate(a.appointmentDate) },
    { key: 'appointmentTime', header: 'Time', render: (a: AppointmentDto) => formatTime(a.appointmentTime) },
    { key: 'type', header: 'Type', render: (a: AppointmentDto) => <span className="capitalize">{a.type?.toLowerCase()}</span> },
    { key: 'status', header: 'Status', render: (a: AppointmentDto) => <StatusBadge status={a.status?.toLowerCase() as never} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (a: AppointmentDto) => (
        <div className="flex gap-2">
          {a.status?.toUpperCase() === 'PENDING' && (
            <>
              <Button variant="ghost" size="sm" onClick={() => handleApprove(a)} className="text-success hover:text-success">
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleReject(a)} className="text-destructive hover:text-destructive">
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}
          {a.status?.toUpperCase() === 'CONFIRMED' && (
            <Button variant="ghost" size="sm" onClick={() => handleComplete(a)}>
              <Clock className="h-4 w-4 mr-1" />Complete
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout navItems={doctorNavItems} title="Appointments">
        <PageHeader title="Appointments" description="Manage your patient appointments" />
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout navItems={doctorNavItems} title="Appointments">
        <PageHeader title="Appointments" description="Manage your patient appointments" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error instanceof Error ? error.message : 'Failed to load appointments'}</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={doctorNavItems} title="Appointments">
      <PageHeader title="Appointments" description="Manage your patient appointments" />
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed ({confirmed.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <DataTable data={pending} columns={columns} emptyMessage="No pending appointments" />
        </TabsContent>
        <TabsContent value="confirmed">
          <DataTable data={confirmed} columns={columns} emptyMessage="No confirmed appointments" />
        </TabsContent>
        <TabsContent value="completed">
          <DataTable data={completed} columns={columns.filter(c => c.key !== 'actions')} emptyMessage="No completed appointments" />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default DoctorAppointments;
