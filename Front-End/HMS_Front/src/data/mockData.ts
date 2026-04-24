import { User, Patient, Appointment, Prescription, Medicine, Department, Invoice, TestRequest, Bed, Ward, Notification, MedicalReport, AdmissionRequest } from '@/types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    nationalId: '1234567890',
    name: 'Dr. Ahmed Hassan',
    email: 'admin@hospital.com',
    phone: '+1234567890',
    role: 'admin',
    department: 'Administration',
    status: 'active',
    createdAt: '2024-01-01',
  },
  // ── Cardiology (3 doctors) ──────────────────────────────
  { id: '2',  username: 'doctor1',  nationalId: '2345678901', name: 'Dr. Sarah Johnson',  email: 'sarah.johnson@hospital.com',   phone: '+1234567891', role: 'doctor', department: 'Cardiology',   specialty: 'Cardiologist',          status: 'active', createdAt: '2024-01-05' },
  { id: '14', username: 'doctor7',  nationalId: '9123456785', name: 'Dr. Omar Khalil',    email: 'omar.khalil@hospital.com',     phone: '+1234567915', role: 'doctor', department: 'Cardiology',   specialty: 'Interventional Cardiologist', status: 'active', createdAt: '2024-01-11' },
  { id: '15', username: 'doctor8',  nationalId: '9123456786', name: 'Dr. Nora Saleh',     email: 'nora.saleh@hospital.com',      phone: '+1234567916', role: 'doctor', department: 'Cardiology',   specialty: 'Cardiac Electrophysiologist', status: 'active', createdAt: '2024-01-12' },
  // ── Emergency (3 doctors) ───────────────────────────────
  { id: '9',  username: 'doctor2',  nationalId: '9123456780', name: 'Dr. James Wilson',   email: 'james.wilson@hospital.com',    phone: '+1234567910', role: 'doctor', department: 'Emergency',    specialty: 'Emergency Medicine',    status: 'active', createdAt: '2024-01-06' },
  { id: '16', username: 'doctor9',  nationalId: '9123456787', name: 'Dr. Layla Ahmed',    email: 'layla.ahmed@hospital.com',     phone: '+1234567917', role: 'doctor', department: 'Emergency',    specialty: 'Trauma Surgeon',        status: 'active', createdAt: '2024-01-13' },
  { id: '17', username: 'doctor10', nationalId: '9123456788', name: 'Dr. Carlos Rivera',  email: 'carlos.rivera@hospital.com',   phone: '+1234567918', role: 'doctor', department: 'Emergency',    specialty: 'Critical Care',         status: 'active', createdAt: '2024-01-14' },
  // ── Pediatrics (3 doctors) ──────────────────────────────
  { id: '10', username: 'doctor3',  nationalId: '9123456781', name: 'Dr. Maria Garcia',   email: 'maria.garcia@hospital.com',    phone: '+1234567911', role: 'doctor', department: 'Pediatrics',   specialty: 'Pediatrician',          status: 'active', createdAt: '2024-01-07' },
  { id: '18', username: 'doctor11', nationalId: '9123456789', name: 'Dr. Fatima Hassan',  email: 'fatima.hassan@hospital.com',   phone: '+1234567919', role: 'doctor', department: 'Pediatrics',   specialty: 'Neonatologist',         status: 'active', createdAt: '2024-01-15' },
  { id: '19', username: 'doctor12', nationalId: '9123456790', name: 'Dr. Adam Brooks',    email: 'adam.brooks@hospital.com',     phone: '+1234567920', role: 'doctor', department: 'Pediatrics',   specialty: 'Pediatric Surgeon',     status: 'active', createdAt: '2024-01-16' },
  // ── Orthopedics (3 doctors) ─────────────────────────────
  { id: '11', username: 'doctor4',  nationalId: '9123456782', name: 'Dr. Michael Brown',  email: 'michael.brown@hospital.com',   phone: '+1234567912', role: 'doctor', department: 'Orthopedics', specialty: 'Orthopedic Surgeon',    status: 'active', createdAt: '2024-01-08' },
  { id: '20', username: 'doctor13', nationalId: '9123456791', name: 'Dr. Hana Mahmoud',   email: 'hana.mahmoud@hospital.com',    phone: '+1234567921', role: 'doctor', department: 'Orthopedics', specialty: 'Spine Specialist',      status: 'active', createdAt: '2024-01-17' },
  { id: '21', username: 'doctor14', nationalId: '9123456792', name: 'Dr. Yusuf Osman',    email: 'yusuf.osman@hospital.com',     phone: '+1234567922', role: 'doctor', department: 'Orthopedics', specialty: 'Sports Medicine',       status: 'active', createdAt: '2024-01-18' },
  // ── Neurology (3 doctors) ───────────────────────────────
  { id: '12', username: 'doctor5',  nationalId: '9123456783', name: 'Dr. Elizabeth Lee',  email: 'elizabeth.lee@hospital.com',   phone: '+1234567913', role: 'doctor', department: 'Neurology',    specialty: 'Neurologist',           status: 'active', createdAt: '2024-01-09' },
  { id: '22', username: 'doctor15', nationalId: '9123456793', name: 'Dr. Rania Ibrahim',  email: 'rania.ibrahim@hospital.com',   phone: '+1234567923', role: 'doctor', department: 'Neurology',    specialty: 'Neurosurgeon',          status: 'active', createdAt: '2024-01-19' },
  { id: '23', username: 'doctor16', nationalId: '9123456794', name: 'Dr. Samuel Adeyemi', email: 'samuel.adeyemi@hospital.com',  phone: '+1234567924', role: 'doctor', department: 'Neurology',    specialty: 'Epilepsy Specialist',   status: 'active', createdAt: '2024-01-20' },
  // ── Radiology (3 doctors) ───────────────────────────────
  { id: '13', username: 'doctor6',  nationalId: '9123456784', name: 'Dr. Robert Kim',     email: 'robert.kim@hospital.com',      phone: '+1234567914', role: 'doctor', department: 'Radiology',    specialty: 'Radiologist',           status: 'active', createdAt: '2024-01-10' },
  { id: '24', username: 'doctor17', nationalId: '9123456795', name: 'Dr. Amira Nassar',   email: 'amira.nassar@hospital.com',    phone: '+1234567925', role: 'doctor', department: 'Radiology',    specialty: 'Interventional Radiologist', status: 'active', createdAt: '2024-01-21' },
  { id: '25', username: 'doctor18', nationalId: '9123456796', name: 'Dr. Kevin Park',     email: 'kevin.park@hospital.com',      phone: '+1234567926', role: 'doctor', department: 'Radiology',    specialty: 'Nuclear Medicine',      status: 'active', createdAt: '2024-01-22' },
  {
    id: '3',
    username: 'nurse1',
    nationalId: '3456789012',
    name: 'Emily Brown',
    email: 'emily.brown@hospital.com',
    phone: '+1234567892',
    role: 'nurse',
    department: 'Emergency',
    status: 'active',
    createdAt: '2024-01-10',
  },
  {
    id: '4',
    username: 'receptionist1',
    nationalId: '4567890123',
    name: 'Michael Wilson',
    email: 'michael.wilson@hospital.com',
    phone: '+1234567893',
    role: 'receptionist',
    department: 'Front Desk',
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: '5',
    username: 'pharmacist1',
    nationalId: '5678901234',
    name: 'Dr. Lisa Chen',
    email: 'lisa.chen@hospital.com',
    phone: '+1234567894',
    role: 'pharmacist',
    department: 'Pharmacy',
    status: 'active',
    createdAt: '2024-01-20',
  },
  {
    id: '6',
    username: 'accountant1',
    nationalId: '6789012345',
    name: 'Robert Taylor',
    email: 'robert.taylor@hospital.com',
    phone: '+1234567895',
    role: 'accountant',
    department: 'Finance',
    status: 'active',
    createdAt: '2024-01-25',
  },
  {
    id: '7',
    username: 'technician1',
    nationalId: '7890123456',
    name: 'David Martinez',
    email: 'david.martinez@hospital.com',
    phone: '+1234567896',
    role: 'technician',
    department: 'Laboratory',
    status: 'active',
    createdAt: '2024-02-01',
  },
  {
    id: '8',
    username: 'patient1',
    nationalId: '8901234567',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1234567897',
    role: 'patient',
    status: 'active',
    createdAt: '2024-02-05',
  },
];

