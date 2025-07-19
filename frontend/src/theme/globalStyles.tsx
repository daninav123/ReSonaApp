import React from 'react';
import { GlobalStyles as MuiGlobalStyles, useTheme } from '@mui/material';

const GlobalStyles = () => {
  const theme = useTheme();

  return (
    <MuiGlobalStyles
      styles={{

        // Estilos de reset y normalización
        '*, *::before, *::after': {
          boxSizing: 'border-box',
          margin: 0,
          padding: 0,
        },
        // Estilos base de HTML y body
        html: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          height: '100%',
          width: '100%',
        },
        body: {
          height: '100%',
          width: '100%',
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          lineHeight: 1.5,
          // Desplazamiento suave
          scrollBehavior: 'smooth',
          // Prevenir desbordamiento horizontal
          overflowX: 'hidden',
          // Mejorar la tipografía
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.fontSize,
        },
        // Estilos para elementos de formulario
        'input, button, textarea, select': {
          font: 'inherit',
        },
        // Estilos para enlaces
        a: {
          color: theme.palette.primary.main,
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
        // Estilos para imágenes
        'img, svg, video, canvas, audio, iframe, embed, object': {
          display: 'block',
          maxWidth: '100%',
          height: 'auto',
        },
        // Estilos para elementos de lista
        'ul, ol': {
          paddingLeft: theme.spacing(4),
        },
        // Clases de utilidad
        '.sr-only': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: 0,
        },
        '.container': {
          width: '100%',
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(2),
          marginLeft: 'auto',
          marginRight: 'auto',
          [theme.breakpoints.up('sm')]: {
            maxWidth: '600px',
          },
          [theme.breakpoints.up('md')]: {
            maxWidth: '900px',
          },
          [theme.breakpoints.up('lg')]: {
            maxWidth: '1200px',
          },
          [theme.breakpoints.up('xl')]: {
            maxWidth: '1536px',
          },
        },
        // Estilos para el modo de alto contraste
        '@media (prefers-contrast: high)': {
          '*': {
            outline: '1px solid currentColor !important',
          },
        },
        // Estilos para reducir movimiento cuando el usuario lo prefiere
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important',
          },
        },
      }}
    />
  );
};

export default GlobalStyles;
