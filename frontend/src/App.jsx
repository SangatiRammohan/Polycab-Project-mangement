import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import UserManagement from './components/UserManagement';
import TaskManagement from './components/TaskManagement';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import UserDashboard from './components/UserDashboard';

const App = () => {
    const [userRole, setUserRole] = useState(null); // null, 'admin', or 'user'
    const [userId, setUserId] = useState(null);
    
    // Check for existing session on app load
    useEffect(() => {
        const checkLoggedInUser = () => {
            const userStr = sessionStorage.getItem('currentUser');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    setUserRole(user.role);
                    setUserId(user.id);
                } catch (error) {
                    console.error("Error parsing user data:", error);
                    sessionStorage.removeItem('currentUser');
                }
            }
        };
        
        checkLoggedInUser();
    }, []);
    
    const onLogin = (role, id, userData) => {
        setUserRole(role);
        setUserId(id);
        
        // Store user data in session storage for persistence
        const userToStore = {
            id: id,
            role: role,
            ...userData
        };
        
        sessionStorage.setItem('currentUser', JSON.stringify(userToStore));
    };
    
    const handleLogout = () => {
        setUserRole(null);
        setUserId(null);
        sessionStorage.removeItem('currentUser');
    };
    
    const isLoggedIn = userRole !== null;
    const isAdmin = userRole === 'admin';
    
    return (
        <Router>
            {isLoggedIn && <Navbar isAdmin={isAdmin} onLogout={handleLogout} />}
            <div className="app-container">
                <Routes>
                    <Route
                        path="/"
                        element={
                            isLoggedIn ? 
                                <Navigate to={isAdmin ? "/dashboard" : `/user-dashboard/${userId}`} /> : 
                                <LoginForm onLogin={onLogin} />
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={isAdmin ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/" />}
                    />
                    <Route
                        path="/user-dashboard/:id"
                        element={isLoggedIn ? <UserDashboard /> : <Navigate to="/" />}
                    />
                    <Route
                        path="/user-management"
                        element={isAdmin ? <UserManagement /> : <Navigate to="/" />}
                    />
                    <Route
                        path="/task-management"
                        element={isAdmin ? <TaskManagement /> : <Navigate to="/" />}
                    />
                    <Route
                        path="/login"
                        element={isLoggedIn ? <Navigate to="/" /> : <LoginForm onLogin={onLogin} />}
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;