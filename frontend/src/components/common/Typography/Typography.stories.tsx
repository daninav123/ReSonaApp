import type { Meta, StoryObj } from '@storybook/react';
import { Typography } from './Typography';
import { Stack, Box } from '@mui/material';

const meta: Meta<typeof Typography> = {
  title: 'Components/Common/Typography',
  component: Typography,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
        'subtitle1', 'subtitle2', 
        'body1', 'body2', 
        'caption', 'overline', 'inherit'
      ],
      description: 'The variant of the typography',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'body1' },
      },
    },
    color: {
      control: 'select',
      options: ['initial', 'primary', 'secondary', 'textPrimary', 'textSecondary', 'error', 'success', 'warning', 'info', 'disabled'],
      description: 'The text color',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'initial' },
      },
    },
    weight: {
      control: 'select',
      options: ['light', 'regular', 'medium', 'semiBold', 'bold'],
      description: 'The font weight',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'regular' },
      },
    },
    gradient: {
      control: 'boolean',
      description: 'Apply gradient effect to text',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    gutterBottom: {
      control: 'boolean',
      description: 'If true, the text will have a bottom margin',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    noWrap: {
      control: 'boolean',
      description: 'If true, the text will not wrap',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
  },
  args: {
    children: 'The quick brown fox jumps over the lazy dog',
    variant: 'body1',
    color: 'initial',
    weight: 'regular',
    gradient: false,
    gutterBottom: false,
    noWrap: false,
  },
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const Headings: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="h1">H1. Heading 1</Typography>
      <Typography variant="h2">H2. Heading 2</Typography>
      <Typography variant="h3">H3. Heading 3</Typography>
      <Typography variant="h4">H4. Heading 4</Typography>
      <Typography variant="h5">H5. Heading 5</Typography>
      <Typography variant="h6">H6. Heading 6</Typography>
    </Stack>
  ),
};

export const Subtitles: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="subtitle1">Subtitle 1 - Lorem ipsum dolor sit amet</Typography>
      <Typography variant="subtitle2">Subtitle 2 - Consectetur adipiscing elit</Typography>
    </Stack>
  ),
};

export const BodyText: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="body1">
        Body 1 - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. 
        Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut 
        eleifend nibh porttitor.
      </Typography>
      <Typography variant="body2">
        Body 2 - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. 
        Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut 
        eleifend nibh porttitor.
      </Typography>
    </Stack>
  ),
};

export const CaptionAndOverline: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="caption">
        Caption - Used for captions, footnotes, etc.
      </Typography>
      <Typography variant="overline">
        Overline - Used for overlines
      </Typography>
    </Stack>
  ),
};

export const Colors: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography color="primary">Primary color text</Typography>
      <Typography color="secondary">Secondary color text</Typography>
      <Typography color="error">Error color text</Typography>
      <Typography color="success">Success color text</Typography>
      <Typography color="warning">Warning color text</Typography>
      <Typography color="info">Info color text</Typography>
      <Typography color="textPrimary">Text primary</Typography>
      <Typography color="textSecondary">Text secondary</Typography>
      <Typography color="disabled">Disabled text</Typography>
    </Stack>
  ),
};

export const FontWeights: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography weight="light">Light weight (300)</Typography>
      <Typography weight="regular">Regular weight (400)</Typography>
      <Typography weight="medium">Medium weight (500)</Typography>
      <Typography weight="semiBold">Semi-bold weight (600)</Typography>
      <Typography weight="bold">Bold weight (700)</Typography>
    </Stack>
  ),
};

export const WithGradient: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="h3" gradient>
        Gradient Heading
      </Typography>
      <Typography variant="h5" gradient>
        This text has a nice gradient effect
      </Typography>
    </Stack>
  ),
};

export const WithCustomComponent: Story = {
  render: () => (
    <Box>
      <Typography component="div" variant="h5">
        This is a div with h5 styles
      </Typography>
      <Typography component="span" variant="body2">
        This is a span with body2 styles
      </Typography>
    </Box>
  ),
};

const Template: Story = (args) => <Typography {...args} />;

export const Playground = Template.bind({});
Playground.args = {
  children: 'Customize this text in the controls panel',
  variant: 'body1',
  color: 'initial',
  weight: 'regular',
  gradient: false,
  gutterBottom: false,
  noWrap: false,
};
