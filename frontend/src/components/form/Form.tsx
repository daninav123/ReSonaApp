import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Input, Select, Textarea } from '@mui/material';

interface FormProps {
  onSubmit: (data: any) => void;
  validationSchema: yup.ObjectSchema<any>;
  defaultValues?: any;
  children: React.ReactNode;
}

export const Form: React.FC<FormProps> = ({
  onSubmit,
  validationSchema,
  defaultValues,
  children,
}) => {
  const methods = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues,
  });

  const { handleSubmit, control, formState: { errors } } = methods;

  const handleSubmitForm = (data: any) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)}>
      <Controller
        name="name"
        control={control}
        render={({ field: { onChange, value } }) => (
          <Input
            fullWidth
            label="Name"
            value={value}
            onChange={onChange}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        )}
      />
      {children}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
      >
        Submit
      </Button>
    </form>
  );
};

// Componentes de campos de formulario
export const FormInput = ({ name, label, ...props }: any) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { onChange, value } }) => (
      <Input
        fullWidth
        label={label}
        value={value}
        onChange={onChange}
        error={!!errors[name]}
        helperText={errors[name]?.message}
        {...props}
      />
    )}
  />
);

export const FormSelect = ({ name, label, options, ...props }: any) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { onChange, value } }) => (
      <Select
        fullWidth
        label={label}
        value={value}
        onChange={onChange}
        error={!!errors[name]}
        helperText={errors[name]?.message}
        {...props}
      >
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    )}
  />
);

export const FormTextarea = ({ name, label, ...props }: any) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { onChange, value } }) => (
      <Textarea
        fullWidth
        label={label}
        value={value}
        onChange={onChange}
        error={!!errors[name]}
        helperText={errors[name]?.message}
        {...props}
      />
    )}
  />
);
