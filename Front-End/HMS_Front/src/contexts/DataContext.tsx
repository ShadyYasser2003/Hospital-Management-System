import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { 
  Patient, Appointment, Prescription, Medicine, Invoice, 
  TestRequest, Notification, MedicalReport, AdmissionRequest, User,
  MedicationAdministration, MedicineCategory, PharmacyCharge, LabCharge, Payment, MedicalForm,
  Department, Bed, Ward
} from '@/types';

// ── Static fallbacks (used only for types that have no backend endpoint yet) ──
const mockWards: Ward[] = [
  { id: '1', name: 'General Ward A', type: 'General', totalBeds: 20, availableBeds: 5, nurseInCharge: 'Emily Brown' },
  { id: '2', name: 'ICU', type: 'Intensive Care', totalBeds: 10, availableBeds: 2, nurseInCharge: 'Jennifer Adams' },
  { id: '3', name: 'Pediatric Ward', type: 'Pediatric', totalBeds: 15, availableBeds: 8, nurseInCharge: 'Susan Miller' },
  { id: '4', name: 'Maternity Ward', type: 'Maternity', totalBeds: 12, availableBeds: 4, nurseInCharge: 'Patricia Davis' },
];

const initialCategories: MedicineCategory[] = [
  { id: '1', name: 'Cardiovascular', description: 'Heart and blood vessel medications' },
  { id: '2', name: 'Diabetes', description: 'Blood sugar control medications' },
  { id: '3', name: 'Respiratory', description: 'Lung and breathing medications' },
  { id: '4', name: 'Antibiotics', description: 'Infection fighting medications' },
  { id: '5', name: 'Pain Relief', description: 'Pain management medications' },
  { id: '6', name: 'Gastrointestinal', description: 'Digestive system medications' },
];

// Helper: load from localStorage or fall back to default
function loadState<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored) as T;
  } catch {}
  return defaultValue;
}

// Helper: save to localStorage
function saveState<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

interface DataContextType {
  // Patients
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  getPatientById: (id: string) => Patient | undefined;
  getPatientByUserId: (userId: string) => Patient | undefined;

  // Users
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => User;
  updateUser: (id: string, updates: Partial<User>) => void;
  getUsersByRole: (role: string) => User[];

  // Medical Forms
  medicalForms: MedicalForm[];
  addMedicalForm: (form: Omit<MedicalForm, 'id' | 'createdAt'>) => MedicalForm;
  updateMedicalForm: (id: string, updates: Partial<MedicalForm>) => void;
  deleteMedicalForm: (id: string) => void;

  // Appointments
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  getAppointmentsByPatientId: (patientId: string) => Appointment[];
  getAppointmentsByDoctorId: (doctorId: string) => Appointment[];

  // Prescriptions
  prescriptions: Prescription[];
  addPrescription: (prescription: Omit<Prescription, 'id'>) => Prescription;
  updatePrescription: (id: string, updates: Partial<Prescription>) => void;
  getPrescriptionsByPatientId: (patientId: string) => Prescription[];
  getPrescriptionsByDoctorId: (doctorId: string) => Prescription[];

  // Medicines
  medicines: Medicine[];
  updateMedicine: (id: string, updates: Partial<Medicine>) => void;
  addMedicine: (medicine: Omit<Medicine, 'id'>) => void;
  deleteMedicine: (id: string) => void;

  // Medicine Categories
  medicineCategories: MedicineCategory[];
  addMedicineCategory: (category: Omit<MedicineCategory, 'id'>) => void;
  deleteMedicineCategory: (id: string) => void;

  // Invoices
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Invoice;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  getInvoicesByPatientId: (patientId: string) => Invoice[];

  // Payments
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  getPaymentsByPatientId: (patientId: string) => Payment[];

  // Test Requests
  testRequests: TestRequest[];
  addTestRequest: (request: Omit<TestRequest, 'id'>) => TestRequest;
  updateTestRequest: (id: string, updates: Partial<TestRequest>) => void;
  getTestRequestsByDoctorId: (doctorId: string) => TestRequest[];

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: (userId: string, role?: string) => void;
  getNotificationsByUserId: (userId: string) => Notification[];
  getNotificationsByRole: (role: string) => Notification[];

  // Medical Reports
  medicalReports: MedicalReport[];
  addMedicalReport: (report: Omit<MedicalReport, 'id'>) => void;
  getMedicalReportsByPatientId: (patientId: string) => MedicalReport[];

  // Admission Requests
  admissionRequests: AdmissionRequest[];
  addAdmissionRequest: (request: Omit<AdmissionRequest, 'id'>) => void;
  updateAdmissionRequest: (id: string, updates: Partial<AdmissionRequest>) => void;

