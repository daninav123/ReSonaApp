import express from 'express';
import { body, param, query } from 'express-validator';
import * as eventController from '../controllers/eventController';
import { authenticate } from '../middlewares/authenticate';
import { permissionGuard } from '../middlewares/permissionGuard';
import { validateRequest } from '../middlewares/validateRequest';

const router = express.Router();

// Base de todas las rutas protegidas por autenticación
router.use(authenticate);

// GET /api/events - Obtener todos los eventos con filtros opcionales
router.get(
  '/',
  [
    query('start').optional().isISO8601().withMessage('La fecha de inicio debe ser válida'),
    query('end').optional().isISO8601().withMessage('La fecha de fin debe ser válida'),
    query('client').optional().isMongoId().withMessage('ID de cliente inválido'),
    query('status').optional(),
    query('assignedTo').optional(),
    query('createdBy').optional().isMongoId().withMessage('ID de creador inválido'),
    query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser un número positivo'),
    query('limit').optional().isInt({ min: 1 }).withMessage('El límite debe ser un número positivo'),
    validateRequest
  ],
  permissionGuard('event:read'),
  eventController.getEvents
);

// GET /api/events/:id - Obtener un evento por ID
router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('ID de evento inválido'),
    validateRequest
  ],
  permissionGuard('event:read'),
  eventController.getEventById
);

// POST /api/events - Crear un nuevo evento
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('El título es obligatorio'),
    body('startDate').isISO8601().withMessage('La fecha de inicio debe ser válida'),
    body('endDate').isISO8601().withMessage('La fecha de fin debe ser válida'),
    body('client').optional().isMongoId().withMessage('ID de cliente inválido'),
    body('assignedTo').optional().isArray().withMessage('assignedTo debe ser un array'),
    body('assignedTo.*').optional().isMongoId().withMessage('ID de usuario asignado inválido'),
    body('status').optional().isIn(['draft', 'confirmed', 'in-progress', 'completed', 'cancelled'])
      .withMessage('Estado inválido'),
    body('checklist').optional().isArray().withMessage('checklist debe ser un array'),
    body('isAllDay').optional().isBoolean().withMessage('isAllDay debe ser un booleano'),
    validateRequest
  ],
  permissionGuard('event:write'),
  eventController.createEvent
);

// PUT /api/events/:id - Actualizar un evento existente
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('ID de evento inválido'),
    body('title').optional().notEmpty().withMessage('El título no puede estar vacío'),
    body('startDate').optional().isISO8601().withMessage('La fecha de inicio debe ser válida'),
    body('endDate').optional().isISO8601().withMessage('La fecha de fin debe ser válida'),
    body('client').optional().isMongoId().withMessage('ID de cliente inválido'),
    body('assignedTo').optional().isArray().withMessage('assignedTo debe ser un array'),
    body('assignedTo.*').optional().isMongoId().withMessage('ID de usuario asignado inválido'),
    body('status').optional().isIn(['draft', 'confirmed', 'in-progress', 'completed', 'cancelled'])
      .withMessage('Estado inválido'),
    body('checklist').optional().isArray().withMessage('checklist debe ser un array'),
    body('isAllDay').optional().isBoolean().withMessage('isAllDay debe ser un booleano'),
    validateRequest
  ],
  permissionGuard('event:write'),
  eventController.updateEvent
);

// DELETE /api/events/:id - Eliminar un evento
router.delete(
  '/:id',
  [
    param('id').isMongoId().withMessage('ID de evento inválido'),
    validateRequest
  ],
  permissionGuard('event:write'),
  eventController.deleteEvent
);

// POST /api/events/:id/checklist - Añadir un item a la checklist
router.post(
  '/:id/checklist',
  [
    param('id').isMongoId().withMessage('ID de evento inválido'),
    body('text').notEmpty().withMessage('El texto de la tarea es obligatorio'),
    validateRequest
  ],
  permissionGuard('event:write'),
  eventController.addChecklistItem
);

// PUT /api/events/:id/checklist/:itemId - Actualizar un item de la checklist
router.put(
  '/:id/checklist/:itemId',
  [
    param('id').isMongoId().withMessage('ID de evento inválido'),
    param('itemId').isMongoId().withMessage('ID de item inválido'),
    body('text').optional().notEmpty().withMessage('El texto de la tarea no puede estar vacío'),
    body('checked').optional().isBoolean().withMessage('checked debe ser un booleano'),
    validateRequest
  ],
  permissionGuard('event:write'),
  eventController.updateChecklistItem
);

// DELETE /api/events/:id/checklist/:itemId - Eliminar un item de la checklist
router.delete(
  '/:id/checklist/:itemId',
  [
    param('id').isMongoId().withMessage('ID de evento inválido'),
    param('itemId').isMongoId().withMessage('ID de item inválido'),
    validateRequest
  ],
  permissionGuard('event:write'),
  eventController.deleteChecklistItem
);

// GET /api/events/month/:year/:month - Obtener eventos del mes
router.get(
  '/month/:year/:month',
  [
    param('year').isInt({ min: 2000, max: 2100 }).withMessage('Año inválido'),
    param('month').isInt({ min: 1, max: 12 }).withMessage('Mes inválido'),
    validateRequest
  ],
  permissionGuard('event:read'),
  eventController.getMonthEvents
);

export default router;
