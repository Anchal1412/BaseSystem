import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      //  dashboard redirect
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="home-page">
      <div className="home-container">
        <h1>Welcome to BaseSystem</h1>
        <p>A modern authentication system built with React and NestJS</p>
        <div className="home-buttons">
          <Link to="/login" className="home-btn home-btn-signin">
            Sign In
          </Link>
          <Link to="/signup" className="home-btn home-btn-signup">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}