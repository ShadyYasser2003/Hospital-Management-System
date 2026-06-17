import api from '@/lib/api';

export interface MedicineDto {
  id: number;
  name: string;
  genericName?: string;
  status: string;
  prescriptionRequired?: boolean;
  description?: string;
  sideEffects?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicineStockDto {
  id: number;
  manufacturer?: string;
  reOrderLevel?: number;
  sellingPrice?: number;
  unitPurchase?: number;
  medicineForm?: string;
  expiryDate?: string;
  storageLocation?: string;
  dosage?: string;
  packageSize?: string;
  purchaseQuantity?: number;
  currentQuantity?: number;
  medicineId: number;
}

export interface MedicineCategoryDto {
  id: number;
  name: string;
  description?: string;
}

export interface CreateMedicinePayload {
  name: string;
  genericName?: string;
  prescriptionRequired?: boolean;
  description?: string;
  sideEffects?: string;
}

const medicineService = {
  async getAll(): Promise<MedicineDto[]> {
    const { data } = await api.get<MedicineDto[]>('/api/medicine');
    return data;
  },

  async getById(id: number | string): Promise<MedicineDto> {
    const { data } = await api.get<MedicineDto>(`/api/medicine/${id}`);
    return data;
  },

  async search(keyword: string): Promise<MedicineDto[]> {
    const { data } = await api.get<MedicineDto[]>('/api/medicine/search', { params: { keyword } });
    return Array.isArray(data) ? data : data ? [data as unknown as MedicineDto] : [];
  },

  async create(payload: CreateMedicinePayload): Promise<MedicineDto> {
    const { data } = await api.post<MedicineDto>('/api/medicine', payload);
    return data;
  },

  async update(id: number | string, payload: Partial<CreateMedicinePayload>): Promise<MedicineDto> {
    const { data } = await api.put<MedicineDto>(`/api/medicine/${id}`, payload);
    return data;
  },

  async updateStatus(id: number | string, status: string): Promise<MedicineDto> {
    const { data } = await api.put<MedicineDto>(`/api/medicine/${id}/status`, { status });
    return data;
  },

  async updateCategories(id: number | string, categoryIds: number[]): Promise<MedicineDto> {
    const { data } = await api.patch<MedicineDto>(`/api/medicine/${id}/categories`, { categoryIds });
    return data;
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(`/api/medicine/${id}`);
  },

  // ── Stock ──────────────────────────────────────────────────────────────────
  async getAllStock(): Promise<MedicineStockDto[]> {
    const { data } = await api.get<MedicineStockDto[]>('/api/medicine-stock');
    return data;
  },

  async getStockById(id: number | string): Promise<MedicineStockDto> {
    const { data } = await api.get<MedicineStockDto>(`/api/medicine-stock/${id}`);
    return data;
  },

  async createStock(payload: Partial<MedicineStockDto>): Promise<MedicineStockDto> {
    const { data } = await api.post<MedicineStockDto>('/api/medicine-stock', payload);
    return data;
  },

  async updateStock(id: number | string, payload: Partial<MedicineStockDto>): Promise<MedicineStockDto> {
    // Backend expects PUT /{id}/update?operation=ADD&quantity=N or operation=REMOVE
    // For general updates, we use ADD with the new quantity delta
    // If currentQuantity is provided, use it as the operation target
    const { data } = await api.put<MedicineStockDto>(`/api/medicine-stock/${id}`, payload);
    return data;
  },

  async deleteStock(id: number | string): Promise<void> {
    await api.delete(`/api/medicine-stock/${id}`);
  },

  async getLowStock(): Promise<MedicineStockDto[]> {
    const { data } = await api.get<MedicineStockDto[]>('/api/medicine-stock/low-stock');
    return data;
  },

  // ── Categories ─────────────────────────────────────────────────────────────
  async getAllCategories(): Promise<MedicineCategoryDto[]> {
    const { data } = await api.get<MedicineCategoryDto[]>('/api/medicine-categories');
    return data;
  },

  async createCategory(payload: { name: string; description?: string }): Promise<MedicineCategoryDto> {
    const { data } = await api.post<MedicineCategoryDto>('/api/medicine-categories', payload);
    return data;
  },

  async deleteCategory(id: number | string): Promise<void> {
    await api.delete(`/api/medicine-categories/${id}`);
  },

  async getExpiringSoon(days = 30): Promise<MedicineStockDto[]> {
    const { data } = await api.get<MedicineStockDto[]>('/api/medicine-stock/expiring-soon', {
      params: { days },
    });
    return data;
  },

  async getStockByMedicine(medicineId: number | string): Promise<MedicineStockDto[]> {
    const { data } = await api.get<MedicineStockDto[]>(
      `/api/medicine-stock/medicine-stock/${medicineId}`,
    );
    return data;
  },

  async updateStockQuantity(
    id: number | string,
    operation: 'add' | 'sub',
    quantity: number,
  ): Promise<MedicineStockDto> {
    const { data } = await api.put<MedicineStockDto>(
      `/api/medicine-stock/${id}/update`,
      null,
      { params: { operation, quantity } },
    );
    return data;
  },
};

export default medicineService;
