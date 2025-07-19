import express from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authorize } from '../middleware/auth';
import { ROLES } from '../middleware/roles';
import CalendarService from '../services/CalendarService';

const router = express.Router();

/**
 * @route   GET /api/calendar
 * @desc    Get all calendar events with filtering options
 * @access  Private
 */
router.get('/', authorize([ROLES.USER, ROLES.ADMIN]), asyncHandler(async (req, res) => {
  const filters = req.query;
  const events = await CalendarService.searchEvents(filters);
  res.json(events);
}));

/**
 * @route   GET /api/calendar/:id
 * @desc    Get a calendar event by ID
 * @access  Private
 */
router.get('/:id', authorize([ROLES.USER, ROLES.ADMIN]), asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  const event = await CalendarService.getEventById(eventId);
  res.json(event);
}));

/**
 * @route   POST /api/calendar
 * @desc    Create a new calendar event
 * @access  Private
 */
router.post('/', authorize([ROLES.USER, ROLES.ADMIN]), asyncHandler(async (req, res) => {
  // Add the current user as creator
  const eventData = {
    ...req.body,
    createdBy: req.user.id,
    updatedBy: req.user.id
  };
  
  const event = await CalendarService.createEvent(eventData);
  res.status(201).json(event);
}));

/**
 * @route   PUT /api/calendar/:id
 * @desc    Update a calendar event
 * @access  Private
 */
router.put('/:id', authorize([ROLES.USER, ROLES.ADMIN]), asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  // Add the current user as updater
  const updateData = {
    ...req.body,
    updatedBy: req.user.id
  };
  
  const event = await CalendarService.updateEvent(eventId, updateData);
  res.json(event);
}));

/**
 * @route   DELETE /api/calendar/:id
 * @desc    Delete a calendar event
 * @access  Private
 */
router.delete('/:id', authorize([ROLES.USER, ROLES.ADMIN]), asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  const result = await CalendarService.deleteEvent(eventId);
  res.json(result);
}));

/**
 * @route   GET /api/calendar/range/:start/:end
 * @desc    Get events in a specific date range
 * @access  Private
 */
router.get('/range/:start/:end', authorize([ROLES.USER, ROLES.ADMIN]), asyncHandler(async (req, res) => {
  const startDate = new Date(req.params.start);
  const endDate = new Date(req.params.end);
  const userId = req.query.userId?.toString();
  
  const events = await CalendarService.findEventsByDateRange(startDate, endDate, userId);
  res.json(events);
}));

/**
 * @route   GET /api/calendar/recurring/:id/:start/:end
 * @desc    Get recurring event instances in a date range
 * @access  Private
 */
router.get('/recurring/:id/:start/:end', authorize([ROLES.USER, ROLES.ADMIN]), asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  const startDate = new Date(req.params.start);
  const endDate = new Date(req.params.end);
  
  const instances = await CalendarService.getRecurringEventInstances(eventId, startDate, endDate);
  res.json(instances);
}));

/**
 * @route   POST /api/calendar/check-availability
 * @desc    Check resource availability for a given time period
 * @access  Private
 */
router.post('/check-availability', authorize([ROLES.USER, ROLES.ADMIN]), asyncHandler(async (req, res) => {
  const { resourceIds, startDate, endDate } = req.body;
  
  if (!resourceIds || !Array.isArray(resourceIds) || resourceIds.length === 0) {
    return res.status(400).json({ message: 'Resource IDs array is required' });
  }
  
  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Both start and end dates are required' });
  }
  
  const availability = await CalendarService.checkResourceAvailability(
    resourceIds,
    new Date(startDate),
    new Date(endDate)
  );
  
  res.json(availability);
}));

/**
 * @route   PUT /api/calendar/status/batch
 * @desc    Update status of multiple events in batch
 * @access  Private
 */
router.put('/status/batch', authorize([ROLES.USER, ROLES.ADMIN]), asyncHandler(async (req, res) => {
  const { eventIds, status } = req.body;
  
  if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
    return res.status(400).json({ message: 'Event IDs array is required' });
  }
  
  if (!status || !['scheduled', 'confirmed', 'cancelled', 'completed', 'draft'].includes(status)) {
    return res.status(400).json({ message: 'Valid status is required' });
  }
  
  const result = await CalendarService.updateEventStatus(eventIds, status, req.user.id);
  res.json(result);
}));

export default router;
