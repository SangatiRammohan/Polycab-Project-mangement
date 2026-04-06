import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import UserManagement from './components/UserManagement';
import TaskManagement from './components/TaskManagement';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import UserDashboard from './components/UserDashboard';

const App = () => {
    const [userRole, setUserRole] = useState(null);
    const [userId,   setUserId]   = useState(null);

    // On page load, restore session from localStorage
    useEffect(() => {
        const token  = localStorage.getItem('authToken');
        const role   = localStorage.getItem('userRole');
        const uid    = localStorage.getItem('userId');
        if (token && role && uid) {
            setUserRole(role);
            setUserId(uid);
        }
    }, []);

    // Called by LoginForm after successful login
    const onLogin = (role, id) => {
        setUserRole(role);
        setUserId(id);
    };

    // Called by Navbar logout (admin) — UserDashboard handles its own logout
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');
        setUserRole(null);
        setUserId(null);
    };

    const isLoggedIn = userRole !== null;
    const isAdmin    = userRole === 'admin';

    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            {isLoggedIn && isAdmin && <Navbar isAdmin={isAdmin} onLogout={handleLogout} />}
            <div className="app-container">
                <Routes>
                    <Route
                        path="/"
                        element={
                            isLoggedIn
                                ? <Navigate to={isAdmin ? '/dashboard' : `/user-dashboard/${userId}`} />
                                : <LoginForm onLogin={onLogin} />
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