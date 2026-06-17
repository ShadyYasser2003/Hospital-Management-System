import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import technicianService, { CreateTechnicianPayload } from '@/services/technicianService';

export const TECHNICIANS_KEY = 'technicians';

export const useTechnicians = () =>
  useQuery({
    queryKey: [TECHNICIANS_KEY],
    queryFn: technicianService.getAll,
  });

export const useCreateTechnician = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTechnicianPayload) => technicianService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TECHNICIANS_KEY] }),
  });
};

export const useUpdateTechnician = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Partial<CreateTechnicianPayload> }) =>
      technicianService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TECHNICIANS_KEY] }),
  });
};

export const useDeleteTechnician = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => technicianService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TECHNICIANS_KEY] }),
  });
};
