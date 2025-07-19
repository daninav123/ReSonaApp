import { Request, Response } from 'express';
import Event, { IEvent } from '../models/Event';
import mongoose from 'mongoose';
import { IAuthRequest } from '../middlewares/authenticate';
import { NotificationService } from '../services/notification';

// Tipo para filtros de eventos
type EventFilters = {
  startDate?: { $gte?: Date };
  endDate?: { $lte?: Date };
  client?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  assignedTo?: { $in: mongoose.Types.ObjectId[] };
  status?: string | { $in: string[] };
};

// Obtener todos los eventos con filtros opcionales
export const getEvents = async (req: IAuthRequest, res: Response) => {
  try {
    const { 
      start, end, client, status, 
      assignedTo, createdBy, page = 1, limit = 10 
    } = req.query;
    
    const filters: EventFilters = {};
    
    // Aplicar filtros si existen
    if (start) filters.startDate = { $gte: new Date(start as string) };
    if (end) filters.endDate = { $lte: new Date(end as string) };
    if (client) filters.client = new mongoose.Types.ObjectId(client as string);
    if (createdBy) filters.createdBy = new mongoose.Types.ObjectId(createdBy as string);
    
    // Filtro de estado
    if (status) {
      if (Array.isArray(status)) {
        filters.status = { $in: status };
      } else {
        filters.status = status as string;
      }
    }
    
    // Filtro de asignados
    if (assignedTo) {
      const assignedIds = Array.isArray(assignedTo) 
        ? assignedTo.map(id => new mongoose.Types.ObjectId(id as string)) 
        : [new mongoose.Types.ObjectId(assignedTo as string)];
      filters.assignedTo = { $in: assignedIds };
    }
    
    // Paginación
    const skip = (Number(page) - 1) * Number(limit);
    
    // Realizar la consulta
    const events = await Event.find(filters)
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('client', 'name email phone')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    
    const total = await Event.countDocuments(filters);
    
    res.json({
      events,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ message: 'Error al obtener eventos', error });
  }
};

// Obtener un evento por ID
export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id)
      .populate('client', 'name email phone')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error al obtener evento:', error);
    res.status(500).json({ message: 'Error al obtener evento', error });
  }
};

// Crear un nuevo evento
export const createEvent = async (req: IAuthRequest, res: Response) => {
  try {
    const { 
      title, description, startDate, endDate, location, 
      client, assignedTo, status, checklist, isAllDay 
    } = req.body;
    
    // Validar fechas
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ 
        message: 'La fecha de inicio no puede ser posterior a la fecha de fin' 
      });
    }
    
    const newEvent = new Event({
      title,
      description,
      startDate,
      endDate,
      location,
      client: client ? new mongoose.Types.ObjectId(client) : undefined,
      createdBy: req.user?._id,
      assignedTo: assignedTo ? assignedTo.map((id: string) => new mongoose.Types.ObjectId(id)) : [],
      status: status || 'draft',
      checklist: checklist || [],
      isAllDay: isAllDay || false
    });
    
    const savedEvent = await newEvent.save();
    
    // Notificar a los usuarios asignados
    if (assignedTo && assignedTo.length > 0) {
      const notificationService = new NotificationService();
      
      assignedTo.forEach(async (userId: string) => {
        await notificationService.sendNotification({
          userId,
          type: 'event_assigned',
          title: 'Nuevo evento asignado',
          message: `Has sido asignado al evento: ${title}`,
          data: {
            eventId: savedEvent._id,
            eventTitle: title,
            eventDate: startDate
          }
        });
      });
    }
    
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({ message: 'Error al crear evento', error });
  }
};