  // Medication Administrations (for nurses)
  medicationAdministrations: MedicationAdministration[];
  addMedicationAdministration: (admin: Omit<MedicationAdministration, 'id'>) => void;

  // Pharmacy Charges
  pharmacyCharges: PharmacyCharge[];
  addPharmacyCharge: (charge: Omit<PharmacyCharge, 'id'>) => void;
  updatePharmacyCharge: (id: string, updates: Partial<PharmacyCharge>) => void;

  // Lab Charges
  labCharges: LabCharge[];
  addLabCharge: (charge: Omit<LabCharge, 'id'>) => void;
  updateLabCharge: (id: string, updates: Partial<LabCharge>) => void;

  // Departments
  departments: Department[];
  addDepartment: (dept: Omit<Department, 'id'>) => Department;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  // Wards
  wards: Ward[];

  // Beds
  beds: Bed[];
  updateBed: (id: string, updates: Partial<Bed>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function usePersistentState<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(() => loadState(key, defaultValue));
  // Use a ref to track the last serialised value so we only write when data
  // actually changes — not on every render tick from context consumers.
  const lastSaved = useRef<string>('');

  useEffect(() => {
    const serialised = JSON.stringify(state);
    if (serialised !== lastSaved.current) {
      lastSaved.current = serialised;
      saveState(key, state);
    }
  }, [key, state]);

  return [state, setState] as const;
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = usePersistentState<Patient[]>('hms_patients', []);
  const [users, setUsers] = usePersistentState<User[]>('hms_users', []);
  const [appointments, setAppointments] = usePersistentState<Appointment[]>('hms_appointments', []);
  const [prescriptions, setPrescriptions] = usePersistentState<Prescription[]>('hms_prescriptions', []);
  const [medicines, setMedicines] = usePersistentState<Medicine[]>('hms_medicines', []);
  const [medicineCategories, setMedicineCategories] = usePersistentState<MedicineCategory[]>('hms_medicine_categories', initialCategories);
  const [invoices, setInvoices] = usePersistentState<Invoice[]>('hms_invoices', []);
  const [payments, setPayments] = usePersistentState<Payment[]>('hms_payments', []);
  const [testRequests, setTestRequests] = usePersistentState<TestRequest[]>('hms_test_requests', []);
  const [notifications, setNotifications] = usePersistentState<Notification[]>('hms_notifications', []);
  const [medicalReports, setMedicalReports] = usePersistentState<MedicalReport[]>('hms_medical_reports', []);
  const [admissionRequests, setAdmissionRequests] = usePersistentState<AdmissionRequest[]>('hms_admission_requests', []);
  const [medicationAdministrations, setMedicationAdministrations] = usePersistentState<MedicationAdministration[]>('hms_medication_administrations', []);
  const [pharmacyCharges, setPharmacyCharges] = usePersistentState<PharmacyCharge[]>('hms_pharmacy_charges', []);
  const [labCharges, setLabCharges] = usePersistentState<LabCharge[]>('hms_lab_charges', []);
  const [medicalForms, setMedicalForms] = usePersistentState<MedicalForm[]>('hms_medical_forms', []);
  const [departments, setDepartments] = usePersistentState<Department[]>('hms_departments_v2', []);
  const [wards] = usePersistentState<Ward[]>('hms_wards', mockWards);
  const [beds, setBeds] = usePersistentState<Bed[]>('hms_beds', []);

  // Patients
  const addPatient = useCallback((patient: Omit<Patient, 'id' | 'createdAt'>) => {
    const newPatient: Patient = {
      ...patient,
      id: String(Date.now()),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPatients(prev => [...prev, newPatient]);
    return newPatient;
  }, [setPatients]);

  const updatePatient = useCallback((id: string, updates: Partial<Patient>) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, [setPatients]);

  const getPatientById = useCallback((id: string) => patients.find(p => p.id === id), [patients]);
  const getPatientByUserId = useCallback((userId: string) => patients.find(p => p.userId === userId), [patients]);

  // Users
  const addUser = useCallback((user: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...user,
      id: String(Date.now()),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  }, [setUsers]);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  }, [setUsers]);

  const getUsersByRole = useCallback((role: string) => users.filter(u => u.role === role), [users]);

  // Appointments
  const addAppointment = useCallback((appointment: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = { ...appointment, id: String(Date.now()) };
    setAppointments(prev => [...prev, newAppointment]);
  }, [setAppointments]);

