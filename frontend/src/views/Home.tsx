import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/joy';

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        p: 2,
      }}
    >
      {/* Animated Background Effect */}
      <Box
        sx={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '100%',
          height: '100%',
          background:
            'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'moveBg 20s linear infinite',
        }}
      />

      {/* Main Content */}
      <Box
        sx={{
          maxWidth: 800,
          textAlign: 'center',
          zIndex: 10,
          animation: 'fadeIn 0.8s ease-out',
        }}
      >
        <Typography
          level="h1"
          sx={{
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            fontWeight: 800,
            color: '#fff',
            mb: 2,
            textShadow: '0 2px 10px rgba(0,0,0,0.2)',
          }}
        >
          Welcome to PulseConnect
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: '1.1rem', md: '1.4rem' },
            color: 'rgba(255,255,255,0.9)',
            mb: 4,
            textShadow: '0 1px 5px rgba(0,0,0,0.1)',
          }}
        >
            An intelligent real-time communication platform with live user presence tracking. 
        </Typography>

        {/* Buttons */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button
            size="lg"
            onClick={() => navigate('/login')}
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 600,
              borderRadius: '12px',
              background: '#fff',
              color: '#667eea',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 15px 40px rgba(0,0,0,0.3)',
              },
            }}
          >
            Sign In
          </Button>

          <Button
            size="lg"
            onClick={() => navigate('/signup')}
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 600,
              borderRadius: '12px',
              background:
                'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: '#fff',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 15px 40px rgba(245,87,108,0.4)',
              },
            }}
          >
            Get Started
          </Button>
        </Box>
      </Box>

      {/* Animations */}
      <style>
        {`
          @keyframes moveBg {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </Box>
  );
}