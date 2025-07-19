import React from 'react';
import { Container } from '@mui/material';
import Calendar from '../components/calendar/Calendar';

const CalendarPage: React.FC = () => {
  return (
    <div className="page-container">
      <h1>Calendario</h1>
      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        <Calendar />
      </Container>
    </div>
  );
};

export default CalendarPage;
