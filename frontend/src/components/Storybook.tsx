import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Button, Card, Typography, Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { ThemeSwitcher } from './theme/ThemeSwitcher';
import { Notification } from './notifications/Notification';
import { MobileMenu } from './navigation/MobileMenu';
import { Form, FormInput, FormSelect, FormTextarea } from './form';

// Configuración de tema para Storybook
const theme = {
  palette: {
    primary: {
      main: '#00a2ff',
    },
    secondary: {
      main: '#4db8ff',
    },
  },
};

// Componentes de ejemplo para Storybook
storiesOf('Components/Button', module)
  .add('Default', () => (
    <Button variant="contained" color="primary">
      Default Button
    </Button>
  ))
  .add('With onClick', () => (
    <Button variant="contained" color="primary" onClick={action('clicked')}>
      Click me
    </Button>
  ));

storiesOf('Components/Form', module)
  .add('Basic Form', () => (
    <Form
      onSubmit={(data) => action('submitted')(data)}
      validationSchema={yup.object({
        name: yup.string().required('Name is required'),
        description: yup.string(),
      })}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormInput name="name" label="Name" fullWidth />
        <FormInput name="description" label="Description" multiline rows={4} fullWidth />
        <FormSelect
          name="priority"
          label="Priority"
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]}
          fullWidth
        />
        <FormTextarea name="notes" label="Notes" fullWidth />
      </Box>
    </Form>
  ));

storiesOf('Components/Notification', module)
  .add('Success', () => (
    <Notification
      open
      message="Operation completed successfully"
      severity="success"
      onClose={action('closed')}
    />
  ))
  .add('Error', () => (
    <Notification
      open
      message="An error occurred"
      severity="error"
      onClose={action('closed')}
    />
  ));

storiesOf('Components/ThemeSwitcher', module)
  .add('Default', () => (
    <ThemeProvider theme={theme}>
      <ThemeSwitcher />
    </ThemeProvider>
  ));

storiesOf('Components/MobileMenu', module)
  .add('Default', () => (
    <ThemeProvider theme={theme}>
      <MobileMenu onToggleTheme={action('themeToggled')} />
    </ThemeProvider>
  ));
