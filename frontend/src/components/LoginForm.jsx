import React, { useState } from 'react';
import { User, Lock } from 'lucide-react';
import './LoginForm.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const response = await axios.post(
                'https://polycab-project-mangement.onrender.com/api/v1/auth/login/',
                {
                    username: username,
                    password: password,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true, // to send cookies for session auth
                }
            );
            
            const userData = response.data;
            
            if (userData?.token) {
                localStorage.setItem('authToken', userData.token);
                localStorage.setItem('userRole', userData.role || 'user');
                localStorage.setItem('userName', userData.username);
                localStorage.setItem('userId',userData.id)
                
                onLogin(userData.role || 'user');
                navigate('/dashboard');
            } else {
                setError('Login failed. Invalid response from server.');
            }
        } catch (err) {
            if (err.response?.data?.detail) {
                setError(err.response.data.detail);
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
                <div className="login-header">
                    <h1 className="title">Polycab</h1>
                    <h2>Login</h2>
                </div>
                
                {error && <p className="error-message">{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <div className="icon-container">
                            <User size={20} />
                        </div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            required
                        />
                    </div>
                    
                    <div className="input-group">
                        <div className="icon-container">
                            <Lock size={20} />
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
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