// Actualizar un evento existente
export const updateEvent = async (req: IAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      title, description, startDate, endDate, location, 
      client, assignedTo, status, checklist, isAllDay 
    } = req.body;
    
    // Validar fechas
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ 
        message: 'La fecha de inicio no puede ser posterior a la fecha de fin' 
      });
    }
    
    // Comprobar si el evento existe
    const existingEvent = await Event.findById(id);
    
    if (!existingEvent) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    
    // Preparar datos para actualizar
    const updatedData: Partial<IEvent> = {};
    
    if (title !== undefined) updatedData.title = title;
    if (description !== undefined) updatedData.description = description;
    if (startDate !== undefined) updatedData.startDate = new Date(startDate);
    if (endDate !== undefined) updatedData.endDate = new Date(endDate);
    if (location !== undefined) updatedData.location = location;
    if (client !== undefined) updatedData.client = client ? new mongoose.Types.ObjectId(client) : undefined;
    if (status !== undefined) updatedData.status = status;
    if (isAllDay !== undefined) updatedData.isAllDay = isAllDay;
    
    // Manejo especial para arreglos
    if (assignedTo !== undefined) {
      updatedData.assignedTo = assignedTo.map((id: string) => new mongoose.Types.ObjectId(id));
      
      // Notificar a los nuevos asignados
      const newAssignees = assignedTo.filter(
        (id: string) => !existingEvent.assignedTo.some(
          existingId => existingId.toString() === id
        )
      );
      
      if (newAssignees.length > 0) {
        const notificationService = new NotificationService();
        
        newAssignees.forEach(async (userId: string) => {
          await notificationService.sendNotification({
            userId,
            type: 'event_assigned',
            title: 'Nuevo evento asignado',
            message: `Has sido asignado al evento: ${existingEvent.title}`,
            data: {
              eventId: existingEvent._id,
              eventTitle: existingEvent.title,
              eventDate: existingEvent.startDate
            }
          });
        });
      }
    }
    
    if (checklist !== undefined) {
      updatedData.checklist = checklist;
    }
    
    // Actualizar evento
    const updatedEvent = await Event.findByIdAndUpdate(
      id, 
      { $set: updatedData }, 
      { new: true, runValidators: true }
    )
    .populate('client', 'name email phone')
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email');
    
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    res.status(500).json({ message: 'Error al actualizar evento', error });
  }
};

// Eliminar un evento
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const deletedEvent = await Event.findByIdAndDelete(id);
    
    if (!deletedEvent) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    
    res.json({ message: 'Evento eliminado correctamente', event: deletedEvent });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    res.status(500).json({ message: 'Error al eliminar evento', error });
  }
};

// Añadir un item a la checklist de un evento
export const addChecklistItem = async (req: IAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'El texto de la tarea es obligatorio' });
    }
    
    const event = await Event.findById(id);
    
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    
    event.checklist.push({
      text,
      checked: false,
      createdAt: new Date()
    });
    
    await event.save();
    
    res.json(event);
  } catch (error) {
    console.error('Error al añadir item a la checklist:', error);
    res.status(500).json({ message: 'Error al añadir item a la checklist', error });
  }
};

// Actualizar un item de la checklist
export const updateChecklistItem = async (req: Request, res: Response) => {
  try {
    const { id, itemId } = req.params;
    const { text, checked } = req.body;
    
    const event = await Event.findById(id);
    
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    
    const checklistItem = event.checklist.id(itemId);
    
    if (!checklistItem) {
      return res.status(404).json({ message: 'Item de checklist no encontrado' });
    }
    
    if (text !== undefined) checklistItem.text = text;
    if (checked !== undefined) checklistItem.checked = checked;
    
    await event.save();
    
    res.json(event);
  } catch (error) {
    console.error('Error al actualizar item de checklist:', error);
    res.status(500).json({ message: 'Error al actualizar item de checklist', error });
  }
};

// Eliminar un item de la checklist
export const deleteChecklistItem = async (req: Request, res: Response) => {
  try {
    const { id, itemId } = req.params;
    
    const event = await Event.findById(id);
    
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    
    event.checklist = event.checklist.filter(
      item => item._id.toString() !== itemId
    );
    
    await event.save();
    
    res.json(event);
  } catch (error) {
    console.error('Error al eliminar item de checklist:', error);
    res.status(500).json({ message: 'Error al eliminar item de checklist', error });
  }
};

// Obtener eventos del mes
export const getMonthEvents = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.params;
    
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);
    
    const events = await Event.find({
      $or: [
        { 
          startDate: { $gte: startDate, $lte: endDate } 
        },
        { 
          endDate: { $gte: startDate, $lte: endDate } 
        },
        {
          $and: [
            { startDate: { $lte: startDate } },
            { endDate: { $gte: endDate } }
          ]
        }
      ]
    })
    .select('title startDate endDate status isAllDay')
    .sort({ startDate: 1 });
    
    res.json(events);
  } catch (error) {
    console.error('Error al obtener eventos del mes:', error);
    res.status(500).json({ message: 'Error al obtener eventos del mes', error });
  }
};
