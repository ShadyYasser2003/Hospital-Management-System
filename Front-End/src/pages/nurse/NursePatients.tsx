import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Search, Eye, Heart, Thermometer, Activity, User, Droplet,
  AlertTriangle, ClipboardList, Stethoscope, Users, AlertCircle,
} from 'lucide-react';
import { nurseNavItems } from '@/constants/nurseNavItems';
import { usePatients } from '@/hooks/usePatients';
import { PatientDto } from '@/services/patientService';

const VitalItem: React.FC<{ icon: React.ReactNode; label: string; value?: string }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border">
    <div className="text-primary">{icon}</div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold text-sm">{value || 'N/A'}</p>
    </div>
  </div>
);

const InfoRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
    <p className="text-sm font-medium">{value || '—'}</p>
  </div>
);

const NursePatients = () => {
  const { data: patients = [], isLoading, error } = usePatients();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientDto | null>(null);

  const admittedPatients = patients.filter((p) => p.status?.toUpperCase() === 'ADMITTED');

  const filteredPatients = admittedPatients.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nationalId?.includes(searchQuery),
  );

  return (
    <DashboardLayout navItems={nurseNavItems} title="Assigned Patients">
      <PageHeader title="Admitted Patients" description="View and monitor patients under your care" />

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or ID…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <p className="text-sm text-muted-foreground shrink-0">{filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} found</p>
      </div>

      {isLoading && <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>}
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error instanceof Error ? error.message : 'Failed to load patients'}</AlertDescription></Alert>}

      {!isLoading && !error && (
        filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No admitted patients found</p>
              <p className="text-sm mt-1">Patients with admitted status will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-md hover:border-primary/40 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base leading-tight">{patient.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">ID: {patient.nationalId}</p>
                      </div>
                    </div>
                    <StatusBadge status={patient.status?.toLowerCase() as never} />
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-muted/40 py-2">
                      <p className="text-muted-foreground">Blood</p>
                      <p className="font-semibold text-primary">{patient.bloodType || '—'}</p>
                    </div>
                    <div className="rounded-lg bg-muted/40 py-2">
                      <p className="text-muted-foreground">Gender</p>
                      <p className="font-semibold capitalize">{patient.gender || '—'}</p>
                    </div>
                    <div className="rounded-lg bg-muted/40 py-2">
                      <p className="text-muted-foreground">BP</p>
                      <p className="font-semibold">{patient.bloodPressure || '—'}</p>
                    </div>
                  </div>
                  {patient.allergies && (
                    <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/5 rounded-lg px-3 py-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">Allergies: {patient.allergies}</span>
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setSelectedPatient(patient)}>
                    <Eye className="h-4 w-4" /> View Full Record
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="h-5 w-5 text-primary" />Patient Medical Record
            </DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <User className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-1">
                  <InfoRow label="Full Name" value={selectedPatient.name} />
                  <InfoRow label="National ID" value={selectedPatient.nationalId} />
                  <InfoRow label="Date of Birth" value={selectedPatient.dateOfBirth} />
                  <InfoRow label="Gender" value={selectedPatient.gender} />
                </div>
                <Badge variant="outline" className="text-primary border-primary/40 shrink-0">{selectedPatient.bloodType}</Badge>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Vital Signs
                </h3>
                {selectedPatient.bloodPressure || selectedPatient.temperature || selectedPatient.pulse ? (
                  <div className="grid grid-cols-3 gap-3">
                    <VitalItem icon={<Heart className="h-4 w-4" />} label="Blood Pressure" value={selectedPatient.bloodPressure} />
                    <VitalItem icon={<Thermometer className="h-4 w-4" />} label="Temperature" value={selectedPatient.temperature} />
                    <VitalItem icon={<Activity className="h-4 w-4" />} label="Pulse Rate" value={selectedPatient.pulse} />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No vitals recorded yet</p>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" /> Allergies
                </h3>
                {selectedPatient.allergies
                  ? <p className="text-sm text-destructive">{selectedPatient.allergies}</p>
                  : <p className="text-sm text-muted-foreground italic">No known allergies</p>}
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" /> Medical History
                </h3>
                {selectedPatient.medicalHistory
                  ? <p className="text-sm">{selectedPatient.medicalHistory}</p>
                  : <p className="text-sm text-muted-foreground italic">No medical history recorded</p>}
              </div>

              {(selectedPatient.diagnosis || selectedPatient.notes) && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-primary" /> Current Diagnosis & Notes
                    </h3>
                    <div className="space-y-3">
                      {selectedPatient.diagnosis && (
                        <div className="p-3 rounded-lg bg-muted/40 border border-border">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Diagnosis</p>
                          <p className="text-sm">{selectedPatient.diagnosis}</p>
                        </div>
                      )}
                      {selectedPatient.notes && (
                        <div className="p-3 rounded-lg bg-muted/40 border border-border">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                          <p className="text-sm">{selectedPatient.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default NursePatients;
