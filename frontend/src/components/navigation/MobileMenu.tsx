import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  Divider,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  Task as TaskIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../store';
import { showNotification } from '@mantine/notifications';

interface MobileMenuProps {
  onToggleTheme: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ onToggleTheme }) => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.user);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Tasks', icon: <TaskIcon />, path: '/tasks' },
    { text: 'Materials', icon: <InventoryIcon />, path: '/materials' },
    { text: 'Budgets', icon: <ReceiptIcon />, path: '/budgets' },
    { text: 'Clients', icon: <PeopleIcon />, path: '/clients' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Box>
      <IconButton
        size="large"
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={handleMenu}
        sx={{ mr: 2 }}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            ReSonaApp
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar>{user?.name?.[0]}</Avatar>
            <Typography variant="subtitle1" sx={{ ml: 1 }}>
              {user?.name}
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />

          {menuItems.map((item) => (
            <MenuItem
              key={item.text}
              onClick={() => {
                navigate(item.path);
                handleClose();
              }}
            >
              {item.icon}
              <Typography variant="body1" sx={{ ml: 2 }}>
                {item.text}
              </Typography>
            </MenuItem>
          ))}

          <Divider sx={{ my: 2 }} />

          <MenuItem onClick={onToggleTheme}>
            <Typography variant="body1">Toggle Theme</Typography>
          </MenuItem>

          <MenuItem
            onClick={() => {
              showNotification({
                title: 'Success',
                message: 'Logged out successfully',
                color: 'brand',
              });
              navigate('/login');
            }}
          >
            <Typography variant="body1">Logout</Typography>
          </MenuItem>
        </Box>
      </Menu>
    </Box>
  );
};
