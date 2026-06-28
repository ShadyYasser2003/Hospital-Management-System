import React, { useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usePatients } from '@/hooks/usePatients';
import { useAppointments } from '@/hooks/useAppointments';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import { useInvoices } from '@/hooks/useInvoices';
import { useBloodUnits, useBloodRequests } from '@/hooks/useBloodBank';
import { useLabTests } from '@/hooks/useLabTests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/shared/StatCard';
import {
  Users, Calendar, FileText, DollarSign, Pill, Droplets,
  FlaskConical, BedDouble, TrendingUp, Activity,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from 'recharts';
import { adminNavItems } from '@/constants/adminNavItems';

const COLORS = [
  '#2563eb', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#84cc16',
];

const fmt = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

const AdminAnalytics = () => {
  const { data: patients = [] }      = usePatients();
  const { data: appointments = [] }  = useAppointments();
  const { data: prescriptions = [] } = usePrescriptions();
  const { data: invoicePage }        = useInvoices(0, 500);
  const { data: bloodUnits = [] }    = useBloodUnits();
  const { data: bloodRequests = [] } = useBloodRequests();
  const { data: labTests = [] }      = useLabTests();
  const invoices = invoicePage?.content ?? [];

  const today = new Date().toISOString().split('T')[0];

  const stats = useMemo(() => {
    const admitted   = patients.filter(p => p.status?.toUpperCase() === 'ADMITTED').length;
    const discharged = patients.filter(p => p.status?.toUpperCase() === 'DISCHARGED').length;
    const active     = patients.filter(p => p.status?.toUpperCase() === 'ACTIVE').length;

    const todayAppts    = appointments.filter(a => a.appointmentDate === today).length;
    const pendingAppt   = appointments.filter(a => a.status?.toUpperCase() === 'PENDING').length;
    const confirmedAppt = appointments.filter(a => a.status?.toUpperCase() === 'CONFIRMED').length;
    const completedAppt = appointments.filter(a => a.status?.toUpperCase() === 'COMPLETED').length;
    const cancelledAppt = appointments.filter(a => a.status?.toUpperCase() === 'CANCELLED').length;

    const totalRevenue     = invoices.reduce((s, i) => s + (i.paidAmount ?? 0), 0);
    const totalOutstanding = invoices.reduce((s, i) => s + (i.balance ?? 0), 0);
    const paidInvoices     = invoices.filter(i => i.status?.toUpperCase() === 'PAID').length;
    const pendingInvoices  = invoices.filter(i => i.status?.toUpperCase() === 'PENDING').length;

    const pendingRx   = prescriptions.filter(p => p.status?.toUpperCase() === 'PENDING').length;
    const dispensedRx = prescriptions.filter(p => p.status?.toUpperCase() === 'DISPENSED').length;

    const availableBlood  = bloodUnits.filter(u => u.status === 'AVAILABLE').reduce((s, u) => s + (u.quantity ?? 0), 0);
    const pendingBloodReq = bloodRequests.filter(r => r.status === 'PENDING').length;

    const completedLabTests = labTests.filter(t => t.status?.toUpperCase() === 'COMPLETED').length;
    const pendingLabTests   = labTests.filter(t => t.status?.toUpperCase() === 'PENDING' || t.status?.toUpperCase() === 'ORDERED').length;

    return {
      admitted, discharged, active,
      todayAppts, pendingAppt, confirmedAppt, completedAppt, cancelledAppt,
      totalRevenue, totalOutstanding, paidInvoices, pendingInvoices,
      pendingRx, dispensedRx,
      availableBlood, pendingBloodReq,
      completedLabTests, pendingLabTests,
    };
  }, [patients, appointments, invoices, prescriptions, bloodUnits, bloodRequests, labTests, today]);

  const apptStatusData = [
    { name: 'Pending',   value: stats.pendingAppt },
    { name: 'Confirmed', value: stats.confirmedAppt },
    { name: 'Completed', value: stats.completedAppt },
    { name: 'Cancelled', value: stats.cancelledAppt },
  ].filter(d => d.value > 0);

  const patientStatusData = [
    { name: 'Active',     value: stats.active },
    { name: 'Admitted',   value: stats.admitted },
    { name: 'Discharged', value: stats.discharged },
  ].filter(d => d.value > 0);

  const bloodTypeData = useMemo(() => {
    const map: Record<string, number> = {};
    bloodUnits.filter(u => u.status === 'AVAILABLE').forEach(u => {
      const bt = u.bloodType?.replace('_POSITIVE', '+').replace('_NEGATIVE', '-') ?? u.bloodType;
      map[bt] = (map[bt] ?? 0) + (u.quantity ?? 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [bloodUnits]);

  const revenueTimeData = useMemo(() => {
    const map: Record<string, number> = {};
    invoices.forEach(i => {
      const d = i.createdAt?.split('T')[0]?.slice(0, 7) ?? '';
      if (d) map[d] = (map[d] ?? 0) + (i.paidAmount ?? 0);
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, amount]) => ({ month, amount: Math.round(amount) }));
  }, [invoices]);

  const apptMonthData = useMemo(() => {
    const map: Record<string, number> = {};
    appointments.forEach(a => {
      const m = a.appointmentDate?.slice(0, 7) ?? '';
      if (m) map[m] = (map[m] ?? 0) + 1;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, count]) => ({ month, count }));
  }, [appointments]);

  const invoiceStatusData = [
    { name: 'Paid',    value: stats.paidInvoices },
    { name: 'Pending', value: stats.pendingInvoices },
    { name: 'Partial', value: invoices.filter(i => i.status?.toUpperCase() === 'PARTIAL').length },
  ].filter(d => d.value > 0);

  return (
    <DashboardLayout navItems={adminNavItems} title="Analytics">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Hospital Analytics</h1>
        <p className="text-muted-foreground">Live statistics from all hospital operations</p>
      </div>

      {/* ── Row 1: Key stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard title="Total Patients"  value={String(patients.length)}       icon={<Users className="h-5 w-5" />}       variant="primary" />
        <StatCard title="Admitted"        value={String(stats.admitted)}         icon={<BedDouble className="h-5 w-5" />}   variant="accent" />
        <StatCard title="Today's Appts"   value={String(stats.todayAppts)}       icon={<Calendar className="h-5 w-5" />}   variant="success" />
        <StatCard title="Total Revenue"   value={fmt(stats.totalRevenue)}        icon={<DollarSign className="h-5 w-5" />} variant="success" />
        <StatCard title="Outstanding"     value={fmt(stats.totalOutstanding)}    icon={<TrendingUp className="h-5 w-5" />} variant="warning" />
        <StatCard title="Blood Units"     value={String(stats.availableBlood)}   icon={<Droplets className="h-5 w-5" />}   variant="primary" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard title="All Appointments" value={String(appointments.length)}   icon={<Calendar className="h-5 w-5" />}     variant="accent" />
        <StatCard title="Prescriptions"    value={String(prescriptions.length)}  icon={<Pill className="h-5 w-5" />}          variant="warning" />
        <StatCard title="Lab Tests"        value={String(labTests.length)}       icon={<FlaskConical className="h-5 w-5" />}  variant="primary" />
        <StatCard title="Invoices"         value={String(invoices.length)}       icon={<FileText className="h-5 w-5" />}      variant="accent" />
        <StatCard title="Blood Requests"   value={String(bloodRequests.length)}  icon={<Droplets className="h-5 w-5" />}      variant="warning" />
        <StatCard title="Active Patients"  value={String(stats.active)}          icon={<Activity className="h-5 w-5" />}     variant="success" />
      </div>

      {/* ── Row 2: Trend charts ── */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Appointments per Month</CardTitle></CardHeader>
          <CardContent>
            {apptMonthData.length === 0
              ? <p className="text-center text-muted-foreground py-20">No data</p>
              : <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={apptMonthData}>
                    <defs>
                      <linearGradient id="apptGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={COLORS[0]} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke={COLORS[0]} fill="url(#apptGrad)" strokeWidth={2} dot={{ r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
            }
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Revenue per Month ($)</CardTitle></CardHeader>
          <CardContent>
            {revenueTimeData.length === 0
              ? <p className="text-center text-muted-foreground py-20">No data</p>
              : <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenueTimeData}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={COLORS[2]} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS[2]} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Area type="monotone" dataKey="amount" stroke={COLORS[2]} fill="url(#revGrad)" strokeWidth={2} dot={{ r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
            }
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: Pie charts ── */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Appointment Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={apptStatusData.length ? apptStatusData : [{ name: 'No data', value: 1 }]}
                  cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {(apptStatusData.length ? apptStatusData : [{ name: 'No data', value: 1 }]).map((_, i) =>
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Patient Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={patientStatusData.length ? patientStatusData : [{ name: 'No data', value: 1 }]}
                  cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {(patientStatusData.length ? patientStatusData : [{ name: 'No data', value: 1 }]).map((_, i) =>
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Invoice Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={invoiceStatusData.length ? invoiceStatusData : [{ name: 'No data', value: 1 }]}
                  cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {(invoiceStatusData.length ? invoiceStatusData : [{ name: 'No data', value: 1 }]).map((_, i) =>
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 4: Bar charts ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2">
            <Droplets className="h-4 w-4 text-red-500" />Blood Inventory (Available Units)
          </CardTitle></CardHeader>
          <CardContent>
            {bloodTypeData.length === 0
              ? <p className="text-center text-muted-foreground py-16">No available blood units</p>
              : <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={bloodTypeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={45} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {bloodTypeData.map((_, i) => <Cell key={i} fill={COLORS[3]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
            }
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Prescriptions & Lab Tests</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={[
                { name: 'Rx — Pending',    value: stats.pendingRx },
                { name: 'Rx — Dispensed',  value: stats.dispensedRx },
                { name: 'Lab — Pending',   value: stats.pendingLabTests },
                { name: 'Lab — Completed', value: stats.completedLabTests },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {[0, 1, 2, 3].map(i => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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
