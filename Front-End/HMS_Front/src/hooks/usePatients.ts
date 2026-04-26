import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import patientService, { CreatePatientPayload, UpdatePatientPayload } from '@/services/patientService';

export const PATIENTS_KEY = 'patients';

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