// Mock Patients
export const mockPatients: Patient[] = [
  {
    id: '1',
    userId: '8',
    name: 'John Smith',
    nationalId: '8901234567',
    dateOfBirth: '1985-03-15',
    gender: 'male',
    bloodType: 'A+',
    phone: '+1234567897',
    email: 'john.smith@email.com',
    address: '123 Main St, City, Country',
    emergencyContact: '+1987654321',
    insuranceProvider: 'HealthCare Plus',
    insuranceNumber: 'HC123456',
    allergies: ['Penicillin'],
    medicalHistory: ['Hypertension', 'Diabetes Type 2'],
    status: 'active',
    createdAt: '2024-02-05',
  },
  {
    id: '2',
    userId: '',
    name: 'Jane Doe',
    nationalId: '9012345678',
    dateOfBirth: '1990-07-22',
    gender: 'female',
    bloodType: 'O-',
    phone: '+1234567898',
    email: 'jane.doe@email.com',
    address: '456 Oak Ave, City, Country',
    emergencyContact: '+1876543210',
    allergies: [],
    medicalHistory: ['Asthma'],
    status: 'admitted',
    createdAt: '2024-02-10',
  },
  {
    id: '3',
    userId: '',
    name: 'Alice Johnson',
    nationalId: '0123456789',
    dateOfBirth: '1978-11-30',
    gender: 'female',
    bloodType: 'B+',
    phone: '+1234567899',
    email: 'alice.johnson@email.com',
    address: '789 Pine Rd, City, Country',
    emergencyContact: '+1765432109',
    insuranceProvider: 'MediCare',
    insuranceNumber: 'MC789012',
    allergies: ['Sulfa', 'Ibuprofen'],
    medicalHistory: ['Heart Disease', 'Arthritis'],
    status: 'active',
    createdAt: '2024-02-15',
  },
];

