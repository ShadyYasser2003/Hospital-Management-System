import React, { useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usePatients } from '@/hooks/usePatients';
import { useAppointments } from '@/hooks/useAppointments';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import { useInvoices } from '@/hooks/useInvoices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/shared/StatCard';
import { Users, Calendar, FileText, DollarSign, Pill, FlaskConical } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import { adminNavItems } from '@/constants/adminNavItems';

const CHART_COLORS = [
  'hsl(210, 80%, 45%)',
  'hsl(175, 60%, 40%)',
  'hsl(142, 70%, 40%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 72%, 51%)',
  'hsl(199, 89%, 48%)',
];

const AdminAnalytics = () => {
  const { data: patients = [] }      = usePatients();
  const { data: appointments = [] }  = useAppointments();
  const { data: prescriptions = [] } = usePrescriptions();
  const { data: invoicePage }        = useInvoices(0, 200);
  const invoices = invoicePage?.content ?? [];

  const today = new Date().toISOString().split('T')[0];

  const stats = useMemo(() => {
    const todayAppts = appointments.filter(a => a.appointmentDate === today);
    const apptByStatus = {
      pending:   appointments.filter(a => a.status?.toUpperCase() === 'PENDING').length,
      confirmed: appointments.filter(a => a.status?.toUpperCase() === 'CONFIRMED').length,
      completed: appointments.filter(a => a.status?.toUpperCase() === 'COMPLETED').length,
      cancelled: appointments.filter(a => a.status?.toUpperCase() === 'CANCELLED').length,
    };
    const dispensedRx = prescriptions.filter(p => p.status?.toUpperCase() === 'DISPENSED').length;
    const pendingRx   = prescriptions.filter(p => p.status?.toUpperCase() === 'PENDING').length;
    const totalRevenue     = invoices.reduce((s, i) => s + (i.paidAmount ?? 0), 0);
    const totalOutstanding = invoices.filter(i => i.status?.toUpperCase() !== 'PAID')
                                     .reduce((s, i) => s + (i.balance ?? 0), 0);
    return { todayAppointments: todayAppts.length, apptByStatus, dispensedRx, pendingRx, totalRevenue, totalOutstanding };
  }, [appointments, prescriptions, invoices, today]);

  const appointmentBarData = [
    { name: 'Pending',   value: stats.apptByStatus.pending },
    { name: 'Confirmed', value: stats.apptByStatus.confirmed },
    { name: 'Completed', value: stats.apptByStatus.completed },
    { name: 'Cancelled', value: stats.apptByStatus.cancelled },
  ];

  const revenuePieData = useMemo(() => {
    const paid    = invoices.filter(i => i.status?.toUpperCase() === 'PAID').reduce((s, i) => s + (i.paidAmount ?? 0), 0);
    const pending = invoices.filter(i => i.status?.toUpperCase() !== 'PAID').reduce((s, i) => s + (i.balance ?? 0), 0);
    return [
      { name: 'Collected',    value: paid },
      { name: 'Outstanding',  value: pending },
    ].filter(r => r.value > 0);
  }, [invoices]);

  const paymentLineData = useMemo(() => {
    const map: Record<string, number> = {};
    invoices.forEach(i => {
      const d = i.createdAt?.split('T')[0] ?? '';
      if (d) map[d] = (map[d] || 0) + (i.paidAmount ?? 0);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date: date.slice(5), amount }));
  }, [invoices]);

  const prescriptionBarData = [
    { name: 'Dispensed', value: stats.dispensedRx },
    { name: 'Pending',   value: stats.pendingRx },
  ];

  const fmt = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <DashboardLayout navItems={adminNavItems} title="Analytics Dashboard">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Hospital Analytics</h1>
        <p className="text-muted-foreground">Real-time statistics from the system.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Patients"        value={String(patients.length)}              icon={<Users className="h-6 w-6" />}       variant="primary" />
        <StatCard title="Total Appointments"    value={String(appointments.length)}          icon={<Calendar className="h-6 w-6" />}    variant="accent" />
        <StatCard title="Today's Appointments"  value={String(stats.todayAppointments)}      icon={<Calendar className="h-6 w-6" />}    variant="success" />
        <StatCard title="Total Prescriptions"   value={String(prescriptions.length)}         icon={<FileText className="h-6 w-6" />}    variant="warning" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Revenue"    value={fmt(stats.totalRevenue)}     icon={<DollarSign className="h-6 w-6" />} variant="success" />
        <StatCard title="Outstanding"      value={fmt(stats.totalOutstanding)} icon={<DollarSign className="h-6 w-6" />} variant="warning" />
        <StatCard title="Dispensed Rx"     value={String(stats.dispensedRx)}   icon={<Pill className="h-6 w-6" />}       variant="primary" />
        <StatCard title="Total Invoices"   value={String(invoices.length)}     icon={<FlaskConical className="h-6 w-6" />} variant="accent" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Appointments by Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={appointmentBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {appointmentBarData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Revenue Overview</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={revenuePieData.length ? revenuePieData : [{ name: 'No Data', value: 1 }]}
                  cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {(revenuePieData.length ? revenuePieData : [{ name: 'No Data', value: 1 }]).map((_, i) =>
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip formatter={(v: number) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Revenue Over Time</CardTitle></CardHeader>
          <CardContent>
            {paymentLineData.length === 0
              ? <div className="flex items-center justify-center h-[280px] text-muted-foreground">No data yet</div>
              : <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={paymentLineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,88%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Line type="monotone" dataKey="amount" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
            }
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Prescription Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={prescriptionBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {prescriptionBarData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
