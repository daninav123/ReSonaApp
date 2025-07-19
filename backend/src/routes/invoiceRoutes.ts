import express from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth';
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  updateInvoiceStatus,
  generateInvoicePdf
} from '../controllers/invoiceController';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas para operaciones CRUD básicas
router.post('/', createInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.put('/:id', updateInvoice);
router.delete('/:id', roleMiddleware(['admin', 'finance']), deleteInvoice);

// Ruta para actualizar el estado de la factura
router.patch('/:id/status', updateInvoiceStatus);

// Ruta para generar PDF
router.get('/:id/pdf', generateInvoicePdf);

export default router;