  const updateAppointment = useCallback((id: string, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, [setAppointments]);

  const getAppointmentsByPatientId = useCallback((patientId: string) => 
    appointments.filter(a => a.patientId === patientId), [appointments]);
  const getAppointmentsByDoctorId = useCallback((doctorId: string) => 
    appointments.filter(a => a.doctorId === doctorId), [appointments]);

  // Prescriptions
  const addPrescription = useCallback((prescription: Omit<Prescription, 'id'>) => {
    const newPrescription: Prescription = { ...prescription, id: String(Date.now()) };
    setPrescriptions(prev => [...prev, newPrescription]);
    return newPrescription;
  }, [setPrescriptions]);

  const updatePrescription = useCallback((id: string, updates: Partial<Prescription>) => {
    setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, [setPrescriptions]);

  const getPrescriptionsByPatientId = useCallback((patientId: string) => 
    prescriptions.filter(p => p.patientId === patientId), [prescriptions]);
  const getPrescriptionsByDoctorId = useCallback((doctorId: string) => 
    prescriptions.filter(p => p.doctorId === doctorId), [prescriptions]);

  // Medicines
  const updateMedicine = useCallback((id: string, updates: Partial<Medicine>) => {
    setMedicines(prev => prev.map(m => {
      if (m.id === id) {
        const updated = { ...m, ...updates };
        if (updates.stock !== undefined) {
          if (updates.stock <= 0) updated.status = 'out-of-stock';
          else if (updates.stock <= updated.minStock) updated.status = 'low-stock';
          else updated.status = 'in-stock';
        }
        return updated;
      }
      return m;
    }));
  }, [setMedicines]);

  const addMedicine = useCallback((medicine: Omit<Medicine, 'id'>) => {
    const newMedicine: Medicine = { ...medicine, id: String(Date.now()) };
    setMedicines(prev => [...prev, newMedicine]);
  }, [setMedicines]);

  const deleteMedicine = useCallback((id: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  }, [setMedicines]);

  // Medicine Categories
  const addMedicineCategory = useCallback((category: Omit<MedicineCategory, 'id'>) => {
    const newCategory: MedicineCategory = { ...category, id: String(Date.now()) };
    setMedicineCategories(prev => [...prev, newCategory]);
  }, [setMedicineCategories]);

  const deleteMedicineCategory = useCallback((id: string) => {
    setMedicineCategories(prev => prev.filter(c => c.id !== id));
  }, [setMedicineCategories]);

  // Invoices
  const addInvoice = useCallback((invoice: Omit<Invoice, 'id'>) => {
    const newInvoice: Invoice = { ...invoice, id: String(Date.now()) };
    setInvoices(prev => [...prev, newInvoice]);
    return newInvoice;
  }, [setInvoices]);

  const updateInvoice = useCallback((id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  }, [setInvoices]);

  const getInvoicesByPatientId = useCallback((patientId: string) => 
    invoices.filter(i => i.patientId === patientId), [invoices]);

  // Payments
  const addPayment = useCallback((payment: Omit<Payment, 'id'>) => {
    const newPayment: Payment = { ...payment, id: String(Date.now()) };
    setPayments(prev => [...prev, newPayment]);
  }, [setPayments]);

  const getPaymentsByPatientId = useCallback((patientId: string) => 
    payments.filter(p => p.patientId === patientId), [payments]);

  // Test Requests
  const addTestRequest = useCallback((request: Omit<TestRequest, 'id'>) => {
    const newRequest: TestRequest = { ...request, id: String(Date.now()) };
    setTestRequests(prev => [...prev, newRequest]);
    return newRequest;
  }, [setTestRequests]);

  const updateTestRequest = useCallback((id: string, updates: Partial<TestRequest>) => {
    setTestRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, [setTestRequests]);

  const getTestRequestsByDoctorId = useCallback((doctorId: string) => 
    testRequests.filter(r => r.doctorId === doctorId), [testRequests]);

  // Notifications
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [...prev, newNotification]);
  }, [setNotifications]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, [setNotifications]);

  const clearNotifications = useCallback((userId: string, role?: string) => {
    setNotifications(prev => prev.filter(n => {
      const belongsToUser = n.userId === userId;
      const belongsToRole = role ? n.role === role : false;
      return !belongsToUser && !belongsToRole;
    }));
  }, [setNotifications]);

  const getNotificationsByUserId = useCallback((userId: string) => 
    notifications.filter(n => n.userId === userId), [notifications]);

  const getNotificationsByRole = useCallback((role: string) => 
    notifications.filter(n => n.role === role), [notifications]);

  // Medical Reports
  const addMedicalReport = useCallback((report: Omit<MedicalReport, 'id'>) => {
    const newReport: MedicalReport = { ...report, id: String(Date.now()) };
    setMedicalReports(prev => [...prev, newReport]);
  }, [setMedicalReports]);

