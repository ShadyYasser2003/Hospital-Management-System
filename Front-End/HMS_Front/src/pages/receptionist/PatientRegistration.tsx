import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LayoutDashboard, UserPlus, Search, Calendar, LogOut, User } from 'lucide-react';
import { useCreatePatient } from '@/hooks/usePatients';

const navItems = [
  { label: 'Dashboard', path: '/receptionist', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Register Patient', path: '/receptionist/register', icon: <UserPlus className="h-5 w-5" /> },
  { label: 'Search Patient', path: '/receptionist/search', icon: <Search className="h-5 w-5" /> },
  { label: 'Appointments', path: '/receptionist/appointments', icon: <Calendar className="h-5 w-5" /> },
  { label: 'Check Out', path: '/receptionist/checkout', icon: <LogOut className="h-5 w-5" /> },
  { label: 'Profile', path: '/receptionist/profile', icon: <User className="h-5 w-5" /> },
];

const PatientRegistration = () => {
  const navigate = useNavigate();
  const createPatient = useCreatePatient();
  const [noInsurance, setNoInsurance] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '', username: '', nationalId: '', dateOfBirth: '',
    gender: '', bloodType: '', phone: '', email: '', address: '',
    emergencyContact: '', insuranceProvider: '', insuranceNumber: '',
    allergies: '', medicalHistory: '', password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim()) { toast.error('Username is required'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      toast.error('Username can only contain letters, numbers, and underscores'); return;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    if (!formData.gender) { toast.error('Gender is required'); return; }
    if (!formData.bloodType) { toast.error('Blood type is required'); return; }

    try {
      await createPatient.mutateAsync({
        username: formData.username.trim(),
        name: formData.name,
        email: formData.email,
        nationalId: formData.nationalId,
        password: formData.password,
        phone: formData.phone,
        address: formData.address || 'N/A',
        dateOfBirth: formData.dateOfBirth,   // yyyy-MM-dd from date input
        gender: formData.gender.toUpperCase(),
        bloodType: formData.bloodType,
        emergencyContact: formData.emergencyContact || 'N/A',
        insuranceProvider: noInsurance ? undefined : formData.insuranceProvider || undefined,
        insuranceNumber: noInsurance ? undefined : formData.insuranceNumber || undefined,
        allergies: formData.allergies || undefined,
        medicalHistory: formData.medicalHistory || undefined,
      });
      toast.success('Patient registered successfully!');
      navigate('/receptionist/search');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to register patient');
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Patient Registration">
      <PageHeader title="Register New Patient" description="Create a new patient record and account" />

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="grid gap-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Personal Information</CardTitle></CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label>Full Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
              <div><Label>Username *</Label><Input value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="Letters, numbers, underscores only" required /></div>
              <div><Label>National ID *</Label><Input value={formData.nationalId} onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })} required /></div>
              <div><Label>Date of Birth *</Label><Input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} required /></div>
              <div>
                <Label>Gender *</Label>
                <Select onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Blood Type *</Label>
                <Select onValueChange={(v) => setFormData({ ...formData, bloodType: v })}>
                  <SelectTrigger><SelectValue placeholder="Select blood type" /></SelectTrigger>
                  <SelectContent>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Account Password</CardTitle></CardHeader>
            <CardContent>
              <div className="max-w-sm">
                <Label>Password * <span className="text-muted-foreground text-xs">(min. 6 characters)</span></Label>
                <div className="relative mt-1">
                  <Input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Set login password for patient" required className="pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Patient will use their username + this password to log in.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Contact Information</CardTitle></CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label>Phone *</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required /></div>
              <div><Label>Email *</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
              <div className="sm:col-span-2"><Label>Address</Label><Textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} /></div>
              <div><Label>Emergency Contact</Label><Input value={formData.emergencyContact} onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Insurance Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="noInsurance" checked={noInsurance} onCheckedChange={(checked) => setNoInsurance(checked as boolean)} />
                <label htmlFor="noInsurance" className="text-sm">No Insurance</label>
              </div>
              {!noInsurance && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><Label>Insurance Provider</Label><Input value={formData.insuranceProvider} onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })} /></div>
                  <div><Label>Insurance Number</Label><Input value={formData.insuranceNumber} onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })} /></div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Medical Information</CardTitle></CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label>Allergies (comma separated)</Label><Textarea value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} placeholder="e.g., Penicillin, Peanuts" /></div>
              <div><Label>Medical History (comma separated)</Label><Textarea value={formData.medicalHistory} onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })} placeholder="e.g., Diabetes, Hypertension" /></div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" disabled={createPatient.isPending}>
            <UserPlus className="h-4 w-4 mr-2" />
            {createPatient.isPending ? 'Registering...' : 'Register Patient'}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default PatientRegistration;
