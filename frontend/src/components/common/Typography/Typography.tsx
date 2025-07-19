import { Typography as MuiTypography, useTheme } from '@mui/material';
import type { TypographyProps as MuiTypographyProps } from '@mui/material/Typography';
import { forwardRef } from 'react';
import type { ElementType } from 'react';

type Variant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'overline'
  | 'inherit';

export type TypographyProps = Omit<MuiTypographyProps, 'variant'> & {
  /**
   * The variant of the typography
   * @default 'body1'
   */
  variant?: Variant;
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   * Overrides the variant mapping.
   */
  component?: ElementType;
  /**
   * If `true`, the text will have a bottom margin
   * @default false
   */
  gutterBottom?: boolean;
  /**
   * If `true`, the text will not wrap, but instead will truncate with a text overflow ellipsis.
   * @default false
   */
  noWrap?: boolean;
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * The text color
   */
  color?:
    | 'initial'
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'textPrimary'
    | 'textSecondary'
    | 'error'
    | 'success'
    | 'warning'
    | 'info'
    | 'disabled';
  /**
   * If `true`, the text will have a subtle gradient effect
   * @default false
   */
  gradient?: boolean;
  /**
   * The weight of the font
   * @default 'regular'
   */
  weight?: 'light' | 'regular' | 'medium' | 'semiBold' | 'bold';
}

const fontWeights = {
  light: 300,
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
};

/**
 * Use typography to present your design and content as clearly and efficiently as possible.
 * 
 * The Typography component makes it easy to apply a default set of font weights and sizes in your application.
 */
const Typography = forwardRef<HTMLElement, TypographyProps>(({
  variant = 'body1',
  component,
  gutterBottom = false,
  noWrap = false,
  children,
  color = 'initial',
  gradient = false,
  weight = 'regular',
  sx,
  ...rest
}, ref) => {
  const theme = useTheme();
  
  // Map custom color props to theme colors
  const getColor = () => {
    switch (color) {
      case 'disabled':
        return theme.palette.text?.disabled || 'rgba(0, 0, 0, 0.38)';
      case 'inherit':
        return 'inherit';
      case 'textPrimary':
        return theme.palette.text.primary;
      case 'textSecondary':
        return theme.palette.text.secondary;
      case 'error':
        return theme.palette.error.main;
      case 'success':
        return theme.palette.success?.main || '#4caf50';
      case 'warning':
        return theme.palette.warning?.main || '#ff9800';
      case 'info':
        return theme.palette.info?.main || '#2196f3';
      default:
        return color;
    }
  };

  // Gradient text effect
  const gradientStyles = gradient ? {
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block',
  } : {};

  const typographyProps = {
    ref,
    variant,
    component: component as ElementType,
    noWrap,
    gutterBottom,
    color: color as any, // Type assertion needed for custom colors
    ...rest,
  };

  const style = {
    ...(gradient ? gradientStyles : { color: getColor() }),
  };

  return (
    <MuiTypography {...typographyProps} style={style} sx={{
      fontWeight: weight ? fontWeights[weight] : undefined,
      ...sx,
    }}>
      {children}
    </MuiTypography>
  );
});

Typography.displayName = 'Typography';

export default Typography;
