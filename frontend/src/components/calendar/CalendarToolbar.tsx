import React from 'react';
import { Box, Button, IconButton, Typography, Tooltip, useTheme, useMediaQuery } from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import TodayIcon from '@mui/icons-material/Today';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewDayIcon from '@mui/icons-material/ViewDay';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import FilterListIcon from '@mui/icons-material/FilterList';

interface CalendarToolbarProps {
  date: Date;
  view: string;
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  onView: (view: string) => void;
  views: string[];
  label: string;
  localizer: {
    messages: {
      month?: string;
      week?: string;
      day?: string;
      agenda?: string;
    };
  };
  onShowFilters?: () => void; // Optional prop for showing filters
}

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  date,
  view,
  onNavigate,
  onView,
  views,
  label,
  localizer,
  onShowFilters
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Function to get the appropriate icon for each view
  const getViewIcon = (viewName: string) => {
    switch (viewName) {
      case 'month':
        return <CalendarViewMonthIcon />;
      case 'week':
        return <ViewWeekIcon />;
      case 'day':
        return <ViewDayIcon />;
      case 'agenda':
        return <ViewAgendaIcon />;
      default:
        return null;
    }
  };

  // Function to get view label
  const getViewLabel = (viewName: string) => {
    return localizer.messages[viewName as keyof typeof localizer.messages] || viewName;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
        mb: 2,
        gap: 1,
        p: 1,
        borderRadius: 1,
        bgcolor: 'background.paper',
        boxShadow: 1
      }}
    >
      {/* Navigation controls */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <IconButton onClick={() => onNavigate('PREV')} size="small" color="primary">
          <NavigateBeforeIcon />
        </IconButton>

        <Button
          startIcon={<TodayIcon />}
          onClick={() => onNavigate('TODAY')}
          variant="outlined"
          size="small"
        >
          {isMobile ? '' : 'Hoy'}
        </Button>

        <IconButton onClick={() => onNavigate('NEXT')} size="small" color="primary">
          <NavigateNextIcon />
        </IconButton>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            ml: 1,
            flex: 1,
            whiteSpace: 'nowrap'
          }}
        >
          {label}
        </Typography>
      </Box>

      {/* View selector and filters */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: { xs: 'flex-start', sm: 'flex-end' }
        }}
      >
        {/* View selector buttons */}
        {views.map(viewName => (
          <Tooltip key={viewName} title={getViewLabel(viewName)}>
            <Button
              size="small"
              variant={view === viewName ? 'contained' : 'outlined'}
              startIcon={getViewIcon(viewName)}
              onClick={() => onView(viewName)}
              sx={{ minWidth: { xs: '40px', sm: '80px' } }}
            >
              {!isMobile && getViewLabel(viewName)}
            </Button>
          </Tooltip>
        ))}

        {/* Filter button */}
        {onShowFilters && (
          <Tooltip title="Filtros">
            <IconButton onClick={onShowFilters} color="primary">
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default CalendarToolbar;
