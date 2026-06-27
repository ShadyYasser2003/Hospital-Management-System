import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, CheckCircle, BedDouble, UserPlus, LogOut } from 'lucide-react';
import { usePatients, useUpdatePatient } from '@/hooks/usePatients';
import { PatientDto } from '@/services/patientService';
import { receptionistNavItems } from '@/constants/receptionistNavItems';

const PatientCheckout = () => {
  const { data: patients = [], isLoading } = usePatients();
  const updatePatient = useUpdatePatient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientDto | null>(null);

  const admittedPatients = patients.filter(
    (p) => p.status?.toUpperCase() === 'ADMITTED',
  );

  const activePatients = patients.filter(
    (p) => p.status?.toUpperCase() === 'ACTIVE',
  );

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    // Search across all patients (admitted + active)
    const found = patients.find(
      (p) =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nationalId?.includes(searchQuery),
    );
    if (found) {
      setSelectedPatient(found);
    } else {
      toast.error('Patient not found');
    }
  };

  const handleAdmit = async (patient: PatientDto) => {
    try {
      await updatePatient.mutateAsync({
        id: patient.id,
        payload: { status: 'ADMITTED' },
      });
      toast.success(`${patient.name} has been admitted`);
      setSelectedPatient(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to admit patient');
    }
  };

  const handleCheckout = async () => {
    if (!selectedPatient) return;
    try {
      await updatePatient.mutateAsync({
        id: selectedPatient.id,
        payload: { status: 'DISCHARGED' },
      });
      toast.success(`${selectedPatient.name} has been checked out successfully`);
      setSelectedPatient(null);
      setSearchQuery('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to checkout patient');
    }
  };

  const statusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'ADMITTED':   return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'DISCHARGED': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
      default:           return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    }
  };

  return (
    <DashboardLayout navItems={receptionistNavItems} title="Patient Checkout">
      <PageHeader title="Patient Checkout" description="Admit and discharge patients" />

      <div className="max-w-3xl space-y-6">

        {/* Search */}
        <Card>
          <CardHeader><CardTitle>Find Patient</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter patient name or National ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Admitted patients list */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-blue-500" />
              Currently Admitted
              <Badge variant="secondary">{admittedPatients.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : admittedPatients.length === 0 ? (
              <p className="text-sm text-muted-foreground">No admitted patients</p>
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active patients — can be admitted */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-green-500" />
              Active Patients (can be admitted)
              <Badge variant="secondary">{activePatients.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : activePatients.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active patients</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {activePatients.map((p) => (
                  <Button
                    key={p.id}
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPatient(p)}
                  >
                    {p.name}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected patient action card */}
        {selectedPatient && (
          <Card className="border-primary/40">
            <CardHeader>
              <CardTitle>
                {selectedPatient.name}
                <span className={`ml-3 text-xs font-medium px-2 py-1 rounded-full ${statusColor(selectedPatient.status)}`}>
                  {selectedPatient.status?.toUpperCase()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">National ID</p>
                  <p className="font-medium">{selectedPatient.nationalId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedPatient.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Blood Type</p>
                  <p className="font-medium">{selectedPatient.bloodType || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedPatient.email}</p>
                </div>
              </div>

              <div className="border-t pt-4 flex gap-3">
                {/* Admit button — only for ACTIVE patients */}
                {selectedPatient.status?.toUpperCase() === 'ACTIVE' && (
                  <Button
                    variant="outline"
                    className="flex-1 border-blue-400 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                    onClick={() => handleAdmit(selectedPatient)}
                    disabled={updatePatient.isPending}
                  >
                    <BedDouble className="h-4 w-4 mr-2" />
                    {updatePatient.isPending ? 'Processing...' : 'Admit Patient'}
                  </Button>
                )}

                {/* Checkout button — only for ADMITTED patients */}
                {selectedPatient.status?.toUpperCase() === 'ADMITTED' && (
                  <Button
                    className="flex-1"
                    onClick={handleCheckout}
                    disabled={updatePatient.isPending}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {updatePatient.isPending ? 'Processing...' : 'Complete Checkout'}
                  </Button>
                )}

                {selectedPatient.status?.toUpperCase() === 'DISCHARGED' && (
                  <div className="flex-1 flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-muted-foreground">Patient already discharged</span>
                  </div>
                )}

                <Button
                  variant="ghost"
                  onClick={() => setSelectedPatient(null)}
                >
                  Cancel
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
