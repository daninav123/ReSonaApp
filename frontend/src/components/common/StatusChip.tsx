import React from 'react';
import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material/Chip';

interface StatusChipProps {
  status: string;
  label: string;
  color?: ChipProps['color'];
}

const StatusChip: React.FC<StatusChipProps> = ({ status, label, color }) => {
  // Determine color based on status if not provided
  const chipColor = color || (
    status === 'active' || status === 'completed' || status === 'paid' ? 'success' :
    status === 'pending' || status === 'in-progress' ? 'warning' :
    status === 'inactive' || status === 'cancelled' || status === 'overdue' ? 'error' :
    'default'
  );
  return (
    <Chip
      label={label}
      color={chipColor}
      size="small"
      sx={{
        fontWeight: 'medium',
        minWidth: '90px',
        textAlign: 'center'
      }}
    />
  );
};

export default StatusChip;
