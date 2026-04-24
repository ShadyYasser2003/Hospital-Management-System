export type UserRole = 
  | 'admin' 
  | 'doctor' 
  | 'nurse' 
  | 'receptionist' 
  | 'pharmacist' 
  | 'accountant' 
  | 'technician' 
  | 'patient';

export interface User {
  id: string;
  username: string;
  nationalId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department?: string;
  specialty?: string;
  avatar?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Patient {
  id: string;
  userId: string;
  name: string;
  nationalId: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  bloodType: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  allergies: string[];
  medicalHistory: string[];
  status: 'active' | 'admitted' | 'discharged';
  createdAt: string;
  // Medical profile fields
  vitals?: {
    bloodPressure?: string;
    temperature?: string;
    pulse?: string;
    weight?: string;
    height?: string;
    lastUpdated?: string;
  };
  diagnosis?: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  type: 'consultation' | 'follow-up' | 'emergency';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  medications: Medication[];
  status: 'pending' | 'dispensed' | 'cancelled';
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  stock: number;
  minStock: number;
  price: number;
  expiryDate: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

export interface Department {
  id: string;
  name: string;
  head: string;
  staffCount: number;
  description: string;
  status: 'active' | 'inactive';
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  items: InvoiceItem[];
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'partial' | 'paid';
  source?: 'pharmacy' | 'lab' | 'consultation' | 'other';
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  patientId: string;
  patientName: string;
  amount: number;
  method: 'cash' | 'card' | 'insurance' | 'bank_transfer';
  date: string;
  notes?: string;
}

export interface TestRequest {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  testType: string;
  priority: 'normal' | 'urgent';
  status: 'pending' | 'acknowledged' | 'in-progress' | 'completed';
  requestDate: string;
  completedDate?: string;
  results?: string;
  reportUrl?: string;
  charges?: number;
}

export interface Bed {
  id: string;
  wardId: string;
  wardName: string;
  bedNumber: string;
  status: 'available' | 'occupied' | 'maintenance';
  patientId?: string;
  patientName?: string;
}

export interface Ward {
  id: string;
  name: string;
  type: string;
  totalBeds: number;
  availableBeds: number;
  nurseInCharge: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
  role?: UserRole;
}

export interface MedicalReport {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  type: 'diagnosis' | 'lab' | 'imaging' | 'operation';
  date: string;
  findings: string;
  recommendations?: string;
  attachments?: string[];
}

export interface AdmissionRequest {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  reason: string;
  priority: 'normal' | 'urgent' | 'emergency';
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  wardPreference?: string;
  bedId?: string;
  bedNumber?: string;
  rejectionReason?: string;
}

export interface MedicineCategory {
  id: string;
  name: string;
  description?: string;
}

export interface MedicationAdministration {
  id: string;
  patientId: string;
  patientName: string;
  prescriptionId: string;
  medicationName: string;
  dosage: string;
  administeredAt: string;
  administeredBy: string;
  nurseId: string;
  notes?: string;
}

export interface PharmacyCharge {
  id: string;
  prescriptionId: string;
  patientId: string;
  patientName: string;
  items: { name: string; quantity: number; unitPrice: number; total: number }[];
  totalAmount: number;
  status: 'pending' | 'sent' | 'invoiced';
  date: string;
}

export interface LabCharge {
  id: string;
  testRequestId: string;
  patientId: string;
  patientName: string;
  testType: string;
  amount: number;
  status: 'pending' | 'sent' | 'invoiced';
  date: string;
}

export type FormFieldType = 'text' | 'number' | 'textarea' | 'checkbox' | 'radio' | 'select';

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options?: string[]; // For radio and select types
  placeholder?: string;
}

export interface MedicalForm {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
}
