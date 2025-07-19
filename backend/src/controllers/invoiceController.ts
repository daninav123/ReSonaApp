import { Request, Response } from 'express';
import Invoice from '../models/Invoice';
import { handleError } from '../utils/errorHandler';
import { AuthRequest } from '../middlewares/auth';

// Crear una nueva factura
export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const newInvoice = new Invoice({
      ...req.body,
      createdBy: userId,
      updatedBy: userId
    });

    const savedInvoice = await newInvoice.save();
    await savedInvoice.populate('client', 'name email phone');
    
    if (req.body.event) {
      await savedInvoice.populate('event', 'title startDate');
    }

    res.status(201).json({
      success: true,
      data: savedInvoice
    });
  } catch (error) {
    handleError(error, res, 'Error al crear la factura');
  }
};

// Obtener todas las facturas con filtros opcionales
export const getInvoices = async (req: Request, res: Response) => {
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
    const result = await Invoice.paginate(filter, options);

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
    handleError(error, res, 'Error al obtener las facturas');
  }
};

// Obtener una factura por ID
export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client', 'name email phone company')
      .populate('event', 'title startDate endDate location')
      .populate('createdBy', 'name email');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    handleError(error, res, 'Error al obtener la factura');
  }
};

// Actualizar una factura por ID
export const updateInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    
    // Evitamos que se actualice el número de factura
    const { invoiceNumber, ...updateData } = req.body;
    
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedBy: userId
      },
      { new: true, runValidators: true }
    )
      .populate('client', 'name email phone')
      .populate('event', 'title startDate');

    if (!updatedInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedInvoice
    });
  } catch (error) {
    handleError(error, res, 'Error al actualizar la factura');
  }
};

// Eliminar una factura por ID
export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const deletedInvoice = await Invoice.findByIdAndDelete(id);
    
    if (!deletedInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Factura eliminada correctamente'
    });
  } catch (error) {
    handleError(error, res, 'Error al eliminar la factura');
  }
};

// Cambiar el estado de una factura
export const updateInvoiceStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?._id;
    
    const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'partially-paid'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`
      });
    }
    
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      {
        status,
        updatedBy: userId,
        ...(status === 'paid' && { paymentDate: new Date() })
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedInvoice
    });
  } catch (error) {
    handleError(error, res, 'Error al actualizar el estado de la factura');
  }
};

// Generar factura PDF (stub - implementación futura con generador PDF)
export const generateInvoicePdf = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const invoice = await Invoice.findById(id)
      .populate('client', 'name email phone company address')
      .populate('event', 'title')
      .populate('createdBy', 'name');
      
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Factura no encontrada'
      });
    }
    
    // TODO: Integrar con generador de PDF (e.g., PDFKit, html-pdf)
    // Por ahora, solo devolvemos un mensaje de éxito
    
    res.status(200).json({
      success: true,
      message: 'Funcionalidad de generación de PDF será implementada próximamente',
      data: invoice
    });
  } catch (error) {
    handleError(error, res, 'Error al generar el PDF de la factura');
  }
};
