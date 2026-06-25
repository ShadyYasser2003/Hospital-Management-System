import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import departmentService, { CreateDepartmentPayload } from '@/services/departmentService';

export const DEPARTMENTS_KEY = 'departments';

export const useDepartments = () =>
  useQuery({
    queryKey: [DEPARTMENTS_KEY],
    queryFn: departmentService.getAll,
  });

export const useCreateDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDepartmentPayload) => departmentService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [DEPARTMENTS_KEY] }),
  });
};

export const useUpdateDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Partial<CreateDepartmentPayload> }) =>
      departmentService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [DEPARTMENTS_KEY] }),
  });
};

export const useDeleteDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => departmentService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [DEPARTMENTS_KEY] }),
  });
};
