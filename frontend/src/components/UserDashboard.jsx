import React, { useState, useEffect } from 'react';
import { AlertCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';
import bannerImage from '../assets/banner.jpg';

// Read from .env — never hardcoded
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/`;

const statusDisplay = {
    'nil':         'Nil',
    'in_progress': 'In Progress',
    'completed':   'Completed',
};

const milestoneMapping = {
    'desktop_survey_design':  'Desktop Survey Design',
    'network_health_checkup': 'Network Health Checkup',
    'hoto_existing':          'HOTO-Existing',
    'detailed_design':        'Detailed Design',
    'row':                    'ROW (Right of Way)',
    'ifc':                    'IFC (Issued for Construction)',
    'ic':                     'Initial Construction',
    'as_built':               'As-Built',
    'hoto_final':             'HOTO (Final)',
    'field_survey':           'Field Survey',
};

const UserDashboard = () => {
    const [tasks, setTasks]         = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError]         = useState('');
    const navigate                  = useNavigate();

    const authToken = localStorage.getItem('authToken');
    const userId    = localStorage.getItem('userId');
    const username  = localStorage.getItem('userName');

    const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Token ${authToken}`,
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');
        navigate('/');
        window.location.reload();
    };

    useEffect(() => {
        if (!authToken) { navigate('/'); return; }
        fetchUserTasks();
    }, []);

    const fetchUserTasks = async () => {
        try {
            setIsLoading(true);
            setError('');
            const response = await fetch(`${BASE_URL}tasks/alltasks/`, {
                method: 'GET',
                headers: authHeaders,
            });
            if (response.status === 401) { handleLogout(); return; }
            if (!response.ok) throw new Error(`Failed to fetch tasks: ${response.status}`);

            const allTasks = await response.json();
            const numericUserId = parseInt(userId, 10);

            const userTasks = allTasks.filter(task => {
                const assigned = task.assigned_to;
                if (typeof assigned === 'object' && assigned !== null) return assigned.id === numericUserId;
                if (typeof assigned === 'number') return assigned === numericUserId;
                if (typeof assigned === 'string') return parseInt(assigned, 10) === numericUserId;
                return false;
            });

            setTasks(userTasks.map(task => ({
                ...task,
                milestone_name:     milestoneMapping[task.milestone] || task.milestone,
                status_display:     statusDisplay[task.status]       || task.status,
                start_date_display: formatDate(task.start_date),
                end_date_display:   formatDate(task.estimated_end_date),
            })));

        } catch (err) {
            setError(err.message || 'Failed to fetch tasks');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateTaskStatus = async (taskId, newStatus) => {
        try {
            const response = await fetch(`${BASE_URL}tasks/tasks/${taskId}/`, {
                method: 'PATCH',
                headers: authHeaders,
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) throw new Error(JSON.stringify(await response.json()));
            setTasks(prev => prev.map(t =>
                t.id === taskId
                    ? { ...t, status: newStatus, status_display: statusDisplay[newStatus] || newStatus }
                    : t
            ));
        } catch (err) {
            setError('Failed to update task status. Please try again.');
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString() : 'No deadline';

    if (isLoading) return <div className="loading">Loading your dashboard...</div>;

    return (
        <div className="dashboard-container">

            {/* Banner */}
            <div className="dashboard-banner">
                <img src={bannerImage} alt="Polycab Banner" className="banner-image" />
            </div>

            {/* Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <div>
                        <h1>Welcome, {username}</h1>
                        <p>Your Tasks Dashboard</p>
                    </div>
                    <button onClick={handleLogout} className="logout-button">
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            <div className="dashboard-content">
                <div className="task-section">
                    <h2>Your Assigned Tasks</h2>
                    {tasks.length === 0 ? (
                        <div className="no-tasks">You have no assigned tasks at the moment.</div>
                    ) : (
                        <div className="task-table-container">
                            <table className="task-table">
                                <thead>
                                    <tr>
                                        <th>S.No</th>
                                        <th>Task Name</th>
                                        <th>Subtasks</th>
                                        <th>Milestone</th>
                                        <th>State</th>
                                        <th>Business Area</th>
                                        <th>District</th>
                                        <th>Block</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tasks.map((task, index) => (
                                        <tr key={task.id} className={`status-${task.status || 'nil'}`}>
                                            <td>{index + 1}</td>
                                            <td>{task.title}</td>
                                            <td>{task.subtasks        || 'No subtasks'}</td>
                                            <td>{task.milestone_name  || 'Not specified'}</td>
                                            <td>{task.state           || 'Not specified'}</td>
                                            <td>{task.business_area   || 'Not specified'}</td>
                                            <td>{task.district        || 'Not specified'}</td>
                                            <td>{task.block           || 'Not specified'}</td>
                                            <td>{task.start_date_display}</td>
                                            <td>{task.end_date_display}</td>
                                            <td className="task-status">
                                                <span className={`status-badge status-${task.status}`}>
                                                    {task.status_display}
                                                </span>
                                            </td>
                                            <td>
                                                <select
                                                    value={task.status || 'nil'}
                                                    onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                                                    className="status-select"
                                                >
                                                    <option value="nil">Nil</option>
                                                    <option value="in_progress">In Progress</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;