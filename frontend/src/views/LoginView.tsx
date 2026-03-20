import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../controllers/authController';
import './Login.css';

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

      // store token
      localStorage.setItem('token', data.token);

      alert('Login successful');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error', err);
      alert(err.response?.data?.message || err.message || 'Login failed');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h2>Sign In</h2>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <input name="email" placeholder="Email" onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
          <button type="submit" className="login-btn">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;