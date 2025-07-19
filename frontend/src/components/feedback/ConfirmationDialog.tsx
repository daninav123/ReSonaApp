import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  useTheme,
} from '@mui/material';
import { Close as CloseIcon, Warning as WarningIcon } from '@mui/icons-material';
import { Loading } from './Loading';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onClose?: () => void;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  fullWidth?: boolean;
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
  showCloseButton?: boolean;
  icon?: React.ReactNode;
  severity?: 'error' | 'warning' | 'info' | 'success' | 'none';
  contentProps?: Record<string, any>;
  titleTypographyProps?: Record<string, any>;
  confirmButtonProps?: Record<string, any>;
  cancelButtonProps?: Record<string, any>;
  hideCancelButton?: boolean;
  customActions?: React.ReactNode;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary',
  loading = false,
  onConfirm,
  onCancel,
  onClose,
  maxWidth = 'sm',
  fullWidth = true,
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  showCloseButton = true,
  icon,
  severity = 'warning',
  contentProps = {},
  titleTypographyProps = {},
  confirmButtonProps = {},
  cancelButtonProps = {},
  hideCancelButton = false,
  customActions,
}) => {
  const theme = useTheme();

  const handleClose = (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (
      (reason === 'backdropClick' && disableBackdropClick) ||
      (reason === 'escapeKeyDown' && disableEscapeKeyDown)
    ) {
      return;
    }
    
    onClose?.();
    onCancel();
  };

  const severityIcons = {
    error: <WarningIcon color="error" sx={{ fontSize: 40 }} />,
    warning: <WarningIcon sx={{ color: theme.palette.warning.main, fontSize: 40 }} />,
    info: <WarningIcon color="info" sx={{ fontSize: 40 }} />,
    success: <WarningIcon color="success" sx={{ fontSize: 40 }} />,
    none: null,
  };

  const displayIcon = icon !== undefined ? icon : severityIcons[severity];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      disableEscapeKeyDown={disableEscapeKeyDown}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {displayIcon && <Box sx={{ display: 'flex', alignItems: 'center' }}>{displayIcon}</Box>}
          <Typography variant="h6" component="span" {...titleTypographyProps}>
            {title}
          </Typography>
        </Box>
        {showCloseButton && (
          <IconButton
            aria-label="close"
            onClick={onCancel}
            sx={{
              color: (theme) => theme.palette.grey[500],
              '&:hover': {
                backgroundColor: (theme) => theme.palette.action.hover,
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent sx={{ py: 3 }} {...contentProps}>
        {typeof message === 'string' ? (
          <DialogContentText sx={{ color: 'text.primary', lineHeight: 1.6 }}>
            {message}
          </DialogContentText>
        ) : (
          message
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
        {loading ? (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Loading size={24} />
          </Box>
        ) : customActions ? (
          customActions
        ) : (
          <>
            {!hideCancelButton && (
              <Button
                onClick={onCancel}
                color="inherit"
                disabled={loading}
                sx={{ minWidth: 100, mr: 1 }}
                {...cancelButtonProps}
              >
                {cancelText}
              </Button>
            )}
            <Button
              onClick={onConfirm}
              color={confirmColor}
              variant="contained"
              disabled={loading}
              sx={{ minWidth: 100 }}
              {...confirmButtonProps}
            >
              {confirmText}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

interface UseConfirmationOptions extends Omit<ConfirmationDialogProps, 'open' | 'onConfirm' | 'onCancel' | 'onClose'> {
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
}

export const useConfirmation = (defaultOptions: UseConfirmationOptions = {}) => {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [options, setOptions] = React.useState<UseConfirmationOptions>(defaultOptions);
  const resolveRef = React.useRef<(value: boolean) => void>();

  const confirm = (customOptions: Partial<UseConfirmationOptions> = {}) => {
    return new Promise<boolean>((resolve) => {
      setOptions({ ...defaultOptions, ...customOptions });
      setOpen(true);
      resolveRef.current = resolve;
    });
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await options.onConfirm?.();
      resolveRef.current?.(true);
      setOpen(false);
    } catch (error) {
      console.error('Error in confirmation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    options.onCancel?.();
    resolveRef.current?.(false);
    setOpen(false);
  };

  const handleClose = () => {
    options.onClose?.();
    resolveRef.current?.(false);
    setOpen(false);
  };

  const ConfirmationDialogComponent = React.useMemo(
    () => (
      <ConfirmationDialog
        open={open}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onClose={handleClose}
        loading={loading}
        {...options}
      />
    ),
    [open, loading, options]
  );

  return { confirm, ConfirmationDialog: ConfirmationDialogComponent };
};