// Mock Appointments
export const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'John Smith',
    doctorId: '2',
    doctorName: 'Dr. Sarah Johnson',
    department: 'Cardiology',
    date: '2024-12-20',
    time: '09:00',
    type: 'consultation',
    status: 'confirmed',
    notes: 'Regular checkup',
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Jane Doe',
    doctorId: '2',
    doctorName: 'Dr. Sarah Johnson',
    department: 'Cardiology',
    date: '2024-12-20',
    time: '10:30',
    type: 'follow-up',
    status: 'pending',
  },
  {
    id: '3',
    patientId: '3',
    patientName: 'Alice Johnson',
    doctorId: '2',
    doctorName: 'Dr. Sarah Johnson',
    department: 'Cardiology',
    date: '2024-12-21',
    time: '14:00',
    type: 'consultation',
    status: 'confirmed',
    notes: 'Referred from GP',
  },
];

// Mock Prescriptions
export const mockPrescriptions: Prescription[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'John Smith',
    doctorId: '2',
    doctorName: 'Dr. Sarah Johnson',
    date: '2024-12-15',
    medications: [
      { id: '1', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days', quantity: 30 },
      { id: '2', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '30 days', quantity: 60 },
    ],
    status: 'pending',
    notes: 'Take with food',
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Jane Doe',
    doctorId: '2',
    doctorName: 'Dr. Sarah Johnson',
    date: '2024-12-14',
    medications: [
      { id: '3', name: 'Albuterol', dosage: '90mcg', frequency: 'As needed', duration: '90 days', quantity: 1 },
    ],
    status: 'dispensed',
  },
];

