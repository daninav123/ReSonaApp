import { Card as MuiCard, CardContent, CardHeader, CardActions, CardActionArea, Box } from '@mui/material';
import type { CardProps as MuiCardProps, SxProps, Theme } from '@mui/material';
import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import Typography from '../Typography/Typography';

// Type for the elevation effect on hover
type ElevationValue = 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16 | 24;

export type CardProps = Omit<MuiCardProps, 'title' | 'elevation' | 'content'> & {
  /**
   * The content of the component.
   */
  children: ReactNode;
  /**
   * The title to display in the card header.
   */
  title?: ReactNode;
  /**
   * The subheader to display in the card header.
   */
  subheader?: ReactNode;
  /**
   * The action to display in the card header.
   */
  headerAction?: ReactNode;
  /**
   * The avatar to display in the card header.
   */
  avatar?: ReactNode;
  /**
   * The content of the card.
   */
  content?: string;
  /**
   * The actions to display at the bottom of the card.
   */
  actions?: ReactNode;
  /**
   * If `true`, the card will be clickable.
   * @default false
   */
  clickable?: boolean;
  /**
   * Callback fired when the card is clicked.
   */
  onClick?: () => void;
  /**
   * The elevation of the card.
   * @default 1
   */
  elevation?: ElevationValue;
  /**
   * The elevation of the card when hovered.
   * Only applies if `clickable` is `true`.
   * @default 4
   */
  hoverElevation?: ElevationValue;
  /**
   * The variant to use.
   * @default 'elevation'
   */
  variant?: 'elevation' | 'outlined';
  /**
   * If `true`, the card will have a border radius.
   * @default true
   */
  rounded?: boolean;
  /**
   * The padding of the card content.
   * @default 2
   */
  padding?: number | string;
  /**
   * The maximum width of the card.
   */
  maxWidth?: number | string;
  /**
   * The minimum height of the card.
   */
  minHeight?: number | string;
  /**
   * The background color of the card.
   */
  backgroundColor?: string;
  /**
   * Custom styles for the card content.
   */
  contentSx?: SxProps<Theme>;
  /**
   * Custom styles for the card header.
   */
  headerSx?: SxProps<Theme>;
  /**
   * Custom styles for the card actions.
   */
  actionsSx?: SxProps<Theme>;
  /**
   * Custom styles for the card.
   */
  cardSx?: SxProps<Theme>;
  /**
   * If `true`, the card will have a loading state.
   * @default false
   */
  loading?: boolean;
  /**
   * The loading component to display when `loading` is `true`.
   */
  loadingComponent?: ReactNode;
}

/**
 * Cards are surfaces that display content and actions on a single topic.
 * 
 * They should be easy to scan for relevant and actionable information.
 * Elements, like text and images, should be placed on them in a way that clearly indicates hierarchy.
 */
const Card = forwardRef<HTMLDivElement, CardProps>(({
  title,
  subheader,
  headerAction,
  avatar,
  content,
  actions,
  clickable = false,
  onClick,
  elevation = 1,
  hoverElevation = 4,
  variant = 'elevation',
  rounded = true,
  padding = 2,
  maxWidth,
  minHeight,
  backgroundColor,
  contentSx,
  headerSx,
  actionsSx,
  cardSx,
  loading = false,
  loadingComponent,
  children,
  ...props
}, ref) => {
  // Handle click events
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // Render the card content
  const renderContent = () => (
    <>
      {(title || subheader || headerAction || avatar) && (
        <CardHeader
          title={typeof title === 'string' ? (
            <Typography variant="h6" component="div">
              {title}
            </Typography>
          ) : title}
          subheader={typeof subheader === 'string' ? (
            <Typography variant="body2" color="textSecondary">
              {subheader}
            </Typography>
          ) : subheader}
          action={headerAction}
          avatar={avatar}
          sx={{
            pb: 0,
            '& .MuiCardHeader-content': {
              overflow: 'hidden',
            },
            ...headerSx,
          }}
        />
      )}
      
      <CardContent 
        sx={{
          p: padding,
          '&:last-child': {
            pb: padding,
          },
          ...contentSx,
        }}
      >
        {loading ? (
          loadingComponent || (
            <Box display="flex" justifyContent="center" p={4}>
              <Typography color="textSecondary">Loading...</Typography>
            </Box>
          )
        ) : (
          content || children
        )}
      </CardContent>
      
      {actions && (
        <CardActions 
          sx={{
            pt: 0,
            px: padding,
            pb: padding,
            ...actionsSx,
          }}
        >
          {actions}
        </CardActions>
      )}
    </>
  );

  // Card styles
  const styles: SxProps<Theme> = {
    width: '100%',
    maxWidth: maxWidth || '100%',
    minHeight,
    backgroundColor,
    borderRadius: rounded ? 2 : 0,
    transition: (theme) =>
      theme.transitions.create(['box-shadow', 'transform'], {
        duration: theme.transitions.duration.shorter,
      }),
    '&:hover': {
      ...(clickable && {
        transform: 'translateY(-2px)',
        boxShadow: (theme) =>
          `${theme.shadows[hoverElevation]} !important`,
      }),
    },
    ...cardSx,
  };

  return (
    <MuiCard
      ref={ref}
      elevation={variant === 'elevation' ? elevation : 0}
      variant={variant}
      onClick={handleClick}
      sx={styles}
      {...props}
    >
      {clickable ? (
        <CardActionArea>
          {renderContent()}
        </CardActionArea>
      ) : (
        renderContent()
      )}
    </MuiCard>
  );
});

Card.displayName = 'Card';

export default Card;
