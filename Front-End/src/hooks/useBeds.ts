import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import bedService, { CreateBedPayload } from '@/services/bedService';

export const BEDS_KEY = 'beds';

export const useBeds = () =>
  useQuery({
    queryKey: [BEDS_KEY],
    queryFn: bedService.getAll,
  });

export const useCreateBed = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBedPayload) => bedService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BEDS_KEY] }),
  });
};

export const useUpdateBed = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Partial<CreateBedPayload & { patientId?: number; status?: string }> }) =>
      bedService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BEDS_KEY] }),
  });
};

export const useDeleteBed = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => bedService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BEDS_KEY] }),
  });
};

export const useAssignBedPatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bedId, patientId }: { bedId: number | string; patientId: number | string }) =>
      bedService.assignPatient(bedId, patientId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BEDS_KEY] }),
  });
};

export const useReleaseBed = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => bedService.releasePatient(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BEDS_KEY] }),
  });
};

export const useSetBedMaintenance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => bedService.setMaintenance(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [BEDS_KEY] }),
  });
};