// Mock Medicines
export const mockMedicines: Medicine[] = [
  { id: '1', name: 'Lisinopril 10mg', category: 'Cardiovascular', manufacturer: 'Pfizer', stock: 500, minStock: 100, price: 15.99, expiryDate: '2025-06-30', status: 'in-stock' },
  { id: '2', name: 'Metformin 500mg', category: 'Diabetes', manufacturer: 'Merck', stock: 350, minStock: 100, price: 12.50, expiryDate: '2025-08-15', status: 'in-stock' },
  { id: '3', name: 'Albuterol 90mcg', category: 'Respiratory', manufacturer: 'GSK', stock: 80, minStock: 50, price: 45.00, expiryDate: '2025-03-20', status: 'low-stock' },
  { id: '4', name: 'Amoxicillin 500mg', category: 'Antibiotics', manufacturer: 'Teva', stock: 200, minStock: 75, price: 8.99, expiryDate: '2024-12-31', status: 'in-stock' },
  { id: '5', name: 'Omeprazole 20mg', category: 'Gastrointestinal', manufacturer: 'AstraZeneca', stock: 25, minStock: 50, price: 22.00, expiryDate: '2025-01-15', status: 'low-stock' },
  { id: '6', name: 'Ibuprofen 400mg', category: 'Pain Relief', manufacturer: 'Advil', stock: 0, minStock: 100, price: 6.50, expiryDate: '2025-09-30', status: 'out-of-stock' },
];

