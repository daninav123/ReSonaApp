import React from 'react';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import EventIcon from '@mui/icons-material/Event';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import PublicIcon from '@mui/icons-material/Public';
import GroupIcon from '@mui/icons-material/Group';
import LockIcon from '@mui/icons-material/Lock';

interface EventItemProps {
  event: any;
}

const EventItem: React.FC<EventItemProps> = ({ event }) => {
  const { title, originalEvent } = event;
  
  // Determine priority icon and color
  const getPriorityIcon = () => {
    switch (originalEvent.priority) {
      case 'high':
      case 'urgent':
        return <PriorityHighIcon fontSize="small" sx={{ color: '#ff5252' }} />;
      default:
        return null;
    }
  };

  // Determine visibility icon
  const getVisibilityIcon = () => {
    switch (originalEvent.visibility) {
      case 'public':
        return <PublicIcon fontSize="small" sx={{ color: '#757575' }} />;
      case 'team':
        return <GroupIcon fontSize="small" sx={{ color: '#757575' }} />;
      case 'private':
        return <LockIcon fontSize="small" sx={{ color: '#757575' }} />;
      default:
        return null;
    }
  };

  // Format time for display
  const formatTime = () => {
    const start = new Date(originalEvent.startDate);
    if (originalEvent.allDay) {
      return null;
    }
    return start.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  // Get status-specific styles
  const getStatusStyle = () => {
    switch (originalEvent.status) {
      case 'cancelled':
        return { textDecoration: 'line-through' };
      case 'draft':
        return { fontStyle: 'italic' };
      default:
        return {};
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex',
        alignItems: 'flex-start',
        padding: '2px 4px',
        overflow: 'hidden',
        width: '100%',
        height: '100%'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {getPriorityIcon()}
        {getVisibilityIcon()}
        
        <Box sx={{ overflow: 'hidden' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              ...getStatusStyle()
            }}
          >
            {title}
          </Typography>
          
          {formatTime() && (
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block', 
                lineHeight: 1
              }}
            >
              {formatTime()}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default EventItem;
