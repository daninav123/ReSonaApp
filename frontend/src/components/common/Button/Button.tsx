import { Button as MuiButton, CircularProgress, useTheme } from '@mui/material';
import type { ButtonProps as MuiButtonProps } from '@mui/material';
import { forwardRef } from 'react';

export type ButtonProps = Omit<MuiButtonProps, 'color' | 'variant' | 'size'> & {
  /**
   * The variant of the button
   * @default 'contained'
   */
  variant?: 'contained' | 'outlined' | 'text' | 'dashed';
  /**
   * The color of the component
   * @default 'primary'
   */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  /**
   * The size of the component
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * If `true`, the button will take up the full width of its container
   * @default false
   */
  fullWidth?: boolean;
  /**
   * If `true`, the button will be disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * If `true`, the button will show a loading spinner
   * @default false
   */
  loading?: boolean;
  /**
   * The type of the button
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';
  /**
   * The content of the button
   */
  children: React.ReactNode;
  /**
   * The URL to link to when the button is clicked
   */
  href?: string;
  /**
   * The component used for the root node. Either a string to use a HTML element or a component
   */
  component?: React.ElementType;
  /**
   * Callback fired when the button is clicked
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

/**
 * Buttons allow users to take actions, and make choices, with a single tap.
 * 
 * The Button component replaces the MUI Button with additional styling and functionality.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  type = 'button',
  children,
  startIcon,
  endIcon,
  sx,
  ...props
}, ref) => {
  const theme = useTheme();
  
  // Handle loading state
  const renderStartIcon = loading ? (
    <CircularProgress 
      size={size === 'small' ? 16 : 20} 
      color="inherit" 
      sx={{
        mr: 1,
        color: variant === 'contained' 
          ? theme.palette[color]?.contrastText || theme.palette.common.white
          : theme.palette[color]?.main || theme.palette.primary.main
      }} 
    />
  ) : startIcon;

  // Disable button when loading
  const isDisabled = disabled || loading;

  // Custom styles for dashed variant
  const dashedStyles = variant === 'dashed' ? {
    border: `1px dashed ${theme.palette.grey[400]}`,
    '&:hover': {
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.primary.contrastText,
    },
  } : {};

  return (
    <MuiButton
      ref={ref}
      variant={variant === 'dashed' ? 'outlined' : variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      disabled={isDisabled}
      type={type}
      startIcon={renderStartIcon}
      endIcon={endIcon}
      sx={{
        textTransform: 'none',
        borderRadius: 2,
        fontWeight: 600,
        letterSpacing: 0.5,
        boxShadow: 'none',
        '&:hover': {
          boxShadow: theme.shadows[2],
        },
        '&:active': {
          boxShadow: 'none',
        },
        ...(variant === 'dashed' && dashedStyles),
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
});

Button.displayName = 'Button';

export default Button;
