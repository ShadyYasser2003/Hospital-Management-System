import api from '@/lib/api';
import type { DoctorDto } from './doctorService';
import type { NurseDto } from './nurseService';
import type { PharmacistDto } from './pharmacistService';
import type { PatientDto } from './patientService';

export interface UserDto {
  id: number;
  name: string;
  role: string;
  status: string;
}

const adminService = {
  // ── Department assignment ──────────────────────────────────────────────────

  async assignDoctorToDepartment(doctorId: number | string, departmentId: number | string): Promise<DoctorDto> {
    const { data } = await api.put<DoctorDto>(
      `/api/admin/doctor/${doctorId}/assign-department/${departmentId}`,
    );
    return data;
  },

  async assignNurseToDepartment(nurseId: number | string, departmentId: number | string): Promise<NurseDto> {
    const { data } = await api.put<NurseDto>(
      `/api/admin/nurse/${nurseId}/assign-department/${departmentId}`,
    );
    return data;
  },

  async assignPharmacistToDepartment(
    pharmacistId: number | string,
    departmentId: number | string,
  ): Promise<PharmacistDto> {
    const { data } = await api.put<PharmacistDto>(
      `/api/admin/pharmacist/${pharmacistId}/assign-department/${departmentId}`,
    );
    return data;
  },

  async getDepartmentStaff(departmentId: number | string): Promise<UserDto[]> {
    const { data } = await api.get<UserDto[]>(`/api/admin/departments/${departmentId}/staff`);
    return data;
  },

  // ── Patient department management ──────────────────────────────────────────

  async addPatientToDepartment(
    patientId: number | string,
    departmentId: number | string,
  ): Promise<PatientDto> {
    const { data } = await api.put<PatientDto>(
      `/api/admin/patients/${patientId}/add/${departmentId}`,
    );
    return data;
  },

  async transferPatientBetweenDepartments(
    patientId: number | string,
    newDepartmentId: number | string,
    oldDepartmentId: number | string,
  ): Promise<PatientDto> {
    const { data } = await api.put<PatientDto>(
      `/api/admin/patients/${patientId}/transfer/${newDepartmentId}/to/${oldDepartmentId}`,
    );
    return data;
  },

  async assignPatientToDoctor(
    patientId: number | string,
    doctorId: number | string,
  ): Promise<PatientDto> {
    const { data } = await api.put<PatientDto>(
      `/api/admin/patients/${patientId}/assign-doctor/${doctorId}`,
    );
    return data;
  },

  async getPatientsByDepartment(departmentId: number | string): Promise<PatientDto[]> {
    const { data } = await api.get<PatientDto[]>(`/api/admin/department/${departmentId}/patients`);
    return data;
  },

  async getPatientsByStatus(status: string): Promise<PatientDto[]> {
    const { data } = await api.get<PatientDto[]>(`/api/admin/patients/status/${status}`);
    return data;
  },
};

export default adminService;
