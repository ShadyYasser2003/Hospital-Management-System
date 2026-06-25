import api from '@/lib/api';

export interface InvoiceItemDto {
  id?: number;
  description: string;
  itemType: string;
  quantity: number;
  unitPrice: number;
  total: number;
  referenceId?: number;
}

export interface InvoiceDto {
  id: number;
  invoiceNumber: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  notes?: string;
  createdAt: string;
  patientId: number;
  patientName: string;
  accountantId?: number;
  items: InvoiceItemDto[];
}

export interface PaymentDto {
  id?: number;
  amount: number;
  paymentMethod: string;
  notes?: string;
  referenceNumber?: string;
  paidAt?: string;
  invoiceId?: number;
  invoiceNumber?: string;
  patientId?: number;
  patientName?: string;
}

const invoiceService = {
  async getAll(page = 0, size = 20): Promise<{ content: InvoiceDto[]; totalElements: number }> {
    const { data } = await api.get('/api/invoices', { params: { page, size } });
    return {
      content: data.content ?? [],
      totalElements: data.page?.totalElements ?? data.totalElements ?? 0,
    };
  },

  async getById(id: number | string): Promise<InvoiceDto> {
    const { data } = await api.get<InvoiceDto>(`/api/invoices/${id}`);
    return data;
  },

  async getByNumber(invoiceNumber: string): Promise<InvoiceDto> {
    const { data } = await api.get<InvoiceDto>(`/api/invoices/number/${invoiceNumber}`);
    return data;
  },

  async getByPatient(patientId: number | string): Promise<InvoiceDto[]> {
    const { data } = await api.get<InvoiceDto[]>(`/api/invoices/patient/${patientId}`);
    return data;
  },

  async getByStatus(status: string): Promise<InvoiceDto[]> {
    const { data } = await api.get<InvoiceDto[]>(`/api/invoices/status/${status}`);
    return data;
  },

  async create(patientId: number | string, accountantId?: number | string, notes?: string): Promise<InvoiceDto> {
    const { data } = await api.post<InvoiceDto>('/api/invoices', { patientId, accountantId, notes });
    return data;
  },

  async addItem(invoiceId: number | string, item: InvoiceItemDto): Promise<InvoiceDto> {
    const { data } = await api.post<InvoiceDto>(`/api/invoices/${invoiceId}/items`, item);
    return data;
  },

  async removeItem(invoiceId: number | string, itemId: number | string): Promise<InvoiceDto> {
    const { data } = await api.delete<InvoiceDto>(`/api/invoices/${invoiceId}/items/${itemId}`);
    return data;
  },

  async recordPayment(invoiceId: number | string, payment: PaymentDto): Promise<PaymentDto> {
    const { data } = await api.post<PaymentDto>(`/api/invoices/${invoiceId}/payments`, payment);
    return data;
  },

  async getPaymentsByInvoice(invoiceId: number | string): Promise<PaymentDto[]> {
    const { data } = await api.get<PaymentDto[]>(`/api/invoices/${invoiceId}/payments`);
    return data;
  },

  async getPaymentsByPatient(patientId: number | string): Promise<PaymentDto[]> {
    const { data } = await api.get<PaymentDto[]>(`/api/invoices/patient/${patientId}/payments`);
    return data;
  },

  async getAllPayments(): Promise<PaymentDto[]> {
    const { data } = await api.get<PaymentDto[]>('/api/invoices/payments/all');
    return data;
  },

  async cancel(id: number | string): Promise<InvoiceDto> {
    const { data } = await api.put<InvoiceDto>(`/api/invoices/${id}/cancel`);
    return data;
  },

  // ── Online Payment Gateways ───────────────────────────────────────────────

  /**
   * Initiates a PayPal payment for an invoice via the unified invoice payment endpoint.
   * Returns the PayPal approval_url to redirect the browser to.
   */
  async payWithPaypal(invoiceId: number | string, amount: number): Promise<string> {
    const { data } = await api.post<{ redirectUrl: string }>(
      `/api/invoices/${invoiceId}/payments`,
      { amount, paymentMethod: 'PAYPAL' },
    );
    return data.redirectUrl;
  },

  /**
   * Initiates a Kashier payment session via the unified invoice payment endpoint.
   * Returns the Kashier sessionUrl to redirect the browser to.
   */
  async payWithKashier(invoiceId: number | string, amount: number, currency = 'EGP'): Promise<string> {
    const { data } = await api.post<{ redirectUrl: string }>(
      `/api/invoices/${invoiceId}/payments`,
      { amount, paymentMethod: 'KASHIER', notes: currency },
    );
    return data.redirectUrl;
  },
};

export default invoiceService;
