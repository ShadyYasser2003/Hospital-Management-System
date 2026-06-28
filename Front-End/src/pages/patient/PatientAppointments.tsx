import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { LayoutDashboard, Calendar, Pill, Bell, User, ClipboardList, Plus, X, AlertCircle } from 'lucide-react';
import {
  useAppointmentsByPatient,
  useCreateAppointment,
  useCancelAppointment,
} from '@/hooks/useAppointments';
import { useMyPatientProfile } from '@/hooks/usePatients';
import { useDepartments } from '@/hooks/useDepartments';
import { useQuery } from '@tanstack/react-query';
import doctorService from '@/services/doctorService';
import { AppointmentDto } from '@/services/appointmentService';

const navItems = [
  { label: 'Dashboard', path: '/patient', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Appointments', path: '/patient/appointments', icon: <Calendar className="h-5 w-5" /> },
  { label: 'Prescriptions', path: '/patient/prescriptions', icon: <Pill className="h-5 w-5" /> },
  { label: 'Medical History', path: '/patient/history', icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'Notifications', path: '/patient/notifications', icon: <Bell className="h-5 w-5" /> },
  { label: 'Profile', path: '/patient/profile', icon: <User className="h-5 w-5" /> },
];

const PatientAppointments = () => {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  const { data: patient } = useMyPatientProfile();

  const { data: appointments = [], isLoading, error } = useAppointmentsByPatient(patient?.id);
  const { data: departments = [] } = useDepartments();
  const { data: doctors = [] } = useQuery({ queryKey: ['doctors'], queryFn: doctorService.getAll });
  const createAppointment = useCreateAppointment();
  const cancelAppointment = useCancelAppointment();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ department: '', doctorId: '', date: '', time: '', notes: '' });

  const filteredDoctors = formData.department
    ? doctors.filter((d) => {
        // Match by departmentName first (most reliable)
        if (d.departmentName) {
          return d.departmentName.toLowerCase() === formData.department.toLowerCase();
        }
        // Fallback: partial match between specialization and department name
        const spec = (d.specialization ?? '').toLowerCase();
        const dept = formData.department.toLowerCase();
        return spec.includes(dept.split(' ')[0]) || dept.includes(spec.split(' ')[0] ?? '');
      })
    : doctors;

  const upcoming = appointments.filter(
    (a) => a.appointmentDate >= today && a.status?.toUpperCase() !== 'CANCELLED',
  );
  const past = appointments.filter(
    (a) => a.appointmentDate < today || a.status?.toUpperCase() === 'COMPLETED',
  );

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) { toast.error('Patient profile not found'); return; }
    if (!formData.doctorId || !formData.date || !formData.time) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      await createAppointment.mutateAsync({
        patientId: patient.id,
        doctorId: Number(formData.doctorId),
        department: formData.department,
        appointmentDate: formData.date,
        appointmentTime: formData.time + ':00',
        type: 'CONSULTATION',
        notes: formData.notes,
      });
      toast.success('Appointment request submitted');
      setDialogOpen(false);
      setFormData({ department: '', doctorId: '', date: '', time: '', notes: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to book appointment');
    }
  };

  const handleCancel = async (a: AppointmentDto) => {
    try {
      await cancelAppointment.mutateAsync(a.id);
      toast.info('Appointment cancelled');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel appointment');
    }
  };

  const formatDate = (d: string) => d?.split('T')[0] ?? d;
  const formatTime = (t: string) => t?.substring(0, 5) ?? t;

  const upcomingColumns = [
    { key: 'doctorName', header: 'Doctor' },
    { key: 'department', header: 'Department' },
    { key: 'appointmentDate', header: 'Date', render: (a: AppointmentDto) => formatDate(a.appointmentDate) },
    { key: 'appointmentTime', header: 'Time', render: (a: AppointmentDto) => formatTime(a.appointmentTime) },
    { key: 'status', header: 'Status', render: (a: AppointmentDto) => <StatusBadge status={a.status?.toLowerCase() as never} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (a: AppointmentDto) =>
        a.status?.toUpperCase() !== 'CANCELLED' ? (
          <Button size="sm" variant="destructive" onClick={() => handleCancel(a)}>
            <X className="h-4 w-4 mr-1" /> Cancel
          </Button>
        ) : null,
    },
  ];

  const pastColumns = [
    { key: 'doctorName', header: 'Doctor' },
    { key: 'department', header: 'Department' },
    { key: 'appointmentDate', header: 'Date', render: (a: AppointmentDto) => formatDate(a.appointmentDate) },
    { key: 'appointmentTime', header: 'Time', render: (a: AppointmentDto) => formatTime(a.appointmentTime) },
    { key: 'status', header: 'Status', render: (a: AppointmentDto) => <StatusBadge status={a.status?.toLowerCase() as never} /> },
  ];

  // Generate time slots
  const timeSlots = [];
  for (let h = 8; h <= 17; h++) {
    timeSlots.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 17) timeSlots.push(`${String(h).padStart(2, '0')}:30`);
  }

  return (
    <DashboardLayout navItems={navItems} title="My Appointments">
      <PageHeader
        title="My Appointments"
        description="View and manage your appointments"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Request Appointment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Request New Appointment</DialogTitle></DialogHeader>
              <form onSubmit={handleRequest} className="space-y-4">
                <div>
                  <Label>Department</Label>
                  <Select onValueChange={(v) => setFormData({ ...formData, department: v, doctorId: '' })}>
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Doctor</Label>
                  <Select value={formData.doctorId} onValueChange={(v) => setFormData({ ...formData, doctorId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                    <SelectContent>
                      {filteredDoctors.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input type="date" value={formData.date} min={today} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Time</Label>
                    <Select value={formData.time} onValueChange={(v) => setFormData({ ...formData, time: v })}>
                      <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Notes (Optional)</Label>
                  <Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Reason for visit" />
                </div>
                <Button type="submit" className="w-full" disabled={createAppointment.isPending}>
                  {createAppointment.isPending ? 'Submitting...' : 'Submit Request'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading && <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error instanceof Error ? error.message : 'Failed to load appointments'}</AlertDescription></Alert>}

      {!isLoading && !error && (
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past Appointments</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            <DataTable data={upcoming} columns={upcomingColumns} emptyMessage="No upcoming appointments" />
          </TabsContent>
          <TabsContent value="past">
            <DataTable data={past} columns={pastColumns} emptyMessage="No past appointments" />
          </TabsContent>
        </Tabs>
      )}
    </DashboardLayout>
  );
};

export default PatientAppointments;
