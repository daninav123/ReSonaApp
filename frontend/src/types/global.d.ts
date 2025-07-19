// Global type declarations
import { CalendarEvent } from './calendar';
import { Views } from 'react-big-calendar';

// Declare global types for react-big-calendar
declare module 'react-big-calendar' {
  export interface Event {
    id?: string;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    resource?: any;
    // Add any other fields your events use
  }
  
  export const Views: {
    MONTH: string;
    WEEK: string;
    DAY: string;
    AGENDA: string;
  };

  export const Calendar: any;
  export const momentLocalizer: any;
}

// Declare module for moment locale
declare module 'moment/locale/es' {
  const locale: string;
  export default locale;
}
