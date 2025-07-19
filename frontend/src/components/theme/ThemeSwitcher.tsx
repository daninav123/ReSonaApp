import React from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  IconButton,
  ThemeProvider,
  createTheme,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
} from '@mui/icons-material';
import { updatePreferences } from '../store/slices/userSlice';

const ThemeSwitcher: React.FC = () => {
  const dispatch = useAppDispatch();
  const { preferences } = useAppSelector((state) => state.user);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const toggleTheme = () => {
    dispatch(
      updatePreferences({
        theme: preferences.theme === 'light' ? 'dark' : 'light',
      })
    );
  };

  return (
    <IconButton
      onClick={toggleTheme}
      color="inherit"
      sx={{ ml: 1, my: 0.5 }}
    >
      {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
};

export default ThemeSwitcher;
