import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import patientService, { CreatePatientPayload, UpdatePatientPayload } from '@/services/patientService';
import doctorService from '@/services/doctorService';
import api from '@/lib/api';

export const PATIENTS_KEY = 'patients';

/** Fetch the current authenticated patient's own profile from /api/patients/me */
export const useMyPatientProfile = () =>
  useQuery({
    queryKey: [PATIENTS_KEY, 'me'],
    queryFn: async () => {
      const { data } = await api.get('/api/patients/me');
      return data;
    },
    retry: false,
    staleTime: 60_000,
  });

export const usePatients = () =>
  useQuery({
    queryKey: [PATIENTS_KEY],
    queryFn: patientService.getAll,
  });

export const usePatient = (id: number | string | undefined) =>
  useQuery({
    queryKey: [PATIENTS_KEY, id],
    queryFn: () => patientService.getById(id!),
    enabled: !!id,
  });

export const useDoctorPatients = (doctorId: number | string | undefined) =>
  useQuery({
    queryKey: [PATIENTS_KEY, 'doctor', doctorId],
    queryFn: () => doctorService.getPatients(doctorId!),
    enabled: !!doctorId,
  });

export const useCreatePatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePatientPayload) => patientService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PATIENTS_KEY] }),
  });
};

export const useUpdatePatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: UpdatePatientPayload }) =>
      patientService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PATIENTS_KEY] }),
  });
};

export const useDeletePatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => patientService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PATIENTS_KEY] }),
  });
};
