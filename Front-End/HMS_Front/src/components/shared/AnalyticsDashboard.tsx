import React, { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { UserRole } from '@/types';
import {
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area,
} from 'recharts';

interface AnalyticsDashboardProps {
  role: UserRole;
}

// Uses CSS variables so charts stay on-brand with the design system
const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--info))',
  'hsl(var(--destructive))',
];

const tooltipStyle = {
  borderRadius: 8,
  border: '1px solid hsl(var(--border))',
  background: 'hsl(var(--card))',
  color: 'hsl(var(--foreground))',
  fontSize: 12,
};

const axisStyle = { fontSize: 11, fill: 'hsl(var(--muted-foreground))' };

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ role }) => {
  const { user } = useAuth();
  const {
    patients, appointments, prescriptions, invoices, payments,
    pharmacyCharges, labCharges,
  } = useData();

  // ── Role-filtered datasets ──
  const filteredAppointments = useMemo(() => {
    if (role === 'doctor') return appointments.filter(a => a.doctorId === user?.id);
    return appointments;
  }, [role, appointments, user]);

  const filteredPrescriptions = useMemo(() => {
    if (role === 'doctor') return prescriptions.filter(p => p.doctorId === user?.id);
    return prescriptions;
  }, [role, prescriptions, user]);

  // ── Appointment status donut ──
  const apptDonut = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredAppointments.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [filteredAppointments]);

  // ── Appointments over time (area chart) ──
  const apptTimeline = useMemo(() => {
    const map: Record<string, number> = {};
    filteredAppointments.forEach(a => { map[a.date] = (map[a.date] || 0) + 1; });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date: date.slice(5), count }));
  }, [filteredAppointments]);

  // ── Revenue sources donut (admin / accountant) ──
  const revenueSources = useMemo(() => {
    const pharma = pharmacyCharges.reduce((s, c) => s + c.totalAmount, 0);
    const lab = labCharges.reduce((s, c) => s + c.amount, 0);
    const consultation = invoices.reduce((s, i) => s + i.paidAmount, 0);
    return [
      { name: 'Pharmacy', value: pharma },
      { name: 'Lab', value: lab },
      { name: 'Consultation', value: consultation },
    ].filter(r => r.value > 0);
  }, [pharmacyCharges, labCharges, invoices]);

  // ── Payments over time ──
  const paymentTimeline = useMemo(() => {
    const map: Record<string, number> = {};
    payments.forEach(p => { map[p.date] = (map[p.date] || 0) + p.amount; });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date: date.slice(5), amount }));
  }, [payments]);

  // ── Prescription status donut ──
  const rxDonut = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredPrescriptions.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [filteredPrescriptions]);

  const showFinancial = role === 'admin' || role === 'accountant';
  const showPrescriptions = role === 'admin' || role === 'doctor';

  // Nurse and receptionist only see appointment charts
  const chartsToShow = [
    { id: 'apptTrend', show: true },
    { id: 'apptDonut', show: true },
    { id: 'revSources', show: showFinancial },
    { id: 'payTrend', show: showFinancial },
    { id: 'rxDonut', show: showPrescriptions },
  ].filter(c => c.show);

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Analytics Overview</h2>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Appointment Trends */}
        <ChartCard title="Appointment Trends">
          {apptTimeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={apptTimeline} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradAppt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={axisStyle} stroke="hsl(var(--border))" />
                <YAxis allowDecimals={false} tick={axisStyle} stroke="hsl(var(--border))" />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Appointments"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill="url(#areaGradAppt)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </ChartCard>

        {/* Appointment Status Donut */}
        <ChartCard title="Appointment Status">
          {apptDonut.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={apptDonut}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={88}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {apptDonut.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </ChartCard>

        {/* Revenue Sources (admin / accountant) */}
        {showFinancial && (
          <ChartCard title="Revenue Sources">
            {revenueSources.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={revenueSources}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={88}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {revenueSources.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={tooltipStyle} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyState />}
          </ChartCard>
        )}

        {/* Payment Trends (admin / accountant) */}
        {showFinancial && (
          <ChartCard title="Payment Trends">
            {paymentTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={paymentTimeline} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGradPay" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={axisStyle} stroke="hsl(var(--border))" />
                  <YAxis tick={axisStyle} stroke="hsl(var(--border))" />
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    name="Revenue"
                    stroke="hsl(var(--success))"
                    strokeWidth={2.5}
                    fill="url(#areaGradPay)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : <EmptyState />}
          </ChartCard>
        )}

        {/* Prescription Status (admin / doctor) */}
        {showPrescriptions && (
          <ChartCard title="Prescription Status">
            {rxDonut.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={rxDonut}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={88}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {rxDonut.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyState />}
          </ChartCard>
        )}
      </div>
    </div>
  );
};

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
    <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
    {children}
  </div>
);

const EmptyState = () => (
  <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm">
    No data available
  </div>
);

export default AnalyticsDashboard;
