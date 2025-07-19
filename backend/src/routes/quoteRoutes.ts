import express from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth';
import {
  createQuote,
  getQuotes,
  getQuoteById,
  updateQuote,
  deleteQuote,
  updateQuoteStatus,
  convertQuoteToInvoice,
  generateQuotePdf
} from '../controllers/quoteController';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas para operaciones CRUD básicas
router.post('/', createQuote);
router.get('/', getQuotes);
router.get('/:id', getQuoteById);
router.put('/:id', updateQuote);
router.delete('/:id', roleMiddleware(['admin', 'finance']), deleteQuote);

// Ruta para actualizar el estado del presupuesto
router.patch('/:id/status', updateQuoteStatus);

// Ruta para convertir presupuesto a factura
router.post('/:id/convert-to-invoice', roleMiddleware(['admin', 'finance']), convertQuoteToInvoice);

// Ruta para generar PDF
router.get('/:id/pdf', generateQuotePdf);

export default router;
