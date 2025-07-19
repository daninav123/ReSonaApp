import axiosInstance from './axiosInstance';

export interface QuoteItem {
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

export interface Quote {
  _id?: string;
  quoteNumber: string;
  client: string | { _id: string; name: string; email?: string; phone?: string };
  event?: string | { _id: string; title: string; startDate: string };
  issueDate: string | Date;
  validUntil: string | Date;
  items: QuoteItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  notes?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  termsAndConditions?: string;
  convertedToInvoice?: string | { _id: string; invoiceNumber: string; status: string };
  createdBy?: string | { _id: string; name: string };
  updatedBy?: string | { _id: string; name: string };
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface QuoteFilters {
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

const quoteApi = {
  /**
   * Crear un nuevo presupuesto
   * @param quote Datos del presupuesto a crear
   * @returns El presupuesto creado
   */
  createQuote: async (quote: Partial<Quote>): Promise<Quote> => {
    const response = await axiosInstance.post('/api/quotes', quote);
    return response.data.data;
  },

  /**
   * Obtener listado de presupuestos con filtros opcionales
   * @param filters Filtros opcionales
   * @returns Lista paginada de presupuestos
   */
  getQuotes: async (filters: QuoteFilters = {}) => {
    const response = await axiosInstance.get('/api/quotes', { params: filters });
    return response.data;
  },

  /**
   * Obtener un presupuesto por su ID
   * @param id ID del presupuesto
   * @returns Datos del presupuesto
   */
  getQuoteById: async (id: string): Promise<Quote> => {
    const response = await axiosInstance.get(`/api/quotes/${id}`);
    return response.data.data;
  },

  /**
   * Actualizar un presupuesto existente
   * @param id ID del presupuesto
   * @param quote Datos actualizados
   * @returns Presupuesto actualizado
   */
  updateQuote: async (id: string, quote: Partial<Quote>): Promise<Quote> => {
    const response = await axiosInstance.put(`/api/quotes/${id}`, quote);
    return response.data.data;
  },

  /**
   * Eliminar un presupuesto
   * @param id ID del presupuesto
   */
  deleteQuote: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/quotes/${id}`);
  },

  /**
   * Actualizar el estado de un presupuesto
   * @param id ID del presupuesto
   * @param status Nuevo estado
   * @returns Presupuesto actualizado
   */
  updateQuoteStatus: async (id: string, status: Quote['status']): Promise<Quote> => {
    const response = await axiosInstance.patch(`/api/quotes/${id}/status`, { status });
    return response.data.data;
  },

  /**
   * Convertir un presupuesto a factura
   * @param id ID del presupuesto
   * @returns Datos de la factura creada y el presupuesto actualizado
   */
  convertToInvoice: async (id: string) => {
    const response = await axiosInstance.post(`/api/quotes/${id}/convert-to-invoice`);
    return response.data.data;
  },

  /**
   * Obtener un presupuesto en formato PDF
   * @param id ID del presupuesto
   * @returns URL del PDF generado
   */
  getQuotePdf: async (id: string): Promise<string> => {
    const response = await axiosInstance.get(`/api/quotes/${id}/pdf`);
    return response.data.pdfUrl || '';
  }
};

export default quoteApi;
