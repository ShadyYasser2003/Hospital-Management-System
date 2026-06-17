import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userService, { CreateUserPayload } from '@/services/userService';

export const USERS_KEY = 'users';

export const useUsers = () =>
  useQuery({
    queryKey: [USERS_KEY],
    queryFn: userService.getAll,
  });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Partial<CreateUserPayload> }) =>
      userService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => userService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  });
};