  const getMedicalReportsByPatientId = useCallback((patientId: string) => 
    medicalReports.filter(r => r.patientId === patientId), [medicalReports]);

  // Admission Requests
  const addAdmissionRequest = useCallback((request: Omit<AdmissionRequest, 'id'>) => {
    const newRequest: AdmissionRequest = { ...request, id: String(Date.now()) };
    setAdmissionRequests(prev => [...prev, newRequest]);
  }, [setAdmissionRequests]);

  const updateAdmissionRequest = useCallback((id: string, updates: Partial<AdmissionRequest>) => {
    setAdmissionRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, [setAdmissionRequests]);

  // Medication Administrations
  const addMedicationAdministration = useCallback((admin: Omit<MedicationAdministration, 'id'>) => {
    const newAdmin: MedicationAdministration = { ...admin, id: String(Date.now()) };
    setMedicationAdministrations(prev => [...prev, newAdmin]);
  }, [setMedicationAdministrations]);

  // Pharmacy Charges
  const addPharmacyCharge = useCallback((charge: Omit<PharmacyCharge, 'id'>) => {
    const newCharge: PharmacyCharge = { ...charge, id: String(Date.now()) };
    setPharmacyCharges(prev => [...prev, newCharge]);
  }, [setPharmacyCharges]);

  const updatePharmacyCharge = useCallback((id: string, updates: Partial<PharmacyCharge>) => {
    setPharmacyCharges(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, [setPharmacyCharges]);

  // Lab Charges
  const addLabCharge = useCallback((charge: Omit<LabCharge, 'id'>) => {
    const newCharge: LabCharge = { ...charge, id: String(Date.now()) };
    setLabCharges(prev => [...prev, newCharge]);
  }, [setLabCharges]);

  const updateLabCharge = useCallback((id: string, updates: Partial<LabCharge>) => {
    setLabCharges(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, [setLabCharges]);

  // Medical Forms
  const addMedicalForm = useCallback((form: Omit<MedicalForm, 'id' | 'createdAt'>) => {
    const newForm: MedicalForm = {
      ...form,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
    };
    setMedicalForms(prev => [...prev, newForm]);
    return newForm;
  }, [setMedicalForms]);

  const updateMedicalForm = useCallback((id: string, updates: Partial<MedicalForm>) => {
    setMedicalForms(prev => prev.map(f => f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f));
  }, [setMedicalForms]);

  const deleteMedicalForm = useCallback((id: string) => {
    setMedicalForms(prev => prev.filter(f => f.id !== id));
  }, [setMedicalForms]);

  // Departments
  const addDepartment = useCallback((dept: Omit<Department, 'id'>) => {
    const newDept: Department = { ...dept, id: String(Date.now()) };
    setDepartments(prev => [...prev, newDept]);
    return newDept;
  }, [setDepartments]);

  const updateDepartment = useCallback((id: string, updates: Partial<Department>) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, [setDepartments]);

  const deleteDepartment = useCallback((id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
  }, [setDepartments]);

  // Beds
  const updateBed = useCallback((id: string, updates: Partial<Bed>) => {
    setBeds(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, [setBeds]);

  return (
    <DataContext.Provider value={{
      patients, addPatient, updatePatient, getPatientById, getPatientByUserId,
      users, addUser, updateUser, getUsersByRole,
      appointments, addAppointment, updateAppointment, getAppointmentsByPatientId, getAppointmentsByDoctorId,
      prescriptions, addPrescription, updatePrescription, getPrescriptionsByPatientId, getPrescriptionsByDoctorId,
      medicines, updateMedicine, addMedicine, deleteMedicine,
      medicineCategories, addMedicineCategory, deleteMedicineCategory,
      invoices, addInvoice, updateInvoice, getInvoicesByPatientId,
      payments, addPayment, getPaymentsByPatientId,
      testRequests, addTestRequest, updateTestRequest, getTestRequestsByDoctorId,
      notifications, addNotification, markNotificationRead, clearNotifications, getNotificationsByUserId, getNotificationsByRole,
      medicalReports, addMedicalReport, getMedicalReportsByPatientId,
      admissionRequests, addAdmissionRequest, updateAdmissionRequest,
      medicationAdministrations, addMedicationAdministration,
      pharmacyCharges, addPharmacyCharge, updatePharmacyCharge,
      labCharges, addLabCharge, updateLabCharge,
      medicalForms, addMedicalForm, updateMedicalForm, deleteMedicalForm,
      departments, addDepartment, updateDepartment, deleteDepartment,
      wards,
      beds, updateBed,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
