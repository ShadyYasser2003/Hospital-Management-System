import React, { useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/shared/StatCard';
import { Users, Calendar, FileText, DollarSign, Pill, FlaskConical } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import { adminNavItems } from '@/constants/adminNavItems';

const CHART_COLORS = [
  'hsl(210, 80%, 45%)',   // primary blue
  'hsl(175, 60%, 40%)',   // accent teal
  'hsl(142, 70%, 40%)',   // success green
  'hsl(38, 92%, 50%)',    // warning amber
  'hsl(0, 72%, 51%)',     // destructive red
  'hsl(199, 89%, 48%)',   // info blue
];

const AdminAnalytics = () => {
  const {
    patients, appointments, prescriptions, invoices, payments,
    testRequests, pharmacyCharges, labCharges,
  } = useData();

  const today = new Date().toISOString().split('T')[0];

  // ---- Derived statistics ----
  const stats = useMemo(() => {
    const todayAppts = appointments.filter(a => a.date === today);
    const apptByStatus = {
      pending: appointments.filter(a => a.status === 'pending').length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
    };

    const dispensedRx = prescriptions.filter(p => p.status === 'dispensed').length;
    const pendingRx = prescriptions.filter(p => p.status === 'pending').length;

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalOutstanding = invoices
      .filter(i => i.status !== 'paid')
      .reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0);
    const pharmacyTotal = pharmacyCharges.reduce((sum, c) => sum + c.totalAmount, 0);
    const labTotal = labCharges.reduce((sum, c) => sum + c.amount, 0);

    return {
      totalPatients: patients.length,
      totalAppointments: appointments.length,
      todayAppointments: todayAppts.length,
      apptByStatus,
      totalPrescriptions: prescriptions.length,
      dispensedRx,
      pendingRx,
      totalRevenue,
      totalOutstanding,
      pharmacyTotal,
      labTotal,
    };
  }, [patients, appointments, prescriptions, invoices, payments, pharmacyCharges, labCharges, today]);

  // ---- Chart data ----
  const appointmentBarData = useMemo(() => [
    { name: 'Pending', value: stats.apptByStatus.pending },
    { name: 'Confirmed', value: stats.apptByStatus.confirmed },
    { name: 'Completed', value: stats.apptByStatus.completed },
    { name: 'Cancelled', value: stats.apptByStatus.cancelled },
  ], [stats.apptByStatus]);

  const revenuePieData = useMemo(() => {
    const data = [];
    if (stats.pharmacyTotal > 0) data.push({ name: 'Pharmacy', value: stats.pharmacyTotal });
    if (stats.labTotal > 0) data.push({ name: 'Lab', value: stats.labTotal });
    const otherRevenue = stats.totalRevenue - stats.pharmacyTotal - stats.labTotal;
    if (otherRevenue > 0) data.push({ name: 'Other', value: otherRevenue });
    return data.length > 0 ? data : [{ name: 'No Data', value: 0 }];
  }, [stats]);

  const paymentLineData = useMemo(() => {
    const grouped: Record<string, number> = {};
    payments.forEach(p => {
      const key = p.date;
      grouped[key] = (grouped[key] || 0) + p.amount;
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date, amount }));
  }, [payments]);

  const prescriptionBarData = useMemo(() => [
    { name: 'Dispensed', value: stats.dispensedRx },
    { name: 'Pending', value: stats.pendingRx },
  ], [stats.dispensedRx, stats.pendingRx]);

  const formatCurrency = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <DashboardLayout navItems={adminNavItems} title="Analytics Dashboard">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Hospital Analytics</h1>
        <p className="text-muted-foreground">Real-time statistics derived from system data.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Patients" value={stats.totalPatients} icon={<Users className="h-6 w-6" />} variant="primary" />
        <StatCard title="Total Appointments" value={stats.totalAppointments} icon={<Calendar className="h-6 w-6" />} variant="accent" />
        <StatCard title="Today's Appointments" value={stats.todayAppointments} icon={<Calendar className="h-6 w-6" />} variant="success" />
        <StatCard title="Total Prescriptions" value={stats.totalPrescriptions} icon={<FileText className="h-6 w-6" />} variant="warning" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={<DollarSign className="h-6 w-6" />} variant="success" />
        <StatCard title="Outstanding" value={formatCurrency(stats.totalOutstanding)} icon={<DollarSign className="h-6 w-6" />} variant="warning" />
        <StatCard title="Pharmacy Charges" value={formatCurrency(stats.pharmacyTotal)} icon={<Pill className="h-6 w-6" />} variant="primary" />
        <StatCard title="Lab Charges" value={formatCurrency(stats.labTotal)} icon={<FlaskConical className="h-6 w-6" />} variant="accent" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Appointments by Status - Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appointments by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={appointmentBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {appointmentBarData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Sources - Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={revenuePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {revenuePieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Payments Over Time - Line */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payments Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentLineData.length === 0 ? (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                No payment data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={paymentLineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Line type="monotone" dataKey="amount" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Prescriptions - Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prescriptions Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={prescriptionBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {prescriptionBarData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
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
