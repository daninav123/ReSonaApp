import React, { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence as FramerAnimatePresence } from 'framer-motion';
import { useAppSelector } from '../../store';

interface AnimatePresenceProps {
  children: ReactNode;
  mode?: 'wait' | 'sync' | 'popLayout';
  initial?: boolean;
  onExitComplete?: () => void;
}

export const AnimatePresence: React.FC<AnimatePresenceProps> = ({
  children,
  mode = 'wait',
  initial = true,
  onExitComplete,
}) => {
  const { preferences } = useAppSelector((state) => state.user);
  const reducedMotion = preferences.reducedMotion || false;

  // Deshabilitar animaciones si el usuario prefiere movimiento reducido
  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <FramerAnimatePresence
      mode={mode}
      initial={initial}
      onExitComplete={onExitComplete}
    >
      {children}
    </FramerAnimatePresence>
  );
};

interface FadeProps {
  children: ReactNode;
  duration?: number;
  delay?: number;
  className?: string;
}

export const Fade: React.FC<FadeProps> = ({
  children,
  duration = 0.3,
  delay = 0,
  className = '',
}) => {
  const { preferences } = useAppSelector((state) => state.user);
  const reducedMotion = preferences.reducedMotion || false;

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface SlideProps extends FadeProps {
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}

export const Slide: React.FC<SlideProps> = ({
  children,
  direction = 'up',
  distance = 20,
  duration = 0.3,
  delay = 0,
  className = '',
}) => {
  const { preferences } = useAppSelector((state) => state.user);
  const reducedMotion = preferences.reducedMotion || false;

  const directionMap = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  };

  const initial = directionMap[direction];
  const animate = { x: 0, y: 0 };

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ ...initial, opacity: 0 }}
      animate={{ ...animate, opacity: 1 }}
      exit={{ ...initial, opacity: 0 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface ScaleProps extends FadeProps {
  scale?: number;
}

export const Scale: React.FC<ScaleProps> = ({
  children,
  scale = 0.9,
  duration = 0.2,
  delay = 0,
  className = '',
}) => {
  const { preferences } = useAppSelector((state) => state.user);
  const reducedMotion = preferences.reducedMotion || false;

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ scale, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale, opacity: 0 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StaggerContainerProps {
  children: ReactNode;
  staggerChildren?: number;
  delayChildren?: number;
  className?: string;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerChildren = 0.1,
  delayChildren = 0,
  className = '',
}) => {
  const { preferences } = useAppSelector((state) => state.user);
  const reducedMotion = preferences.reducedMotion || false;

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren,
            delayChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  className = '',
}) => {
  const { preferences } = useAppSelector((state) => state.user);
  const reducedMotion = preferences.reducedMotion || false;

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Hook para detectar preferencias de movimiento
export const useReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = React.useState(false);

  useEffect(() => {
    // Verificar preferencias del sistema
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Establecer estado inicial
    setReducedMotion(mediaQuery.matches);
    
    // Escuchar cambios en las preferencias
    const handleChange = () => setReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return reducedMotion;
};
