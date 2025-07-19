import axiosInstance from './axiosInstance';

export interface InvoiceItem {
  _id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountRate?: number;
  totalBeforeTax: number;
  totalTax: number;
  total: number;
}

export interface Invoice {
  _id?: string;
  invoiceNumber: string;
  client: string | { _id: string; name: string; email?: string; phone?: string };
  event?: string | { _id: string; title: string; startDate: string };
  issueDate: string | Date;
  dueDate: string | Date;
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  notes?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'partially-paid';
  paymentTerms?: string;
  paymentMethod?: string;
  paymentDate?: string | Date;
  createdBy?: string | { _id: string; name: string };
  updatedBy?: string | { _id: string; name: string };
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface InvoiceFilters {
  client?: string;
  event?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

const invoiceApi = {
  /**
   * Crear una nueva factura
   * @param invoice Datos de la factura a crear
   * @returns La factura creada
   */
  createInvoice: async (invoice: Partial<Invoice>): Promise<Invoice> => {
    const response = await axiosInstance.post('/api/invoices', invoice);
    return response.data.data;
  },

  /**
   * Obtener listado de facturas con filtros opcionales
   * @param filters Filtros opcionales
   * @returns Lista paginada de facturas
   */
  getInvoices: async (filters: InvoiceFilters = {}) => {
    const response = await axiosInstance.get('/api/invoices', { params: filters });
    return response.data;
  },

  /**
   * Obtener una factura por su ID
   * @param id ID de la factura
   * @returns Datos de la factura
   */
  getInvoiceById: async (id: string): Promise<Invoice> => {
    const response = await axiosInstance.get(`/api/invoices/${id}`);
    return response.data.data;
  },

  /**
   * Actualizar una factura existente
   * @param id ID de la factura
   * @param invoice Datos actualizados
   * @returns Factura actualizada
   */
  updateInvoice: async (id: string, invoice: Partial<Invoice>): Promise<Invoice> => {
    const response = await axiosInstance.put(`/api/invoices/${id}`, invoice);
    return response.data.data;
  },

  /**
   * Eliminar una factura
   * @param id ID de la factura
   */
  deleteInvoice: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/invoices/${id}`);
  },

  /**
   * Actualizar el estado de una factura
   * @param id ID de la factura
   * @param status Nuevo estado
   * @returns Factura actualizada
   */
  updateInvoiceStatus: async (id: string, status: Invoice['status']): Promise<Invoice> => {
    const response = await axiosInstance.patch(`/api/invoices/${id}/status`, { status });
    return response.data.data;
  },

  /**
   * Obtener una factura en formato PDF
   * @param id ID de la factura
   * @returns URL del PDF generado
   */
  getInvoicePdf: async (id: string): Promise<string> => {
    const response = await axiosInstance.get(`/api/invoices/${id}/pdf`);
    return response.data.pdfUrl || '';
  }
};

export default invoiceApi;
