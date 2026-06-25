import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import transferService, { CreateTransferPayload } from '@/services/transferService';

export const TRANSFERS_KEY = 'transfers';

const invalidate = (qc: ReturnType<typeof useQueryClient>) =>
  qc.invalidateQueries({ queryKey: [TRANSFERS_KEY] });

export const useTransfers = () =>
  useQuery({ queryKey: [TRANSFERS_KEY], queryFn: transferService.getAll });

export const useTransfersByPatient = (patientId: number | string | undefined) =>
  useQuery({
    queryKey: [TRANSFERS_KEY, 'patient', patientId],
    queryFn: () => transferService.getByPatient(patientId!),
    enabled: !!patientId,
  });

export const useCreateTransfer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: CreateTransferPayload) => transferService.create(p),
    onSuccess: () => invalidate(qc),
  });
};

export const useSendTransfer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => transferService.send(id),
    onSuccess: () => invalidate(qc),
  });
};
