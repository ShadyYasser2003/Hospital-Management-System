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
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { LayoutDashboard, UserPlus, Search, Calendar, LogOut, User, Plus, Check, X, AlertCircle } from 'lucide-react';
import { useAppointments, useCreateAppointment, useConfirmAppointment, useCancelAppointment } from '@/hooks/useAppointments';
import { usePatients } from '@/hooks/usePatients';
import { useDepartments } from '@/hooks/useDepartments';
import { useQuery } from '@tanstack/react-query';
import doctorService from '@/services/doctorService';
import { AppointmentDto } from '@/services/appointmentService';

const navItems = [
  { label: 'Dashboard', path: '/receptionist', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Register Patient', path: '/receptionist/register', icon: <UserPlus className="h-5 w-5" /> },
  { label: 'Search Patient', path: '/receptionist/search', icon: <Search className="h-5 w-5" /> },
  { label: 'Appointments', path: '/receptionist/appointments', icon: <Calendar className="h-5 w-5" /> },
  { label: 'Check Out', path: '/receptionist/checkout', icon: <LogOut className="h-5 w-5" /> },
  { label: 'Profile', path: '/receptionist/profile', icon: <User className="h-5 w-5" /> },
];

const ReceptionistAppointments = () => {
  const { data: appointments = [], isLoading, error } = useAppointments();
  const { data: patients = [] } = usePatients();
  const { data: departments = [] } = useDepartments();
  const { data: doctors = [] } = useQuery({ queryKey: ['doctors'], queryFn: doctorService.getAll });
  const createAppointment = useCreateAppointment();
  const confirmAppointment = useConfirmAppointment();
  const cancelAppointment = useCancelAppointment();

  const today = new Date().toISOString().split('T')[0];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '', department: '', doctorId: '', date: '',
    time: '', type: 'CONSULTATION', notes: '',
  });

  const filteredDoctors = formData.department
    ? doctors.filter((d) => d.specialization?.toLowerCase().includes(formData.department.toLowerCase()))
    : doctors;

  const pending = appointments.filter((a) => a.status?.toUpperCase() === 'PENDING');

  const formatDate = (d: string) => d?.split('T')[0] ?? d;
  const formatTime = (t: string) => t?.substring(0, 5) ?? t;

  // Generate time slots 08:00 - 17:00
  const timeSlots: string[] = [];
  for (let h = 8; h <= 17; h++) {
    timeSlots.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 17) timeSlots.push(`${String(h).padStart(2, '0')}:30`);
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId || !formData.doctorId || !formData.date || !formData.time) {
      toast.error('Please fill all required fields'); return;
    }
    try {
      await createAppointment.mutateAsync({
        patientId: Number(formData.patientId),
        doctorId: Number(formData.doctorId),
        department: formData.department,
        appointmentDate: formData.date,
        appointmentTime: formData.time + ':00',
        type: formData.type,
        notes: formData.notes,
      });
      toast.success('Appointment booked successfully');
      setDialogOpen(false);
      setFormData({ patientId: '', department: '', doctorId: '', date: '', time: '', type: 'CONSULTATION', notes: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to book appointment');
    }
  };

  const handleConfirm = async (a: AppointmentDto) => {
    try { await confirmAppointment.mutateAsync(a.id); toast.success('Appointment confirmed'); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const handleCancel = async (a: AppointmentDto) => {
    try { await cancelAppointment.mutateAsync(a.id); toast.info('Appointment cancelled'); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const pendingColumns = [
    { key: 'patientName', header: 'Patient' },
    { key: 'doctorName', header: 'Doctor' },
    { key: 'appointmentDate', header: 'Date', render: (a: AppointmentDto) => formatDate(a.appointmentDate) },
    { key: 'appointmentTime', header: 'Time', render: (a: AppointmentDto) => formatTime(a.appointmentTime) },
    { key: 'type', header: 'Type', render: (a: AppointmentDto) => <span className="capitalize">{a.type?.toLowerCase()}</span> },
    {
      key: 'actions', header: 'Actions',
      render: (a: AppointmentDto) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleConfirm(a)}><Check className="h-4 w-4" /></Button>
          <Button size="sm" variant="destructive" onClick={() => handleCancel(a)}><X className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  const allColumns = [
    { key: 'patientName', header: 'Patient' },
    { key: 'doctorName', header: 'Doctor' },
    { key: 'department', header: 'Department' },
    { key: 'appointmentDate', header: 'Date', render: (a: AppointmentDto) => formatDate(a.appointmentDate) },
    { key: 'appointmentTime', header: 'Time', render: (a: AppointmentDto) => formatTime(a.appointmentTime) },
    { key: 'status', header: 'Status', render: (a: AppointmentDto) => <StatusBadge status={a.status?.toLowerCase() as never} /> },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Appointments">
      <PageHeader
        title="Appointment Management"
        description="Book and manage patient appointments"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Book Appointment</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Book New Appointment</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label>Patient</Label>
                  <Select onValueChange={(v) => setFormData({ ...formData, patientId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.nationalId})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
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
                  <div><Label>Date</Label><Input type="date" value={formData.date} min={today} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required /></div>
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
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONSULTATION">Consultation</SelectItem>
                      <SelectItem value="FOLLOW_UP">Follow-up</SelectItem>
                      <SelectItem value="EMERGENCY">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Notes</Label><Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>
                <Button type="submit" className="w-full" disabled={createAppointment.isPending}>
                  {createAppointment.isPending ? 'Booking...' : 'Book Appointment'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading && <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error instanceof Error ? error.message : 'Failed to load appointments'}</AlertDescription></Alert>}

      {!isLoading && !error && (
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending Requests ({pending.length})</TabsTrigger>
            <TabsTrigger value="all">All Appointments ({appointments.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            <DataTable data={pending} columns={pendingColumns} emptyMessage="No pending requests" />
          </TabsContent>
          <TabsContent value="all">
            <DataTable data={appointments} columns={allColumns} />
          </TabsContent>
        </Tabs>
      )}
    </DashboardLayout>
  );
};

export default ReceptionistAppointments;
