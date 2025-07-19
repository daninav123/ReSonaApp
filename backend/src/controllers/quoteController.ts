import { Request, Response } from 'express';
import Quote from '../models/Quote';
import Invoice from '../models/Invoice';
import { handleError } from '../utils/errorHandler';
import { AuthRequest } from '../middlewares/auth';

// Crear un nuevo presupuesto
export const createQuote = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const newQuote = new Quote({
      ...req.body,
      createdBy: userId,
      updatedBy: userId
    });

    const savedQuote = await newQuote.save();
    await savedQuote.populate('client', 'name email phone');
    
    if (req.body.event) {
      await savedQuote.populate('event', 'title startDate');
    }

    res.status(201).json({
      success: true,
      data: savedQuote
    });
  } catch (error) {
    handleError(error, res, 'Error al crear el presupuesto');
  }
};

// Obtener todos los presupuestos con filtros opcionales
export const getQuotes = async (req: Request, res: Response) => {
  try {
    const {
      client,
      event,
      status,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Construir filtro
    const filter: Record<string, any> = {};

    if (client) filter.client = client;
    if (event) filter.event = event;
    if (status) filter.status = status;
    
    if (startDate || endDate) {
      filter.issueDate = {};
      if (startDate) filter.issueDate.$gte = new Date(startDate as string);
      if (endDate) filter.issueDate.$lte = new Date(endDate as string);
    }
    
    if (minAmount || maxAmount) {
      filter.total = {};
      if (minAmount) filter.total.$gte = Number(minAmount);
      if (maxAmount) filter.total.$lte = Number(maxAmount);
    }

    // Opciones de paginación y ordenación
    const options = {
      page: Number(page),
      limit: Number(limit),
      sort: { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 },
      populate: [
        { path: 'client', select: 'name email' },
        { path: 'event', select: 'title startDate' },
        { path: 'createdBy', select: 'name email' }
      ]
    };

    // Ejecutar consulta paginada
    const result = await Quote.paginate(filter, options);

    res.status(200).json({
      success: true,
      data: result.docs,
      pagination: {
        total: result.totalDocs,
        pages: result.totalPages,
        page: result.page,
        limit: result.limit,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevPage: result.prevPage,
        nextPage: result.nextPage
      }
    });
  } catch (error) {
    handleError(error, res, 'Error al obtener los presupuestos');
  }
};

// Obtener un presupuesto por ID
export const getQuoteById = async (req: Request, res: Response) => {
  try {
    const quote = await Quote.findById(req.params.id)
      .populate('client', 'name email phone company')
      .populate('event', 'title startDate endDate location')
      .populate('createdBy', 'name email')
      .populate('convertedToInvoice', 'invoiceNumber status');

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Presupuesto no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: quote
    });
  } catch (error) {
    handleError(error, res, 'Error al obtener el presupuesto');
  }
};

// Actualizar un presupuesto por ID
export const updateQuote = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    
    // Evitamos que se actualice el número de presupuesto o el status convertido
    const { quoteNumber, status, ...updateData } = req.body;
    
    const currentQuote = await Quote.findById(id);
    if (!currentQuote) {
      return res.status(404).json({
        success: false,
        message: 'Presupuesto no encontrado'
      });
    }
    
    // Si ya está convertido a factura, no permitimos más cambios sustanciales
    if (currentQuote.status === 'converted') {
      return res.status(400).json({
        success: false,
        message: 'Este presupuesto ya ha sido convertido a factura y no puede ser modificado'
      });
    }
    
    const updatedQuote = await Quote.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedBy: userId,
        // Solo actualizamos el estado si se proporciona y no es 'converted'
        ...(req.body.status && req.body.status !== 'converted' ? { status: req.body.status } : {})
      },
      { new: true, runValidators: true }
    )
      .populate('client', 'name email phone')
      .populate('event', 'title startDate');

    res.status(200).json({
      success: true,
      data: updatedQuote
    });
  } catch (error) {
    handleError(error, res, 'Error al actualizar el presupuesto');
  }
};

