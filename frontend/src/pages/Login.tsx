import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { login } from '../store/slices/authSlice';
import { Form, FormInput } from '../components/form';
import { Button } from '@mui/material';
import { showNotification } from '@mantine/notifications';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { error } = useAppSelector((state) => state.auth);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (data: any) => {
    try {
      await dispatch(login(data)).unwrap();
      navigate(from, { replace: true });
    } catch (err) {
      showNotification({
        title: 'Error',
        message: 'Login failed. Please check your credentials.',
        color: 'red',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <Form onSubmit={handleSubmit} validationSchema={validationSchema}>
          <FormInput
            name="email"
            label="Email address"
            type="email"
            required
            fullWidth
          />
          <FormInput
            name="password"
            label="Password"
            type="password"
            required
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
          >
            Sign in
          </Button>
        </Form>
        {error && (
          <div className="mt-4 text-red-500 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
