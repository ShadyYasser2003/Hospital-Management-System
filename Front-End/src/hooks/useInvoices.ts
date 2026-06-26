import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import invoiceService, { InvoiceItemDto, PaymentDto } from '@/services/invoiceService';

export const INVOICES_KEY = 'invoices';

export const useInvoices = (page = 0, size = 20) =>
  useQuery({
    queryKey: [INVOICES_KEY, page],
    queryFn: () => invoiceService.getAll(page, size),
  });

export const useInvoicesByPatient = (patientId: number | string | undefined) =>
  useQuery({
    queryKey: [INVOICES_KEY, 'patient', patientId],
    queryFn: () => invoiceService.getByPatient(patientId!),
    enabled: !!patientId,
    refetchInterval: 30_000,  // auto-refresh every 30s so new items appear
    staleTime: 10_000,
  });

export const useInvoicesByStatus = (status: string) =>
  useQuery({
    queryKey: [INVOICES_KEY, 'status', status],
    queryFn: () => invoiceService.getByStatus(status),
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

export const useCreateInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, accountantId, notes }: { patientId: number | string; accountantId?: number | string; notes?: string }) =>
      invoiceService.create(patientId, accountantId, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  });
};

export const useAddInvoiceItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, item }: { invoiceId: number | string; item: InvoiceItemDto }) =>
      invoiceService.addItem(invoiceId, item),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  });
};

export const useRecordPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, payment }: { invoiceId: number | string; payment: PaymentDto }) =>
      invoiceService.recordPayment(invoiceId, payment),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  });
};

export const usePaymentsByPatient = (patientId: number | string | undefined) =>
  useQuery({
    queryKey: [INVOICES_KEY, 'payments', 'patient', patientId],
    queryFn: () => invoiceService.getPaymentsByPatient(patientId!),
    enabled: !!patientId,
  });

export const useCancelInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => invoiceService.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  });
};

/** Alias — used by accountant billing page */
export const useBilling = (page = 0, size = 100) => useInvoices(page, size);

/** Alias — used by accountant payments page */
export const usePayments = (patientId?: number | string) =>
  useQuery({
    queryKey: [INVOICES_KEY, 'all-payments', patientId],
    queryFn: () => patientId
      ? invoiceService.getPaymentsByPatient(patientId)
      : invoiceService.getAllPayments(),
  });
