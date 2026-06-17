import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import prescriptionService, { CreatePrescriptionPayload } from '@/services/prescriptionService';

export const PRESCRIPTIONS_KEY = 'prescriptions';

export const usePrescriptions = () =>
  useQuery({
    queryKey: [PRESCRIPTIONS_KEY],
    queryFn: prescriptionService.getAll,
  });

export const usePrescriptionsByPatient = (patientId: number | string | undefined) =>
  useQuery({
    queryKey: [PRESCRIPTIONS_KEY, 'patient', patientId],
    queryFn: () => prescriptionService.getByPatient(patientId!),
    enabled: !!patientId,
  });

export const usePrescriptionsByDoctor = (doctorId: number | string | undefined) =>
  useQuery({
    queryKey: [PRESCRIPTIONS_KEY, 'doctor', doctorId],
    queryFn: () => prescriptionService.getByDoctor(doctorId!),
    enabled: !!doctorId,
  });

export const useCreatePrescription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePrescriptionPayload) => prescriptionService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRESCRIPTIONS_KEY] }),
  });
};

export const useUpdatePrescription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Partial<CreatePrescriptionPayload> }) =>
      prescriptionService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRESCRIPTIONS_KEY] }),
  });
};

export const useDispensePrescription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => prescriptionService.dispense(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRESCRIPTIONS_KEY] }),
  });
};

export const useDeletePrescription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => prescriptionService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRESCRIPTIONS_KEY] }),
  });
};
