import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../controllers/authController';

import {
  Box,
  Typography,
  Input,
  Button,
  Sheet,
} from '@mui/joy';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await login(form);

      localStorage.setItem('token', data.token);

      alert('Login successful');
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Login failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Sheet
        sx={{
          width: '100%',
          maxWidth: 480,
          p: 4,
          borderRadius: '24px',
          boxShadow: 'lg',
          backdropFilter: 'blur(20px)',
          animation: 'fadeIn 0.6s ease-out',
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            level="h2"
            sx={{
              fontWeight: 700,
              background:
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Sign In
          </Typography>
        </Box>

        {/* Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'grid',
            gap: 2,
          }}
        >
          <Input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />

          <Input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <Button
            type="submit"
            size="lg"
            sx={{
              mt: 1,
              fontWeight: 600,
              background:
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: 'md',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              },
            }}
          >
            Login
          </Button>
        </Box>
      </Sheet>

      {/* Animation */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default Login;