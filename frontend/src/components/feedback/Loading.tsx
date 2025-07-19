import React from 'react';
import { useAppSelector } from '../../store';
import {
  Box,
  CircularProgress,
  Backdrop,
  LinearProgress,
  Typography,
  Fade,
} from '@mui/material';
import { motion } from 'framer-motion';

interface LoadingProps {
  fullScreen?: boolean;
  linear?: boolean;
  message?: string;
  size?: number | string;
  thickness?: number;
  color?: 'primary' | 'secondary' | 'inherit' | 'success' | 'error' | 'info' | 'warning';
}

export const Loading: React.FC<LoadingProps> = ({
  fullScreen = false,
  linear = false,
  message = 'Loading...',
  size = 40,
  thickness = 3.6,
  color = 'primary',
}) => {
  const { preferences } = useAppSelector((state) => state.user);
  const reducedMotion = preferences.reducedMotion || false;

  const spinner = (
    <motion.div
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{
        duration: reducedMotion ? 0 : 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <CircularProgress
        size={size}
        thickness={thickness}
        color={color}
        aria-label={message}
      />
    </motion.div>
  );

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 3,
      }}
    >
      {!linear && spinner}
      {linear && (
        <Box sx={{ width: '100%' }}>
          <LinearProgress color={color} />
        </Box>
      )}
      {message && (
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Backdrop
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(4px)',
        }}
        open={true}
      >
        <Fade in={true} timeout={500}>
          {content}
        </Fade>
      </Backdrop>
    );
  }

  return content;
};

interface LoadingOverlayProps extends LoadingProps {
  loading: boolean;
  children: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loading,
  children,
  ...props
}) => {
  if (!loading) return <>{children}</>;

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 1,
        }}
      >
        <Loading {...props} />
      </Box>
      <Box sx={{ opacity: 0.5, pointerEvents: 'none' }}>{children}</Box>
    </Box>
  );
};

interface SkeletonLoaderProps {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: number | string;
  height?: number | string;
  animation?: 'pulse' | 'wave' | false;
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'rectangular',
  width = '100%',
  height = '1.5rem',
  animation = 'pulse',
  count = 1,
  className = '',
}) => {
  const { preferences } = useAppSelector((state) => state.user);
  const reducedMotion = preferences.reducedMotion || false;

  const skeletons = Array(count).fill(0).map((_, index) => {
    const baseStyle = {
      width,
      height,
      backgroundColor: 'rgba(0, 0, 0, 0.11)',
      borderRadius: variant === 'circular' ? '50%' : '4px',
      marginBottom: '0.5rem',
    };

    const pulseAnimation = {
      backgroundColor: 'rgba(0, 0, 0, 0.11)',
      background: `linear-gradient(90deg, rgba(0, 0, 0, 0.11) 0%, rgba(0, 0, 0, 0.05) 50%, rgba(0, 0, 0, 0.11) 100%)`,
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      '@keyframes shimmer': {
        '0%': { backgroundPosition: '200% 0' },
        '100%': { backgroundPosition: '-200% 0' },
      },
    };

    const waveAnimation = {
      position: 'relative',
      overflow: 'hidden',
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        transform: 'translateX(-100%)',
        background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)`,
        animation: 'shimmer 2s infinite',
        '@keyframes shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
      },
    };

    const animationStyle = reducedMotion || !animation ? {} : 
      animation === 'pulse' ? pulseAnimation : waveAnimation;

    return (
      <Box
        key={index}
        className={className}
        sx={{
          ...baseStyle,
          ...(variant === 'text' && {
            height: '1.5rem',
            borderRadius: '4px',
          }),
          ...animationStyle,
        }}
        aria-busy="true"
        aria-label="Loading..."
      />
    );
  });

  return <>{skeletons}</>;
};
