import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import AIChatbot from "@/components/shared/AIChatbot";

// Public pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDepartments from "./pages/admin/AdminDepartments";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminBeds from "./pages/admin/AdminBeds";
import AdminMedicines from "./pages/admin/AdminMedicines";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminDiagnosis from "./pages/admin/AdminDiagnosis";
import AdminSpecialties from "./pages/admin/AdminSpecialties";
import AdminOperations from "./pages/admin/AdminOperations";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

// Receptionist pages
import { ReceptionistDashboard, ReceptionistProfile } from "./pages/receptionist/ReceptionistDashboard";
import PatientRegistration from "./pages/receptionist/PatientRegistration";
import PatientSearch from "./pages/receptionist/PatientSearch";
import ReceptionistAppointments from "./pages/receptionist/ReceptionistAppointments";
import PatientCheckout from "./pages/receptionist/PatientCheckout";

// Patient pages
import { PatientDashboard, PatientProfile } from "./pages/patient/PatientDashboard";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientPrescriptions from "./pages/patient/PatientPrescriptions";
import PatientHistory from "./pages/patient/PatientHistory";
import PatientNotifications from "./pages/patient/PatientNotifications";
import PatientBilling from "./pages/patient/PatientBilling";

// Doctor pages
import { DoctorDashboard, DoctorProfile } from "./pages/doctor/DoctorDashboard";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorPrescriptions from "./pages/doctor/DoctorPrescriptions";
import DoctorTests from "./pages/doctor/DoctorTests";
import DoctorAdmissions from "./pages/doctor/DoctorAdmissions";
import DoctorReports from "./pages/doctor/DoctorReports";
import DoctorNotifications from "./pages/doctor/DoctorNotifications";
// Other role dashboards
import { NurseDashboard, NurseProfile } from "./pages/nurse/NurseDashboard";
import NursePatients from "./pages/nurse/NursePatients";
import NurseMedications from "./pages/nurse/NurseMedications";
import { PharmacistDashboard, PharmacistProfile } from "./pages/pharmacist/PharmacistDashboard";
import PharmacistInventory from "./pages/pharmacist/PharmacistInventory";
import PharmacistPrescriptions from "./pages/pharmacist/PharmacistPrescriptions";
import PharmacistDispense from "./pages/pharmacist/PharmacistDispense";
import { AccountantDashboard, AccountantProfile } from "./pages/accountant/AccountantDashboard";
import AccountantInvoices from "./pages/accountant/AccountantInvoices";
import AccountantPayments from "./pages/accountant/AccountantPayments";
import AccountantNotifications from "./pages/accountant/AccountantNotifications";
import { TechnicianDashboard, TechnicianProfile } from "./pages/technician/TechnicianDashboard";
import TechnicianRequests from "./pages/technician/TechnicianRequests";
import TechnicianUpload from "./pages/technician/TechnicianUpload";
import TechnicianNotifications from "./pages/technician/TechnicianNotifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={['admin']}><AdminDepartments /></ProtectedRoute>} />
              <Route path="/admin/specialties" element={<ProtectedRoute allowedRoles={['admin']}><AdminSpecialties /></ProtectedRoute>} />
              <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={['admin']}><AdminAppointments /></ProtectedRoute>} />
              <Route path="/admin/transactions" element={<ProtectedRoute allowedRoles={['admin']}><AdminTransactions /></ProtectedRoute>} />
              <Route path="/admin/beds" element={<ProtectedRoute allowedRoles={['admin']}><AdminBeds /></ProtectedRoute>} />
              <Route path="/admin/medicines" element={<ProtectedRoute allowedRoles={['admin']}><AdminMedicines /></ProtectedRoute>} />
              <Route path="/admin/operations" element={<ProtectedRoute allowedRoles={['admin']}><AdminOperations /></ProtectedRoute>} />
              <Route path="/admin/diagnosis" element={<ProtectedRoute allowedRoles={['admin']}><AdminDiagnosis /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
              <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['admin']}><AdminProfile /></ProtectedRoute>} />

              {/* Receptionist Routes */}
              <Route path="/receptionist" element={<ProtectedRoute allowedRoles={['receptionist']}><ReceptionistDashboard /></ProtectedRoute>} />
              <Route path="/receptionist/register" element={<ProtectedRoute allowedRoles={['receptionist']}><PatientRegistration /></ProtectedRoute>} />
              <Route path="/receptionist/search" element={<ProtectedRoute allowedRoles={['receptionist']}><PatientSearch /></ProtectedRoute>} />
              <Route path="/receptionist/appointments" element={<ProtectedRoute allowedRoles={['receptionist']}><ReceptionistAppointments /></ProtectedRoute>} />
              <Route path="/receptionist/checkout" element={<ProtectedRoute allowedRoles={['receptionist']}><PatientCheckout /></ProtectedRoute>} />
              <Route path="/receptionist/profile" element={<ProtectedRoute allowedRoles={['receptionist']}><ReceptionistProfile /></ProtectedRoute>} />

              {/* Patient Routes */}
              <Route path="/patient" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
              <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={['patient']}><PatientAppointments /></ProtectedRoute>} />
              <Route path="/patient/prescriptions" element={<ProtectedRoute allowedRoles={['patient']}><PatientPrescriptions /></ProtectedRoute>} />
              <Route path="/patient/history" element={<ProtectedRoute allowedRoles={['patient']}><PatientHistory /></ProtectedRoute>} />
              <Route path="/patient/notifications" element={<ProtectedRoute allowedRoles={['patient']}><PatientNotifications /></ProtectedRoute>} />
              <Route path="/patient/billing" element={<ProtectedRoute allowedRoles={['patient']}><PatientBilling /></ProtectedRoute>} />
              <Route path="/patient/profile" element={<ProtectedRoute allowedRoles={['patient']}><PatientProfile /></ProtectedRoute>} />

              {/* Doctor Routes */}
              <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
              <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorPatients /></ProtectedRoute>} />
              <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
              <Route path="/doctor/prescriptions" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorPrescriptions /></ProtectedRoute>} />
              <Route path="/doctor/tests" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorTests /></ProtectedRoute>} />
              <Route path="/doctor/admissions" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAdmissions /></ProtectedRoute>} />
              <Route path="/doctor/reports" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorReports /></ProtectedRoute>} />
              <Route path="/doctor/notifications" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorNotifications /></ProtectedRoute>} />
              <Route path="/doctor/profile" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorProfile /></ProtectedRoute>} />

              {/* Nurse Routes */}
              <Route path="/nurse" element={<ProtectedRoute allowedRoles={['nurse']}><NurseDashboard /></ProtectedRoute>} />
              <Route path="/nurse/patients" element={<ProtectedRoute allowedRoles={['nurse']}><NursePatients /></ProtectedRoute>} />
              <Route path="/nurse/medications" element={<ProtectedRoute allowedRoles={['nurse']}><NurseMedications /></ProtectedRoute>} />
              <Route path="/nurse/profile" element={<ProtectedRoute allowedRoles={['nurse']}><NurseProfile /></ProtectedRoute>} />

              {/* Pharmacist Routes */}
              <Route path="/pharmacist" element={<ProtectedRoute allowedRoles={['pharmacist']}><PharmacistDashboard /></ProtectedRoute>} />
              <Route path="/pharmacist/inventory" element={<ProtectedRoute allowedRoles={['pharmacist']}><PharmacistInventory /></ProtectedRoute>} />
              <Route path="/pharmacist/prescriptions" element={<ProtectedRoute allowedRoles={['pharmacist']}><PharmacistPrescriptions /></ProtectedRoute>} />
              <Route path="/pharmacist/dispense" element={<ProtectedRoute allowedRoles={['pharmacist']}><PharmacistDispense /></ProtectedRoute>} />
              <Route path="/pharmacist/profile" element={<ProtectedRoute allowedRoles={['pharmacist']}><PharmacistProfile /></ProtectedRoute>} />

              {/* Accountant Routes */}
              <Route path="/accountant" element={<ProtectedRoute allowedRoles={['accountant']}><AccountantDashboard /></ProtectedRoute>} />
              <Route path="/accountant/invoices" element={<ProtectedRoute allowedRoles={['accountant']}><AccountantInvoices /></ProtectedRoute>} />
              <Route path="/accountant/payments" element={<ProtectedRoute allowedRoles={['accountant']}><AccountantPayments /></ProtectedRoute>} />
              <Route path="/accountant/notifications" element={<ProtectedRoute allowedRoles={['accountant']}><AccountantNotifications /></ProtectedRoute>} />
              <Route path="/accountant/profile" element={<ProtectedRoute allowedRoles={['accountant']}><AccountantProfile /></ProtectedRoute>} />

              {/* Technician Routes */}
              <Route path="/technician" element={<ProtectedRoute allowedRoles={['technician']}><TechnicianDashboard /></ProtectedRoute>} />
              <Route path="/technician/requests" element={<ProtectedRoute allowedRoles={['technician']}><TechnicianRequests /></ProtectedRoute>} />
              <Route path="/technician/upload" element={<ProtectedRoute allowedRoles={['technician']}><TechnicianUpload /></ProtectedRoute>} />
              <Route path="/technician/notifications" element={<ProtectedRoute allowedRoles={['technician']}><TechnicianNotifications /></ProtectedRoute>} />
              <Route path="/technician/profile" element={<ProtectedRoute allowedRoles={['technician']}><TechnicianProfile /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <AIChatbot />
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