// Mock Departments
export const mockDepartments: Department[] = [
  // ── Clinical / Medical ──
  { id: '1',  name: 'Cardiology',              head: 'Dr. Sarah Johnson',   staffCount: 15, description: 'Heart and cardiovascular care',          status: 'active' },
  { id: '2',  name: 'Emergency',               head: 'Dr. James Wilson',    staffCount: 25, description: '24/7 emergency services',                status: 'active' },
  { id: '3',  name: 'Pediatrics',              head: 'Dr. Maria Garcia',    staffCount: 12, description: 'Child healthcare',                        status: 'active' },
  { id: '4',  name: 'Orthopedics',             head: 'Dr. Michael Brown',   staffCount: 10, description: 'Bone and joint care',                    status: 'active' },
  { id: '5',  name: 'Neurology',               head: 'Dr. Elizabeth Lee',   staffCount: 8,  description: 'Brain and nervous system',               status: 'active' },
  { id: '6',  name: 'Radiology',               head: 'Dr. Robert Kim',      staffCount: 6,  description: 'Medical imaging and diagnostics',        status: 'active' },
  { id: '7',  name: 'General Surgery',         head: 'Dr. Ahmed Hassan',    staffCount: 14, description: 'General surgical procedures',            status: 'active' },
  { id: '8',  name: 'Obstetrics & Gynecology', head: 'Dr. Nora Ali',        staffCount: 11, description: 'Women\'s health and maternity care',     status: 'active' },
  { id: '9',  name: 'Oncology',                head: 'Dr. Khaled Omar',     staffCount: 9,  description: 'Cancer diagnosis and treatment',         status: 'active' },
  { id: '10', name: 'Dermatology',             head: 'Dr. Layla Mostafa',   staffCount: 5,  description: 'Skin, hair and nail conditions',         status: 'active' },
  { id: '11', name: 'Ophthalmology',           head: 'Dr. Tarek Salah',     staffCount: 6,  description: 'Eye care and vision health',             status: 'active' },
  { id: '12', name: 'ENT',                     head: 'Dr. Sara Nabil',      staffCount: 5,  description: 'Ear, nose and throat',                   status: 'active' },
  { id: '13', name: 'Urology',                 head: 'Dr. Faisal Rashid',   staffCount: 6,  description: 'Urinary tract and male reproductive',    status: 'active' },
  { id: '14', name: 'Psychiatry',              head: 'Dr. Mona Adel',       staffCount: 7,  description: 'Mental health and behavioral care',      status: 'active' },
  { id: '15', name: 'Anesthesiology',          head: 'Dr. Omar Farouk',     staffCount: 8,  description: 'Anesthesia and pain management',         status: 'active' },
  { id: '16', name: 'ICU',                     head: 'Dr. Hana Samir',      staffCount: 18, description: 'Intensive critical care',                status: 'active' },
  { id: '17', name: 'Nephrology',              head: 'Dr. Youssef Kamal',   staffCount: 6,  description: 'Kidney disease and dialysis',            status: 'active' },
  { id: '18', name: 'Endocrinology',           head: 'Dr. Rania Fouad',     staffCount: 5,  description: 'Hormones and metabolic disorders',       status: 'active' },
  { id: '19', name: 'Rheumatology',            head: 'Dr. Sherif Magdy',    staffCount: 4,  description: 'Joints, muscles and autoimmune',         status: 'active' },
  { id: '20', name: 'Pulmonology',             head: 'Dr. Dina Wahba',      staffCount: 6,  description: 'Lung and respiratory care',              status: 'active' },
  // ── Diagnostic & Support ──
  { id: '21', name: 'Laboratory',              head: 'Dr. Amir Zaki',       staffCount: 12, description: 'Clinical lab and pathology tests',       status: 'active' },
  { id: '22', name: 'Physiotherapy',           head: 'Dr. Nadia Gamal',     staffCount: 8,  description: 'Physical rehabilitation and therapy',    status: 'active' },
  { id: '23', name: 'Nutrition & Dietetics',   head: 'Dr. Iman Saber',      staffCount: 4,  description: 'Dietary counseling and clinical nutrition', status: 'active' },
  { id: '24', name: 'Blood Bank',              head: 'Dr. Walid Nasser',    staffCount: 5,  description: 'Blood collection, storage and transfusion', status: 'active' },
  // ── Pharmacy & Supplies ──
  { id: '25', name: 'Pharmacy',                head: 'Dr. Samira Tawfik',   staffCount: 10, description: 'Medication dispensing and management',   status: 'active' },
  { id: '26', name: 'Central Sterilization',   head: 'Mohamed Atef',        staffCount: 6,  description: 'Sterilization of medical instruments',   status: 'active' },
  // ── Administrative ──
  { id: '27', name: 'Administration',          head: 'Ahmed Fathy',         staffCount: 15, description: 'Hospital administration and management', status: 'active' },
  { id: '28', name: 'Human Resources',         head: 'Ola Ramadan',         staffCount: 8,  description: 'Staff recruitment and personnel',        status: 'active' },
  { id: '29', name: 'Finance & Accounting',    head: 'Karim Sobhy',         staffCount: 7,  description: 'Financial management and billing',       status: 'active' },
  { id: '30', name: 'Information Technology',  head: 'Hassan Badr',         staffCount: 5,  description: 'IT systems and digital infrastructure',  status: 'active' },
  { id: '31', name: 'Medical Records',         head: 'Nevine Hamdi',        staffCount: 6,  description: 'Patient records and documentation',      status: 'active' },
  { id: '32', name: 'Reception & Admissions',  head: 'Mariam Lotfy',        staffCount: 10, description: 'Patient intake and front desk services', status: 'active' },
  // ── Facilities ──
  { id: '33', name: 'Maintenance',             head: 'Samir Zohdy',         staffCount: 12, description: 'Building and equipment maintenance',     status: 'active' },
  { id: '34', name: 'Housekeeping',            head: 'Fawzia Helal',        staffCount: 20, description: 'Cleanliness and sanitation',             status: 'active' },
  { id: '35', name: 'Security',                head: 'Mahmoud Gaber',       staffCount: 15, description: 'Hospital security and safety',           status: 'active' },
  { id: '36', name: 'Catering & Kitchen',      head: 'Essam Hatem',         staffCount: 14, description: 'Patient and staff meal services',        status: 'active' },
  { id: '37', name: 'Laundry',                 head: 'Ibrahim Shaker',      staffCount: 8,  description: 'Linen and uniform management',           status: 'active' },
  { id: '38', name: 'Medical Waste',           head: 'Nagwa Mansour',       staffCount: 5,  description: 'Safe disposal of medical waste',         status: 'active' },
];