// Eliminar un presupuesto por ID
export const deleteQuote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const quoteToDelete = await Quote.findById(id);
    
    if (!quoteToDelete) {
      return res.status(404).json({
        success: false,
        message: 'Presupuesto no encontrado'
      });
    }
    
    // Si ya está convertido a factura, no permitimos eliminación
    if (quoteToDelete.status === 'converted') {
      return res.status(400).json({
        success: false,
        message: 'Este presupuesto ya ha sido convertido a factura y no puede ser eliminado'
      });
    }
    
    await Quote.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Presupuesto eliminado correctamente'
    });
  } catch (error) {
    handleError(error, res, 'Error al eliminar el presupuesto');
  }
};

// Cambiar el estado de un presupuesto
export const updateQuoteStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?._id;
    
    const validStatuses = ['draft', 'sent', 'accepted', 'rejected', 'expired'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`
      });
    }
    
    const quote = await Quote.findById(id);
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Presupuesto no encontrado'
      });
    }
    
    // Si ya está convertido a factura, no permitimos cambio de estado
    if (quote.status === 'converted') {
      return res.status(400).json({
        success: false,
        message: 'Este presupuesto ya ha sido convertido a factura y no se puede cambiar su estado'
      });
    }
    
    const updatedQuote = await Quote.findByIdAndUpdate(
      id,
      { status, updatedBy: userId },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedQuote
    });
  } catch (error) {
    handleError(error, res, 'Error al actualizar el estado del presupuesto');
  }
};

// Convertir presupuesto a factura
export const convertQuoteToInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    
    const quote = await Quote.findById(id)
      .populate('client')
      .populate('event');
      
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Presupuesto no encontrado'
      });
    }
    
    // Verificar si el presupuesto ya fue convertido
    if (quote.status === 'converted') {
      return res.status(400).json({
        success: false,
        message: 'Este presupuesto ya ha sido convertido a factura'
      });
    }
    
    // Verificar si el presupuesto está en un estado que puede ser convertido
    if (quote.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Solo los presupuestos aceptados pueden ser convertidos a facturas'
      });
    }
    
    // Crear una nueva factura basada en el presupuesto
    const newInvoice = new Invoice({
      client: quote.client,
      event: quote.event,
      items: quote.items,
      subtotal: quote.subtotal,
      taxTotal: quote.taxTotal,
      discountTotal: quote.discountTotal,
      total: quote.total,
      notes: `Factura generada a partir del presupuesto ${quote.quoteNumber}\n${quote.notes || ''}`,
      status: 'draft',
      issueDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // 30 días de plazo por defecto
      createdBy: userId,
      updatedBy: userId
    });
    
    // Guardar la factura
    const savedInvoice = await newInvoice.save();
    
    // Actualizar el presupuesto para marcar como convertido
    quote.status = 'converted';
    quote.convertedToInvoice = savedInvoice._id;
    quote.updatedBy = userId;
    await quote.save();
    
    res.status(200).json({
      success: true,
      message: 'Presupuesto convertido a factura exitosamente',
      data: {
        invoice: savedInvoice,
        quote
      }
    });
  } catch (error) {
    handleError(error, res, 'Error al convertir el presupuesto a factura');
  }
};

// Generar presupuesto PDF (stub - implementación futura con generador PDF)
export const generateQuotePdf = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const quote = await Quote.findById(id)
      .populate('client', 'name email phone company address')
      .populate('event', 'title')
      .populate('createdBy', 'name');
      
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Presupuesto no encontrado'
      });
    }
    
    // TODO: Integrar con generador de PDF (e.g., PDFKit, html-pdf)
    // Por ahora, solo devolvemos un mensaje de éxito
    
    res.status(200).json({
      success: true,
      message: 'Funcionalidad de generación de PDF será implementada próximamente',
      data: quote
    });
  } catch (error) {
    handleError(error, res, 'Error al generar el PDF del presupuesto');
  }
};
