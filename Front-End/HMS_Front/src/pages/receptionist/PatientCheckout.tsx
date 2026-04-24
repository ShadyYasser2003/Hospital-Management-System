import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { LayoutDashboard, UserPlus, Search, Calendar, LogOut, User, CheckCircle, XCircle } from 'lucide-react';
import { usePatients, useUpdatePatient } from '@/hooks/usePatients';
import { PatientDto } from '@/services/patientService';

const navItems = [
  { label: 'Dashboard', path: '/receptionist', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Register Patient', path: '/receptionist/register', icon: <UserPlus className="h-5 w-5" /> },
  { label: 'Search Patient', path: '/receptionist/search', icon: <Search className="h-5 w-5" /> },
  { label: 'Appointments', path: '/receptionist/appointments', icon: <Calendar className="h-5 w-5" /> },
  { label: 'Check Out', path: '/receptionist/checkout', icon: <LogOut className="h-5 w-5" /> },
  { label: 'Profile', path: '/receptionist/profile', icon: <User className="h-5 w-5" /> },
];

const PatientCheckout = () => {
  const { data: patients = [], isLoading } = usePatients();
  const updatePatient = useUpdatePatient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientDto | null>(null);

  const admittedPatients = patients.filter(
    (p) => p.status?.toUpperCase() === 'ADMITTED',
  );

  const handleSearch = () => {
    const found = admittedPatients.find(
      (p) =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nationalId?.includes(searchQuery),
    );
    if (found) {
      setSelectedPatient(found);
    } else {
      toast.error('Patient not found or not admitted');
    }
  };

  const handleCheckout = async () => {
    if (!selectedPatient) return;
    try {
      await updatePatient.mutateAsync({
        id: selectedPatient.id,
        payload: {
          name: selectedPatient.name,
          email: selectedPatient.email,
          phone: selectedPatient.phone,
          status: 'DISCHARGED',
        } as never,
      });
      toast.success(`${selectedPatient.name} has been checked out successfully`);
      setSelectedPatient(null);
      setSearchQuery('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to checkout patient');
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Patient Checkout">
      <PageHeader title="Patient Checkout" description="Discharge admitted patients" />

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader><CardTitle>Search Admitted Patient</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter patient name or National ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch}><Search className="h-4 w-4 mr-2" />Search</Button>
            </div>

            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Currently Admitted Patients:</p>
              {isLoading ? (
                <Skeleton className="h-8 w-full" />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {admittedPatients.map((p) => (
                    <Button
                      key={p.id}
                      variant={selectedPatient?.id === p.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPatient(p)}
                    >
                      {p.name}
                    </Button>
                  ))}
                  {admittedPatients.length === 0 && (
                    <p className="text-sm text-muted-foreground">No admitted patients</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedPatient && (
          <Card>
            <CardHeader><CardTitle>Checkout: {selectedPatient.name}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">National ID</p>
                  <p className="font-medium">{selectedPatient.nationalId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <StatusBadge status={selectedPatient.status?.toLowerCase() as never} />
                </div>
                <div>
                  <p className="text-muted-foreground">Blood Type</p>
                  <p className="font-medium">{selectedPatient.bloodType || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedPatient.phone}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-700 dark:text-green-400">Ready for discharge</span>
                </div>
                <Button
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={updatePatient.isPending}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {updatePatient.isPending ? 'Processing...' : 'Complete Checkout'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientCheckout;