// Mock Invoices
export const mockInvoices: Invoice[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'John Smith',
    date: '2024-12-15',
    items: [
      { description: 'Consultation Fee', quantity: 1, unitPrice: 150, total: 150 },
      { description: 'ECG Test', quantity: 1, unitPrice: 75, total: 75 },
      { description: 'Blood Test', quantity: 1, unitPrice: 50, total: 50 },
    ],
    totalAmount: 275,
    paidAmount: 275,
    status: 'paid',
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Jane Doe',
    date: '2024-12-18',
    items: [
      { description: 'Emergency Room', quantity: 1, unitPrice: 500, total: 500 },
      { description: 'X-Ray', quantity: 2, unitPrice: 100, total: 200 },
      { description: 'Medications', quantity: 1, unitPrice: 85, total: 85 },
    ],
    totalAmount: 785,
    paidAmount: 400,
    status: 'partial',
  },
  {
    id: '3',
    patientId: '3',
    patientName: 'Alice Johnson',
    date: '2024-12-19',
    items: [
      { description: 'Follow-up Consultation', quantity: 1, unitPrice: 100, total: 100 },
    ],
    totalAmount: 100,
    paidAmount: 0,
    status: 'pending',
  },
];

// Mock Test Requests
export const mockTestRequests: TestRequest[] = [
  { id: '1', patientId: '1', patientName: 'John Smith', doctorId: '2', doctorName: 'Dr. Sarah Johnson', testType: 'Blood Panel', priority: 'normal', status: 'pending', requestDate: '2024-12-19' },
  { id: '2', patientId: '2', patientName: 'Jane Doe', doctorId: '2', doctorName: 'Dr. Sarah Johnson', testType: 'MRI Scan', priority: 'urgent', status: 'in-progress', requestDate: '2024-12-18' },
  { id: '3', patientId: '3', patientName: 'Alice Johnson', doctorId: '2', doctorName: 'Dr. Sarah Johnson', testType: 'CT Scan', priority: 'normal', status: 'completed', requestDate: '2024-12-15', completedDate: '2024-12-17', results: 'Normal findings' },
];

// Mock Wards
export const mockWards: Ward[] = [
  { id: '1', name: 'General Ward A', type: 'General', totalBeds: 20, availableBeds: 5, nurseInCharge: 'Emily Brown' },
  { id: '2', name: 'ICU', type: 'Intensive Care', totalBeds: 10, availableBeds: 2, nurseInCharge: 'Jennifer Adams' },
  { id: '3', name: 'Pediatric Ward', type: 'Pediatric', totalBeds: 15, availableBeds: 8, nurseInCharge: 'Susan Miller' },
  { id: '4', name: 'Maternity Ward', type: 'Maternity', totalBeds: 12, availableBeds: 4, nurseInCharge: 'Patricia Davis' },
];

// Mock Beds
export const mockBeds: Bed[] = [
  { id: '1', wardId: '1', wardName: 'General Ward A', bedNumber: 'GA-101', status: 'occupied', patientId: '2', patientName: 'Jane Doe' },
  { id: '2', wardId: '1', wardName: 'General Ward A', bedNumber: 'GA-102', status: 'available' },
  { id: '3', wardId: '1', wardName: 'General Ward A', bedNumber: 'GA-103', status: 'maintenance' },
  { id: '4', wardId: '2', wardName: 'ICU', bedNumber: 'ICU-01', status: 'available' },
  { id: '5', wardId: '2', wardName: 'ICU', bedNumber: 'ICU-02', status: 'occupied', patientId: '3', patientName: 'Alice Johnson' },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  { id: '1', userId: '8', title: 'Appointment Reminder', message: 'Your appointment with Dr. Sarah Johnson is tomorrow at 9:00 AM', type: 'info', read: false, createdAt: '2024-12-19T10:00:00' },
  { id: '2', userId: '8', title: 'Prescription Ready', message: 'Your prescription is ready for pickup at the pharmacy', type: 'success', read: false, createdAt: '2024-12-18T15:30:00' },
  { id: '3', userId: '8', title: 'Test Results Available', message: 'Your lab test results are now available', type: 'info', read: true, createdAt: '2024-12-17T09:00:00' },
];

// Mock Medical Reports
export const mockMedicalReports: MedicalReport[] = [
  { id: '1', patientId: '1', patientName: 'John Smith', doctorId: '2', doctorName: 'Dr. Sarah Johnson', type: 'diagnosis', date: '2024-12-15', findings: 'Patient presents with controlled hypertension. Blood pressure readings stable at 130/85.', recommendations: 'Continue current medication. Follow up in 3 months.' },
  { id: '2', patientId: '2', patientName: 'Jane Doe', doctorId: '2', doctorName: 'Dr. Sarah Johnson', type: 'lab', date: '2024-12-14', findings: 'Complete blood count within normal limits. Cholesterol slightly elevated.', recommendations: 'Dietary modifications recommended.' },
];

