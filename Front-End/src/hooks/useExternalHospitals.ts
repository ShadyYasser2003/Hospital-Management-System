import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import externalHospitalService, { CreateHospitalPayload } from '@/services/externalHospitalService';

export const HOSPITALS_KEY = 'externalHospitals';

const invalidate = (qc: ReturnType<typeof useQueryClient>) =>
  qc.invalidateQueries({ queryKey: [HOSPITALS_KEY] });

export const useExternalHospitals = () =>
  useQuery({ queryKey: [HOSPITALS_KEY], queryFn: externalHospitalService.getAll });

export const useCreateHospital = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: CreateHospitalPayload) => externalHospitalService.create(p),
    onSuccess: () => invalidate(qc),
  });
};

export const useUpdateHospital = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Partial<CreateHospitalPayload> }) =>
      externalHospitalService.update(id, payload),
    onSuccess: () => invalidate(qc),
  });
};

export const useDeleteHospital = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => externalHospitalService.delete(id),
    onSuccess: () => invalidate(qc),
  });
};
