import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import medicineService, { CreateMedicinePayload } from '@/services/medicineService';

export const MEDICINES_KEY = 'medicines';
export const MEDICINE_STOCK_KEY = 'medicine-stock';
export const MEDICINE_CATEGORIES_KEY = 'medicine-categories';

export const useMedicines = () =>
  useQuery({
    queryKey: [MEDICINES_KEY],
    queryFn: medicineService.getAll,
  });

export const useMedicineStock = () =>
  useQuery({
    queryKey: [MEDICINE_STOCK_KEY],
    queryFn: medicineService.getAllStock,
  });

export const useMedicineCategories = () =>
  useQuery({
    queryKey: [MEDICINE_CATEGORIES_KEY],
    queryFn: medicineService.getAllCategories,
  });

export const useCreateMedicine = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMedicinePayload) => medicineService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [MEDICINES_KEY] }),
  });
};

export const useUpdateMedicine = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Partial<CreateMedicinePayload> }) =>
      medicineService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [MEDICINES_KEY] }),
  });
};

export const useDeleteMedicine = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => medicineService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [MEDICINES_KEY] }),
  });
};
