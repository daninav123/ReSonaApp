import { Types } from 'mongoose';
import CalendarEvent, { ICalendarEvent } from '../models/Calendar';
import { NotFoundError, ValidationError } from '../middleware/errorHandler';

interface EventQuery {
  startDate?: { $gte?: Date, $lte?: Date };
  endDate?: { $gte?: Date, $lte?: Date };
  eventType?: string;
  status?: string;
  createdBy?: Types.ObjectId;
  'attendees.userId'?: Types.ObjectId;
  tags?: { $in: string[] };
  visibility?: string;
  priority?: string;
  [key: string]: any;
}

class CalendarService {
  /**
   * Create a new calendar event
   */
  async createEvent(eventData: Partial<ICalendarEvent>): Promise<ICalendarEvent> {
    try {
      const event = new CalendarEvent(eventData);
      await event.validate();
      return await event.save();
    } catch (error) {
      if (error instanceof Error) {
        throw new ValidationError(`Error creating event: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: string): Promise<ICalendarEvent> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new ValidationError('Invalid event ID format');
    }

    const event = await CalendarEvent.findById(eventId);
    if (!event) {
      throw new NotFoundError(`Event with ID ${eventId} not found`);
    }

    return event;
  }

  /**
   * Update an existing event
   */
  async updateEvent(eventId: string, updateData: Partial<ICalendarEvent>): Promise<ICalendarEvent> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new ValidationError('Invalid event ID format');
    }

    const event = await CalendarEvent.findByIdAndUpdate(
      eventId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!event) {
      throw new NotFoundError(`Event with ID ${eventId} not found`);
    }

    return event;
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string): Promise<{ success: boolean; message: string }> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new ValidationError('Invalid event ID format');
    }

    const result = await CalendarEvent.findByIdAndDelete(eventId);

    if (!result) {
      throw new NotFoundError(`Event with ID ${eventId} not found`);
    }

    return { success: true, message: 'Event successfully deleted' };
  }

  /**
   * Find events by date range
   */
  async findEventsByDateRange(start: Date, end: Date, userId?: string): Promise<ICalendarEvent[]> {
    const query: EventQuery = {
      $or: [
        // Events that start within the range
        { startDate: { $gte: start, $lte: end } },
        // Events that end within the range
        { endDate: { $gte: start, $lte: end } },
        // Events that span the entire range
        { startDate: { $lte: start }, endDate: { $gte: end } }
      ]
    };

    // If userId provided, filter by user's events or where user is an attendee
    if (userId && Types.ObjectId.isValid(userId)) {
      query.$or = [
        { createdBy: new Types.ObjectId(userId) },
        { 'attendees.userId': new Types.ObjectId(userId) }
      ];
    }

    return await CalendarEvent.find(query).sort({ startDate: 1 });
  }

  /**
   * Get recurring event instances
   * Generates instances based on recurring pattern within a date range
   */
  async getRecurringEventInstances(eventId: string, start: Date, end: Date): Promise<Partial<ICalendarEvent>[]> {
    const baseEvent = await this.getEventById(eventId);
    
    if (!baseEvent.recurringPattern) {
      return [baseEvent];
    }

    const instances: Partial<ICalendarEvent>[] = [];
    const pattern = baseEvent.recurringPattern;
    
    let currentDate = new Date(baseEvent.startDate);
    const eventDuration = baseEvent.endDate.getTime() - baseEvent.startDate.getTime();

    while (currentDate <= end && 
          (!pattern.endDate || currentDate <= pattern.endDate) && 
          (!pattern.endAfterOccurrences || instances.length < pattern.endAfterOccurrences)) {
      
      if (currentDate >= start) {
        // Skip excluded dates
        const isExcluded = pattern.excludeDates?.some(excludeDate => 
          excludeDate.getFullYear() === currentDate.getFullYear() &&
          excludeDate.getMonth() === currentDate.getMonth() &&
          excludeDate.getDate() === currentDate.getDate()
        );

        if (!isExcluded) {
          const instanceEndDate = new Date(currentDate.getTime() + eventDuration);
          
          instances.push({
            ...baseEvent.toObject(),
            _id: new Types.ObjectId(), // Generate new ID for the instance
            startDate: new Date(currentDate),
            endDate: instanceEndDate,
            isRecurringInstance: true,
            originalEventId: baseEvent._id
          });
        }
      }

      // Advance to next occurrence based on pattern
      switch (pattern.frequency) {
        case 'daily':
          currentDate = new Date(currentDate.setDate(currentDate.getDate() + pattern.interval));
          break;
        case 'weekly':
          if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
            // Find the next day of week from pattern
            let found = false;
            for (let i = 1; i <= 7; i++) {
              const nextDate = new Date(currentDate);
              nextDate.setDate(nextDate.getDate() + i);
              if (pattern.daysOfWeek.includes(nextDate.getDay())) {
                currentDate = nextDate;
                found = true;
                break;
              }
            }
            
            if (!found) {
              // If no matching day found, jump to next week
              currentDate = new Date(currentDate.setDate(currentDate.getDate() + (7 * pattern.interval)));
            }
          } else {
            // Simple weekly pattern
            currentDate = new Date(currentDate.setDate(currentDate.getDate() + (7 * pattern.interval)));
          }
          break;
        case 'monthly':
          if (pattern.monthDay) {
            // Monthly by day of month
            currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + pattern.interval));
            
            // Adjust to specified day of month
            currentDate.setDate(Math.min(
              pattern.monthDay,
              new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
            ));
          } else if (pattern.monthWeek) {
            // Monthly by position in month (e.g., "second Tuesday")
            currentDate = this.getNextMonthWeekDay(
              currentDate,
              pattern.monthWeek,
              currentDate.getDay(),
              pattern.interval
            );
          } else {
            // Default monthly pattern
            currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + pattern.interval));
          }
          break;
        case 'yearly':
          currentDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + pattern.interval));
          break;
        default:
          throw new ValidationError(`Unsupported recurrence frequency: ${pattern.frequency}`);
      }
    }

    return instances;
  }

  /**
   * Helper function to calculate next occurrence for "nth weekday of month" pattern
   */
  private getNextMonthWeekDay(
    startDate: Date, 
    weekNum: number, 
    weekday: number, 
    intervalMonths: number
  ): Date {
    const result = new Date(startDate);
    
    // Move forward by the specified number of months
    result.setMonth(result.getMonth() + intervalMonths);
    
    // Reset to first day of target month
    result.setDate(1);
    
    // Find the first occurrence of the specified weekday
    while (result.getDay() !== weekday) {
      result.setDate(result.getDate() + 1);
    }
    
    // Adjust to the specified week (weekNum)
    // Special case: -1 means "last occurrence in month"
    if (weekNum === -1) {
      // Find the last occurrence of this weekday in the month
      let lastOccurrence = result;
      while (true) {
        const nextDate = new Date(lastOccurrence);
        nextDate.setDate(nextDate.getDate() + 7);
        
        if (nextDate.getMonth() !== result.getMonth()) {
          // Next occurrence would be in the next month
          return lastOccurrence;
        }
        
        lastOccurrence = nextDate;
      }
    } else {
      // Move to the nth occurrence (0-based, so weekNum=1 means "second occurrence")
      result.setDate(result.getDate() + (7 * weekNum));
      
      // If this pushes us into the next month, go back to the last valid occurrence
      if (result.getMonth() !== (startDate.getMonth() + intervalMonths) % 12) {
        result.setDate(result.getDate() - 7);
      }
    }
    
    return result;
  }

  /**
   * Advanced search with filtering
   */
  async searchEvents(filters: Record<string, any> = {}): Promise<ICalendarEvent[]> {
    const query: EventQuery = {};
    
    // Process date filters
    if (filters.startAfter) {
      query.startDate = { $gte: new Date(filters.startAfter) };
    }
    if (filters.startBefore) {
      query.startDate = { ...query.startDate, $lte: new Date(filters.startBefore) };
    }
    if (filters.endAfter) {
      query.endDate = { $gte: new Date(filters.endAfter) };
    }
    if (filters.endBefore) {
      query.endDate = { ...query.endDate, $lte: new Date(filters.endBefore) };
    }
    
    // Process exact match filters
    const exactMatchFields = [
      'eventType', 'status', 'visibility', 'priority', 'allDay'
    ];
    
    exactMatchFields.forEach(field => {
      if (filters[field] !== undefined) {
        query[field] = filters[field];
      }
    });
    
    // Process reference ID filters
    if (filters.createdBy && Types.ObjectId.isValid(filters.createdBy)) {
      query.createdBy = new Types.ObjectId(filters.createdBy);
    }
    
    // Process attendee filters
    if (filters.attendeeId && Types.ObjectId.isValid(filters.attendeeId)) {
      query['attendees.userId'] = new Types.ObjectId(filters.attendeeId);
    }
    
    // Process tag filters
    if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }
    
    // Process text search (across title and description)
    if (filters.searchText) {
      const searchRegex = new RegExp(filters.searchText, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex }
      ];
    }
    
    // Apply pagination
    const page = filters.page ? parseInt(filters.page) : 1;
    const limit = filters.limit ? parseInt(filters.limit) : 50;
    const skip = (page - 1) * limit;
    
    // Apply sorting
    const sortField = filters.sortBy || 'startDate';
    const sortOrder = filters.sortOrder === 'desc' ? -1 : 1;
    const sortOptions: Record<string, number> = { [sortField]: sortOrder };

    return await CalendarEvent
      .find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
  }

  /**
   * Check resource availability for a time period
   */
  async checkResourceAvailability(
    resourceIds: string[], 
    startDate: Date, 
    endDate: Date
  ): Promise<Record<string, boolean>> {
    const conflicts = await CalendarEvent.find({
      'resources.resourceId': { $in: resourceIds.map(id => new Types.ObjectId(id)) },
      $or: [
        { startDate: { $lt: endDate, $gte: startDate } },
        { endDate: { $gt: startDate, $lte: endDate } },
        { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
      ],
      status: { $nin: ['cancelled'] }
    });

    // Map of resourceId to its availability (true = available, false = booked)
    const availability: Record<string, boolean> = {};
    
    // Initialize all resources as available
    resourceIds.forEach(id => {
      availability[id] = true;
    });
    
    // Mark resources that have conflicts as unavailable
    conflicts.forEach(conflict => {
      conflict.resources.forEach(resource => {
        const resourceIdStr = resource.resourceId.toString();
        if (resourceIds.includes(resourceIdStr)) {
          availability[resourceIdStr] = false;
        }
      });
    });
    
    return availability;
  }

  /**
   * Update event status in bulk
   */
  async updateEventStatus(
    eventIds: string[], 
    status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'draft',
    updatedBy: string
  ): Promise<{ success: boolean; updatedCount: number }> {
    const validIds = eventIds.filter(id => Types.ObjectId.isValid(id));
    
    if (validIds.length === 0) {
      throw new ValidationError('No valid event IDs provided');
    }
    
    const result = await CalendarEvent.updateMany(
      { _id: { $in: validIds.map(id => new Types.ObjectId(id)) } },
      { 
        $set: { 
          status, 
          updatedBy: new Types.ObjectId(updatedBy),
          updatedAt: new Date()
        } 
      }
    );
    
    return {
      success: true,
      updatedCount: result.modifiedCount
    };
  }
}

export default new CalendarService();
