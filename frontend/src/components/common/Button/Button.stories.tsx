import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Box, Stack } from '@mui/material';
import Add from '@mui/icons-material/Add';
import Save from '@mui/icons-material/Save';
import Delete from '@mui/icons-material/Delete';
import CloudUpload from '@mui/icons-material/CloudUpload';

const meta: Meta<typeof Button> = {
  title: 'Components/Common/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['contained', 'outlined', 'text', 'dashed'],
      description: 'The variant of the button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'contained' },
      },
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'error', 'warning', 'info', 'inherit'],
      description: 'The color of the button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'The size of the button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'medium' },
      },
    },
    loading: {
      control: 'boolean',
      description: 'Show loading state',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Full width button',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: false },
      },
    },
  },
  args: {
    children: 'Button',
    variant: 'contained',
    color: 'primary',
    size: 'medium',
    loading: false,
    disabled: false,
    fullWidth: false,
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Contained: Story = {
  args: {
    variant: 'contained',
    children: 'Contained Button',
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: 'Outlined Button',
  },
};

export const Text: Story = {
  args: {
    variant: 'text',
    children: 'Text Button',
  },
};

export const Dashed: Story = {
  args: {
    variant: 'dashed',
    children: 'Dashed Button',
  },
};

export const WithIcons: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <Button variant="contained" startIcon={<Add />}>
        Add Item
      </Button>
      <Button variant="outlined" startIcon={<Save />}>
        Save
      </Button>
      <Button variant="text" startIcon={<Delete />} color="error">
        Delete
      </Button>
      <Button variant="contained" endIcon={<CloudUpload />} color="secondary">
        Upload
      </Button>
    </Stack>
  ),
};

export const Loading: Story = {
  render: () => (
    <Stack direction="row" spacing={2}>
      <Button variant="contained" loading>
        Loading
      </Button>
      <Button variant="outlined" loading loadingPosition="start" startIcon={<Save />}>
        Saving...
      </Button>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="row" spacing={2} alignItems="center">
      <Button size="small">Small</Button>
      <Button size="medium">Medium</Button>
      <Button size="large">Large</Button>
    </Stack>
  ),
};

export const Colors: Story = {
  render: () => (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" color="primary">
          Primary
        </Button>
        <Button variant="contained" color="secondary">
          Secondary
        </Button>
        <Button variant="contained" color="success">
          Success
        </Button>
        <Button variant="contained" color="error">
          Error
        </Button>
        <Button variant="contained" color="warning">
          Warning
        </Button>
        <Button variant="contained" color="info">
          Info
        </Button>
      </Stack>
      <Stack direction="row" spacing={2}>
        <Button variant="outlined" color="primary">
          Primary
        </Button>
        <Button variant="outlined" color="secondary">
          Secondary
        </Button>
        <Button variant="outlined" color="success">
          Success
        </Button>
        <Button variant="outlined" color="error">
          Error
        </Button>
        <Button variant="outlined" color="warning">
          Warning
        </Button>
        <Button variant="outlined" color="info">
          Info
        </Button>
      </Stack>
    </Stack>
  ),
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: 'Full Width Button',
  },
};

const Template: Story = (args) => <Button {...args} />;

export const Playground = Template.bind({});
Playground.args = {
  children: 'Click me',
  variant: 'contained',
  color: 'primary',
  size: 'medium',
  loading: false,
  disabled: false,
  fullWidth: false,
};
