import React, { useState } from 'react';
import { User, Lock, Shield, UserCheck } from 'lucide-react';
import './LoginForm.css';
import PasswordInput from './PasswordInput';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DEMO_CREDENTIALS = [
    {
        label:    'Admin Login',
        username: 'admin',
        password: 'Admin123!',
        icon:     <Shield size={15} />,
        color:    '#0a0a8f',
    },
    {
        label:    'User Login',
        username: 'rammohan',
        password: 'Rammohan@01',
        icon:     <UserCheck size={15} />,
        color:    '#28a745',
    },
];

const LoginForm = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const LOGIN_URL = `${import.meta.env.VITE_API_BASE_URL}/auth/login/`;

    const fillDemo = (cred) => {
        setUsername(cred.username);
        setPassword(cred.password);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await axios.post(
                LOGIN_URL,
                { username, password },
                { headers: { 'Content-Type': 'application/json' } }
            );
            const userData = response.data;
            if (userData?.token) {
                localStorage.setItem('authToken', userData.token);
                localStorage.setItem('userRole',  userData.role || 'user');
                localStorage.setItem('userName',  userData.username);
                localStorage.setItem('userId',    String(userData.id));
                onLogin(userData.role || 'user', String(userData.id), userData);
                if ((userData.role || 'user') === 'admin') {
                    navigate('/dashboard');
                } else {
                    navigate(`/user-dashboard/${userData.id}`);
                }
            } else {
                setError('Login failed. Invalid response from server.');
            }
        } catch (err) {
            if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else if (err.response?.status === 400 || err.response?.status === 401) {
                setError('Invalid username or password. Please try again.');
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">

                {/* Header */}
                <div className="login-header">
                    <h1 className="title">Polycab</h1>
                    <h2>Login</h2>
                </div>

                {/* Demo Credentials */}
                <div className="demo-credentials">
                    <p className="demo-title">Demo Credentials</p>
                    <div className="demo-list">
                        {DEMO_CREDENTIALS.map((cred) => (
                            <button
                                key={cred.label}
                                type="button"
                                className="demo-item"
                                onClick={() => fillDemo(cred)}
                                style={{ borderColor: cred.color }}
                            >
                                <span className="demo-item-label" style={{ color: cred.color }}>
                                    {cred.icon}
                                    {cred.label}
                                </span>
                                <span className="demo-item-creds">
                                    <span><User size={11} /> {cred.username}</span>
                                    <span><Lock size={11} /> {cred.password}</span>
                                </span>
                                <span className="demo-item-hint" style={{ color: cred.color }}>
                                    Click to fill
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error */}
                {error && <p className="error-message">{error}</p>}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Username */}
                    <div className="input-group">
                        <div className="icon-container">
                            <User size={20} />
                        </div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            autoComplete="username"
                            required
                        />
                    </div>

                    {/* Password with eye toggle */}
                    <div className="input-group">
                        <div className="icon-container">
                            <Lock size={20} />
                        </div>
                        <PasswordInput
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default LoginForm;