// Mock Admission Requests
export const mockAdmissionRequests: AdmissionRequest[] = [
  { id: '1', patientId: '1', patientName: 'John Smith', doctorId: '2', doctorName: 'Dr. Sarah Johnson', reason: 'Post-operative monitoring', priority: 'normal', requestDate: '2024-12-19', status: 'pending', wardPreference: 'General Ward A' },
  { id: '2', patientId: '3', patientName: 'Alice Johnson', doctorId: '2', doctorName: 'Dr. Sarah Johnson', reason: 'Cardiac monitoring', priority: 'urgent', requestDate: '2024-12-18', status: 'approved', wardPreference: 'ICU' },
];

// Login credentials mapping
export const loginCredentials: Record<string, { password: string; userId: string }> = {
  'admin': { password: 'admin123', userId: '1' },
  '1234567890': { password: 'admin123', userId: '1' },
  'doctor1': { password: 'doctor123', userId: '2' },
  '2345678901': { password: 'doctor123', userId: '2' },
  'doctor2': { password: 'doctor123', userId: '9' },
  '9123456780': { password: 'doctor123', userId: '9' },
  'doctor3': { password: 'doctor123', userId: '10' },
  '9123456781': { password: 'doctor123', userId: '10' },
  'doctor4': { password: 'doctor123', userId: '11' },
  '9123456782': { password: 'doctor123', userId: '11' },
  'doctor5': { password: 'doctor123', userId: '12' },
  '9123456783': { password: 'doctor123', userId: '12' },
  'doctor6': { password: 'doctor123', userId: '13' },
  '9123456784': { password: 'doctor123', userId: '13' },
  'doctor7':  { password: 'doctor123', userId: '14' },
  '9123456785': { password: 'doctor123', userId: '14' },
  'doctor8':  { password: 'doctor123', userId: '15' },
  '9123456786': { password: 'doctor123', userId: '15' },
  'doctor9':  { password: 'doctor123', userId: '16' },
  '9123456787': { password: 'doctor123', userId: '16' },
  'doctor10': { password: 'doctor123', userId: '17' },
  '9123456788': { password: 'doctor123', userId: '17' },
  'doctor11': { password: 'doctor123', userId: '18' },
  '9123456789': { password: 'doctor123', userId: '18' },
  'doctor12': { password: 'doctor123', userId: '19' },
  '9123456790': { password: 'doctor123', userId: '19' },
  'doctor13': { password: 'doctor123', userId: '20' },
  '9123456791': { password: 'doctor123', userId: '20' },
  'doctor14': { password: 'doctor123', userId: '21' },
  '9123456792': { password: 'doctor123', userId: '21' },
  'doctor15': { password: 'doctor123', userId: '22' },
  '9123456793': { password: 'doctor123', userId: '22' },
  'doctor16': { password: 'doctor123', userId: '23' },
  '9123456794': { password: 'doctor123', userId: '23' },
  'doctor17': { password: 'doctor123', userId: '24' },
  '9123456795': { password: 'doctor123', userId: '24' },
  'doctor18': { password: 'doctor123', userId: '25' },
  '9123456796': { password: 'doctor123', userId: '25' },
  'nurse1': { password: 'nurse123', userId: '3' },
  '3456789012': { password: 'nurse123', userId: '3' },
  'receptionist1': { password: 'reception123', userId: '4' },
  '4567890123': { password: 'reception123', userId: '4' },
  'pharmacist1': { password: 'pharma123', userId: '5' },
  '5678901234': { password: 'pharma123', userId: '5' },
  'accountant1': { password: 'account123', userId: '6' },
  '6789012345': { password: 'account123', userId: '6' },
  'technician1': { password: 'tech123', userId: '7' },
  '7890123456': { password: 'tech123', userId: '7' },
  'patient1': { password: 'patient123', userId: '8' },
  '8901234567': { password: 'patient123', userId: '8' },
};
