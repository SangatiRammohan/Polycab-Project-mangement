import React, { useState, useEffect } from 'react';
import { AlertCircle, LogOut } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import './UserDashboard.css'

const UserDashboard = ({ onLogout }) => {
    const [userData, setUserData] = useState({
        username: localStorage.getItem('userName') || '',
        tasks: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate()

    // Define your base URL here or import it from a config file
    const BASE_URL = 'http://localhost:8000/api/v1/';

    // Status mapping for display
    const statusDisplay = {
        'nil': 'Nil',
        'in_progress': 'In Progress',
        'completed': 'Completed',
        'PENDING': 'Pending',
        'IN_PROGRESS': 'In Progress',
        'COMPLETED': 'Completed'
    };

    // Milestone mapping with backend values and display names
    const milestoneMapping = {
        'desktop_survey_design': 'Desktop Survey Design',
        'network_health_checkup': 'Network Health Checkup',
        'hoto_existing': 'HOTO-Existing',
        'detailed_design': 'Detailed Design',
        'row': 'ROW (Right of Way)',
        'ifc': 'IFC (Issued for Construction)',
        'ic': 'Initial Construction',
        'as_built': 'As-Built',
        'hoto_final': 'HOTO (Final)',
        'field_survey': 'Field Survey'
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'No deadline';
        return new Date(dateString).toLocaleDateString();
    };

    const getMilestoneName = (milestoneValue) => {
        return milestoneMapping[milestoneValue] || milestoneValue;
    };

    const fetchUserData = async () => {
        try {
            setIsLoading(true);
            
            // Get authentication token and user data
            const authToken = localStorage.getItem('authToken');
            const userId = localStorage.getItem('userId');
            const username = localStorage.getItem('userName');
            
            if (!authToken) {
                setError('Authentication required. Please log in again.');
                setIsLoading(false);
                return;
            }

            console.log('Auth token:', authToken);
            console.log('User ID:', userId);
            console.log('Username:', username);

            // Fetch tasks for the logged-in user
            const response = await fetch(`${BASE_URL}tasks/alltasks/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch tasks: ${response.status}`);
            }
            
            const allTasks = await response.json();
            console.log('All tasks fetched:', allTasks);
            
            // IMPROVED FILTERING LOGIC
            const userTasks = allTasks.filter(task => {
                // Extract assignedTo value, handling different possible property names
                const assigned = task.assignedTo || task.assigned_to || task.assigned_user;
                
                // Try to convert userId to number for comparison if it exists
                const numericUserId = userId ? parseInt(userId, 10) : null;
                
                // Case 1: assigned is an object with id or username properties
                if (typeof assigned === 'object' && assigned !== null) {
                    // Check if either id or username matches
                    return (
                        (numericUserId && assigned.id === numericUserId) ||
                        (assigned.id && assigned.id.toString() === userId) ||
                        (username && assigned.username && assigned.username.toLowerCase() === username.toLowerCase()) ||
                        (username && assigned.name && assigned.name.toLowerCase() === username.toLowerCase()) ||
                        (username && assigned.full_name && assigned.full_name.toLowerCase() === username.toLowerCase())
                    );
                }
                
                // Case 2: assigned is a numeric ID
                if (typeof assigned === 'number') {
                    return numericUserId === assigned || userId === assigned.toString();
                }
                
                // Case 3: assigned is a string (could be ID as string or username)
                if (typeof assigned === 'string') {
                    // Try to convert assigned to number if it looks like a numeric string
                    const assignedNumeric = !isNaN(assigned) ? parseInt(assigned, 10) : null;
                    
                    return (
                        (userId && assigned === userId) ||
                        (numericUserId && assignedNumeric === numericUserId) ||
                        (username && assigned.toLowerCase() === username.toLowerCase())
                    );
                }
                
                // Case 4: If the task has username property that matches
                if (task.username && username && 
                    task.username.toLowerCase() === username.toLowerCase()) {
                    return true;
                }
                
                // Case 5: If the task has user_id that matches
                if (task.user_id && userId) {
                    return task.user_id.toString() === userId.toString();
                }
                
                return false;
            });
            
            console.log('Filtered tasks for current user:', userTasks);
            
            // Format tasks for display
            const formattedTasks = userTasks.map(task => ({
                ...task,
                milestone_name: getMilestoneName(task.milestone),
                status_display: statusDisplay[task.status] || task.status,
                start_date_display: formatDate(task.start_date),
                end_date_display: formatDate(task.estimated_end_date || task.deadline)
            }));
            
            setUserData(prevState => ({
                ...prevState,
                tasks: formattedTasks
            }));
            
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError(err.message || 'Failed to fetch tasks');
            
            // Handle authentication errors
            if (err.response?.status === 401) {
                setError('Your session has expired. Please log in again.');
                if (onLogout) onLogout();
            }
        } finally {
            setIsLoading(false);
        }
    };


    async function handleUpdateTaskStatus(userId, newStatus) {
        console.log(`Updating task ${userId} with data:`, newStatus);
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${BASE_URL}tasks/tasks/${userId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: JSON.stringify({status:newStatus}),
        });
        if (!response.ok) {
            let errorMessage;
            try {
                const errorData = await response.json();
                errorMessage = JSON.stringify(errorData);
            } catch (err) {
                errorMessage = `Status: ${response.status}`;
            }
            throw new Error(`Failed to update task: ${errorMessage}`);
        }
        return await response.json();
    }
    

 const handleLogout = () => {
 if(   onLogout){
       onLogout();
 }
    navigate('/');
  };


    if (isLoading) {
        return <div className="loading">Loading your dashboard...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="header-content">
                    <div>
                        <h1>Welcome, {userData.username}</h1>
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
                    
                    {userData.tasks.length === 0 ? (
                        <div className="no-tasks">
                            You have no assigned tasks at the moment.
                        </div>
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
                                    {userData.tasks.map((task, index) => (
                                        <tr key={task.id} className={`status-${task.status?.toLowerCase() || 'pending'}`}>
                                            <td>{index + 1}</td>
                                            <td>{task.title}</td>
                                            <td>{task.subtasks || 'No subtasks'}</td>
                                            <td>{task.milestone_name || 'Not specified'}</td>
                                            <td>{task.state || 'Not specified'}</td>
                                            <td>{task.business_area || 'Not specified'}</td>
                                            <td>{task.district || 'Not specified'}</td>
                                            <td>{task.block || 'Not specified'}</td>
                                            <td>{task.start_date_display || 'Not set'}</td>
                                            <td>{task.end_date_display || 'Not set'}</td>
                                            <td className="task-status">
                                                <span className={`status-badge status-${task.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                                                    {task.status_display || statusDisplay[task.status] || task.status || 'PENDING'}
                                                </span>
                                            </td>
                                            <td>
                                                <select 
                                                    value={task.status || 'PENDING'}
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