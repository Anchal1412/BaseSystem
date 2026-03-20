import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUsers } from '../controllers/authController';
import { User } from '../models/User';
import './Dashboard.css';
import { logout } from '../controllers/authController';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const data = await fetchUsers(token);
        setUsers(data);
      } catch (err: any) {
        // If unauthorized, redirect to login
        if (err.message?.toLowerCase().includes('unauthorized')) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        alert(err.message);
      }
    };

    loadUsers();
  }, [navigate]);

  const handleLogout = async () => {
  try {
    const token = localStorage.getItem('token') || '';

    await logout(token); // ⭐ backend call

    localStorage.removeItem('token');

    navigate('/');
  } catch (err: any) {
    alert(err.message);
  }
};
  const handleRefresh = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const data = await fetchUsers(token);
        setUsers(data);
        alert('Users refreshed successfully');
      } catch (err: any) {
        alert('Failed to refresh users');
      }
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Users Dashboard</h2>
          <div className="dashboard-actions">
            <button className="dashboard-btn btn-refresh" onClick={handleRefresh}>
              🔄 Refresh
            </button>
            <button className="dashboard-btn btn-logout" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="dashboard-empty">
            <p>No users found.</p>
          </div>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`status-badge ${user.status ? 'status-active' : 'status-inactive'}`}>
                        {user.status ? '✓ Active' : '✗ Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;