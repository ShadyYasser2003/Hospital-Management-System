import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/shared/StatCard';
import ProfileForm from '@/components/shared/ProfileForm';
import { useAuth } from '@/contexts/AuthContext';
import { useDiagnosticOrdersByTechnician } from '@/hooks/useDiagnosticOrders';
import { useUnreadCount } from '@/hooks/useNotifications';
import { useBloodUnits, useBloodRequests } from '@/hooks/useBloodBank';
import { BLOOD_TYPES, fmtBloodType, daysUntilExpiry, inventorySummary } from '@/lib/bloodBankUtils';
import { technicianNavItems } from '@/constants/technicianNavItems';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText, Clock, Bell, Inbox, Droplets, AlertCircle, Package, ArrowRight,
} from 'lucide-react';

export const TechnicianDashboard: React.FC = () => {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  const { available, active, completed } = useDiagnosticOrdersByTechnician(user?.id);
  const { data: unreadCount = 0 } = useUnreadCount(user?.id);
  const { data: units = [] }    = useBloodUnits();
  const { data: requests = [] } = useBloodRequests();

  const completedToday = completed.filter(o => o.completedAt?.startsWith(today)).length;

  // ── blood derivations ──────────────────────────────────────────────────────
  const summary       = inventorySummary(units);
  const totalAvail    = Object.values(summary).reduce((a, b) => a + b, 0);
  const pendingReqs   = requests.filter(r => r.status === 'PENDING');
  const reservedReqs  = requests.filter(r => r.status === 'RESERVED');
  const expiringSoon  = units.filter(u => {
    const d = daysUntilExpiry(u.expiryDate);
    return u.status === 'AVAILABLE' && d !== null && d >= 0 && d <= 7;
  });
  const lowStockTypes = BLOOD_TYPES.filter(bt => (summary[bt.value] ?? 0) < 5);

  return (
    <DashboardLayout navItems={technicianNavItems} title="Technician Dashboard">
      <h1 className="text-2xl font-bold mb-2">Welcome, {user?.name}!</h1>
      <p className="text-muted-foreground mb-8">Manage diagnostic tests, imaging reports, and the blood bank</p>

      {/* Diagnostic stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Available Requests" value={String(available.length)} icon={<Inbox className="h-6 w-6" />}    variant="warning" />
        <StatCard title="In Progress"        value={String(active.length)}    icon={<Clock className="h-6 w-6" />}    variant="primary" />
        <StatCard title="Completed Today"    value={String(completedToday)}   icon={<FileText className="h-6 w-6" />} variant="success" />
        <StatCard title="Notifications"      value={String(unreadCount)}      icon={<Bell className="h-6 w-6" />}     variant="accent" />
      </div>

      {/* Blood bank quick view */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Droplets className="h-5 w-5 text-red-600" /> Blood Bank
        </h2>
        <Button asChild variant="outline" size="sm">
          <Link to="/technician/blood-bank">
            Open Blood Bank <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Units Available" value={String(totalAvail)}        icon={<Droplets className="h-6 w-6" />}    variant="primary" />
        <StatCard title="Pending Requests"      value={String(pendingReqs.length)} icon={<AlertCircle className="h-6 w-6" />} variant="warning" />
        <StatCard title="Ready to Dispense"     value={String(reservedReqs.length)} icon={<Package className="h-6 w-6" />}    variant="accent" />
        <StatCard title="Expiring ≤ 7 days"     value={String(expiringSoon.length)} icon={<Clock className="h-6 w-6" />}      variant="warning" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inventory by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {BLOOD_TYPES.map(bt => {
                const qty = summary[bt.value] ?? 0;
                return (
                  <span key={bt.value} className={`px-3 py-1 rounded-full text-sm font-semibold border
                    ${qty === 0 ? 'bg-red-100 text-red-700 border-red-300'
                      : qty < 5  ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                                 : 'bg-green-50 text-green-700 border-green-200'}`}>
                    {bt.label}: {qty}
                  </span>
                );
              })}
            </div>
            {lowStockTypes.length > 0 && (
              <p className="text-xs text-yellow-700 mt-3 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                Low stock: {lowStockTypes.map(t => t.label).join(', ')}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Action Queue
              {(reservedReqs.length + pendingReqs.length) > 0 && (
                <Badge variant="destructive">{reservedReqs.length + pendingReqs.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {reservedReqs.slice(0, 4).map(r => (
              <Link key={r.id} to="/technician/blood-bank"
                className="flex items-center justify-between p-2 rounded border hover:bg-accent transition">
                <div className="text-sm">
                  <span className="font-semibold text-red-600">{fmtBloodType(r.bloodType)}</span>
                  <span className="text-muted-foreground"> · {r.quantity}u · {r.patientName}</span>
                </div>
                <Badge className="bg-green-600 text-white">Ready</Badge>
              </Link>
            ))}
            {pendingReqs.slice(0, 4 - reservedReqs.length).map(r => (
              <Link key={r.id} to="/technician/blood-bank"
                className="flex items-center justify-between p-2 rounded border hover:bg-accent transition">
                <div className="text-sm">
                  <span className="font-semibold text-red-600">{fmtBloodType(r.bloodType)}</span>
                  <span className="text-muted-foreground"> · {r.quantity}u · {r.patientName}</span>
                </div>
                <Badge variant="destructive">Pending</Badge>
              </Link>
            ))}
            {reservedReqs.length + pendingReqs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">All blood requests handled — nothing pending.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export const TechnicianProfile: React.FC = () => (
  <DashboardLayout navItems={technicianNavItems} title="Profile"><ProfileForm /></DashboardLayout>
);
