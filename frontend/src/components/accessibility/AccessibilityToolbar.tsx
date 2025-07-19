import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Typography,
  Box,
  Slider,
  FormControlLabel,
  Switch,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Accessibility as AccessibilityIcon,
  TextFields as TextFieldsIcon,
  Visibility as VisibilityIcon,
  Contrast as ContrastIcon,
  Keyboard as KeyboardIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  ZoomOutMap as ZoomOutMapIcon,
} from '@mui/icons-material';
import { updatePreferences } from '../../store/slices/userSlice';

export const AccessibilityToolbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { preferences } = useAppSelector((state) => state.user);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFontSizeChange = (event: Event, newValue: number | number[]) => {
    const fontSize = Array.isArray(newValue) ? newValue[0] : newValue;
    document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
    dispatch(updatePreferences({ fontSize }));
  };

  const handleContrastChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const highContrast = event.target.checked;
    document.body.classList.toggle('high-contrast', highContrast);
    dispatch(updatePreferences({ highContrast }));
  };

  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    const html = document.documentElement;
    let zoom = parseFloat(html.style.zoom) || 1;
    
    switch (direction) {
      case 'in':
        zoom = Math.min(zoom + 0.1, 2);
        break;
      case 'out':
        zoom = Math.max(zoom - 0.1, 0.5);
        break;
      case 'reset':
      default:
        zoom = 1;
    }
    
    html.style.zoom = zoom.toString();
  };

  // Aplicar preferencias guardadas al cargar
  useEffect(() => {
    if (preferences.fontSize) {
      document.documentElement.style.setProperty('--font-size', `${preferences.fontSize}px`);
    }
    if (preferences.highContrast) {
      document.body.classList.add('high-contrast');
    }
  }, [preferences]);

  return (
    <Box>
      <Tooltip title="Accessibility options">
        <IconButton
          size="large"
          color="inherit"
          aria-label="accessibility options"
          onClick={handleMenu}
        >
          <AccessibilityIcon />
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ width: 280, p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            <TextFieldsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Text Size
          </Typography>
          <Box sx={{ px: 2, mb: 2 }}>
            <Slider
              value={preferences.fontSize || 16}
              onChange={handleFontSizeChange}
              min={12}
              max={24}
              step={1}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}px`}
              aria-label="Font size"
            />
          </Box>
          
          <Typography variant="subtitle1" gutterBottom>
            <ContrastIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Contrast
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={!!preferences.highContrast}
                onChange={handleContrastChange}
                name="highContrast"
                color="primary"
              />
            }
            label="High contrast mode"
            sx={{ mb: 2, ml: 0.5 }}
          />
          
          <Typography variant="subtitle1" gutterBottom>
            <VisibilityIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Page Zoom
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <IconButton onClick={() => handleZoom('in')} size="small">
              <ZoomInIcon />
            </IconButton>
            <IconButton onClick={() => handleZoom('out')} size="small">
              <ZoomOutIcon />
            </IconButton>
            <IconButton onClick={() => handleZoom('reset')} size="small">
              <ZoomOutMapIcon />
            </IconButton>
          </Box>
          
          <Typography variant="subtitle1" gutterBottom>
            <KeyboardIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Keyboard Navigation
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Use Tab to navigate, Enter to select, and Esc to close menus.
          </Typography>
        </Box>
      </Menu>
    </Box>
  );
};
