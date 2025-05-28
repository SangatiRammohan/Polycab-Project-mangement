import React, { useState, useEffect } from 'react';
import { fetchTasks, fetchUsers, addTask, editTask, deleteTask ,AllTasks} from '../api/taskApi';
import './TaskManagement.css';
import locationData from './locationData'; // Import your location data

const TaskManagement = () => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    
    // Initialize newTask with proper structure matching backend expectations
    const [newTask, setNewTask] = useState({
        title: '',
        subtasks: '',
        milestone: '',
        assigned_to: '', // Changed from user_id to assigned_to
        state: '',
        business_area: '',
        district: '',
        block: '',
        start_date: '',
        estimated_end_date: '', // Changed from end_date to estimated_end_date
        status: 'nil',
    });

    // Create a separate state for the task being edited
    const [editingTask, setEditingTask] = useState({
        id: null,
        title: '',
        subtasks: '',
        milestone: '',
        assigned_to: '',
        state: '',
        business_area: '',
        district: '',
        block: '',
        start_date: '',
        estimated_end_date: '',
        status: 'nil',
    });

    // Milestone mapping with backend values
    const milestoneMapping = {
        'Desktop Survey Design': 'desktop_survey_design',
        'Network Health Checkup': 'network_health_checkup',
        'HOTO-Existing': 'hoto_existing',
        'Detailed Design': 'detailed_design',
        'ROW (Right of Way)': 'row',
        'IFC (Issued for Construction)': 'ifc',
        'IC (Initial Construction)': 'ic',
        'As-Built': 'as_built',
        'HOTO (Final)': 'hoto_final',
        'Field Survey': 'field_survey'
    };

    // Reverse mapping for displaying milestone names
    const reverseMilestoneMapping = Object.fromEntries(
        Object.entries(milestoneMapping).map(([key, value]) => [value, key])
    );

    // Status mapping for display
    const statusDisplay = {
        'nil': 'Nil',
        'in_progress': 'In Progress',
        'completed': 'Completed'
    };

    // Valid status options for backend
    const validStatusOptions = ['in_progress', 'completed', 'nil'];

    // Fetch both tasks and users whenever either might have changed
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                
                // Fetch tasks from Django API
                const fetchedTasks = await AllTasks();
                console.log('Fetched tasks:', fetchedTasks);
                // Format dates and map fields for display
                const formattedTasks = Array.isArray(fetchedTasks) ? fetchedTasks.map(task => ({
                    ...task,
                    // Map backend milestone value to display name if needed
                    milestone_name: getMilestoneName(task.milestone),
                    // Map status to display format
                    status_display: statusDisplay[task.status] || task.status,
                    // Format dates for display if needed
                    start_date_display: formatDate(task.start_date),
                    end_date_display: formatDate(task.estimated_end_date)
                })) : [];
                
                setTasks(formattedTasks);
                
                // Fetch users from Django API - this will include any newly created users
                const fetchedUsers = await fetchUsers();
                setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : []);
                
                // Set current user (this would typically come from auth context)
                // For demo purposes, assume the first user is logged in or use from session
                const loggedInUserId = sessionStorage.getItem('currentUserId');
                if (loggedInUserId && fetchedUsers) {
                    const loggedInUser = fetchedUsers.find(u => u.id === parseInt(loggedInUserId));
                    setCurrentUser(loggedInUser || (fetchedUsers.length > 0 ? fetchedUsers[0] : null));
                } else if (fetchedUsers && fetchedUsers.length > 0) {
                    setCurrentUser(fetchedUsers[0]);
                }
                
            } catch (err) {
                setError(err.message);
                console.error('Error loading initial data:', err);
            } finally {
                setLoading(false);
            }
        };
        
        loadInitialData();
        
    }, []);

    // Helper function to format dates
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString();
    };

    // Helper function for converting dates to YYYY-MM-DD format for input fields
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    // Helper function to get milestone display name
    const getMilestoneName = (milestoneValue) => {
        return reverseMilestoneMapping[milestoneValue] || milestoneValue;
    };

    // Get milestone backend value from display name
    const getMilestoneValue = (displayName) => {
        return milestoneMapping[displayName] || displayName;
    };

    // Get business areas based on selected state
    const getBusinessAreas = (state) => {
        if (!state || !locationData[state]) return [];
        return locationData[state]?.businessAreas || [];
    };

    // Get districts based on selected state and business area
    const getDistricts = (state, businessArea) => {
        if (!state || !businessArea) return [];
        const stateData = locationData[state];
        if (!stateData) return [];
        return stateData[businessArea]?.districts || [];
    };

    // Get blocks based on selected district
    const getBlocks = (state, businessArea, district) => {
        if (!state || !businessArea || !district) return [];
        const stateData = locationData[state];
        if (!stateData) return [];
        const businessAreaData = stateData[businessArea];
        if (!businessAreaData) return [];
        return businessAreaData[district] || [];
    };

    const handleNewTaskChange = (e) => {
        const { name, value } = e.target;
        
        // Create new task state with updated field
        const updatedTask = { ...newTask, [name]: value };
        
        // Handle cascading dropdown resets
        if (name === 'state') {
            updatedTask.business_area = '';
            updatedTask.district = '';
            updatedTask.block = '';
        } else if (name === 'business_area') {
            updatedTask.district = '';
            updatedTask.block = '';
        } else if (name === 'district') {
            updatedTask.block = '';
        }
        
        // Special handling for user selection
        else if (name === 'assignedTo') {
            const selectedUser = users.find(user => user.username === value || user.full_name === value);
            updatedTask.assigned_to = selectedUser ? selectedUser.id : '';
        }
        
        setNewTask(updatedTask);
    };

    const handleEditingTaskChange = (e) => {
        const { name, value } = e.target;
        
        // Create updated editing task state
        const updatedTask = { ...editingTask, [name]: value };
        
        // Handle cascading dropdown resets
        if (name === 'state') {
            updatedTask.business_area = '';
            updatedTask.district = '';
            updatedTask.block = '';
        } else if (name === 'business_area') {
            updatedTask.district = '';
            updatedTask.block = '';
        } else if (name === 'district') {
            updatedTask.block = '';
        }
        
        // Special handling for user selection
        else if (name === 'assignedTo') {
            const selectedUser = users.find(user => user.username === value || user.full_name === value);
            updatedTask.assigned_to = selectedUser ? selectedUser.id : '';
        }
        
        setEditingTask(updatedTask);
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        
        try {
            // Make sure we have a valid milestone value
            if (!newTask.milestone) {
                alert("Please select a milestone");
                return;
            }
            
            // Prepare task data for API (using field names consistent with backend)
            const taskData = {
                title: newTask.title,
                subtasks: newTask.subtasks || '',
                milestone: milestoneMapping[newTask.milestone], // Convert from display name to backend value
                assigned_to: newTask.assigned_to, // Already using correct field name
                state: newTask.state,
                business_area: newTask.business_area,
                district: newTask.district,
                block: newTask.block,
                start_date: newTask.start_date,
                estimated_end_date: newTask.estimated_end_date, // Using correct field name
                status: newTask.status || 'nil'
            };
            
            // Log the data being sent to help debug
            console.log('Sending task data:', [taskData]);
            
            // Send to API - Only call this once
            const response = await addTask(taskData);
            
            // Extract the task data from the response
            // The Django backend returns { message: "...", data: {...} }
            const addedTask = response.data || response;
            console.log('Task added:', [addedTask]);
            
            // Format the added task for display
            const formattedTask = {
                ...addedTask,
                milestone_name: getMilestoneName(addedTask.milestone),
                status_display: statusDisplay[addedTask.status] || addedTask.status,
                start_date_display: formatDate(addedTask.start_date),
                end_date_display: formatDate(addedTask.estimated_end_date)
            };
            
            console.log('Formatted task to add to state:', formattedTask);
            
            // Update local state with the newly added task
            setTasks(prevTasks => [...prevTasks, formattedTask]);
            
            // Reset form
            setNewTask({
                title: '',
                subtasks: '',
                milestone: '',
                assigned_to: '',
                state: '',
                business_area: '',
                district: '',
                block: '',
                start_date: '',
                estimated_end_date: '',
                status: 'nil',
            });
            
            // Close modal
            setShowAddModal(false);
            
            // Show success message
            alert('Task created successfully');
        } catch (err) {
            setError(err.message);
            console.error('Error adding task:', err);
            alert(`Failed to add task: ${err.message}`);
        }
    };

    // Handle opening edit modal and populating form with task data
    const handleOpenEditModal = (taskId) => {
        // Find the task to edit
        const taskToEdit = tasks.find(task => task.id === taskId);
        if (!taskToEdit) {
            alert('Task not found');
            return;
        }
        
        // Check if current user is assigned to the task
        if (currentUser && taskToEdit.assigned_to !== currentUser.id) {
            alert('You can only update tasks assigned to you.');
            return;
        }
        
        // Set the editing task with values from the selected task
        setEditingTask({
            id: taskToEdit.id,
            title: taskToEdit.title || '',
            subtasks: taskToEdit.subtasks || '',
            milestone: getMilestoneName(taskToEdit.milestone) || '',
            assigned_to: taskToEdit.assigned_to || '',
            state: taskToEdit.state || '',
            business_area: taskToEdit.business_area || '',
            district: taskToEdit.district || '',
            block: taskToEdit.block || '',
            start_date: formatDateForInput(taskToEdit.start_date) || '',
            estimated_end_date: formatDateForInput(taskToEdit.estimated_end_date) || '',
            status: taskToEdit.status || 'nil',
        });
        
        // Open the edit modal
        setShowEditModal(true);
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        
        try {
            // Make sure we have a valid task ID
            if (!editingTask.id) {
                alert("Invalid task ID");
                return;
            }
            
            // Prepare task data for API
            const taskData = {
                title: editingTask.title,
                subtasks: editingTask.subtasks || '',
                milestone: getMilestoneValue(editingTask.milestone), // Convert from display name to backend value
                assigned_to: editingTask.assigned_to,
                state: editingTask.state,
                business_area: editingTask.business_area,
                district: editingTask.district,
                block: editingTask.block,
                start_date: editingTask.start_date,
                estimated_end_date: editingTask.estimated_end_date,
                status: editingTask.status || 'nil'
            };
            
            // Send to API
            const response = await editTask(editingTask.id, taskData);
            
            // Extract the edited task data from the response
            const editedTask = response.data || response;
            
            // Format the edited task for display
            const formattedTask = {
                ...editedTask,
                milestone_name: getMilestoneName(editedTask.milestone),
                status_display: statusDisplay[editedTask.status] || editedTask.status,
                start_date_display: formatDate(editedTask.start_date),
                end_date_display: formatDate(editedTask.estimated_end_date)
            };
            
            // Update local state
            setTasks(prevTasks => prevTasks.map(task => 
                task.id === editingTask.id ? formattedTask : task
            ));
            
            // Close modal
            setShowEditModal(false);
            
            // Show success message
            alert('Task updated successfully');
        } catch (err) {
            setError(err.message);
            console.error('Error updating task:', err);
            alert(`Failed to update task: ${err.message}`);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await deleteTask(taskId);
                setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
            } catch (err) {
                setError(err.message);
                console.error('Error deleting task:', err);
                alert(`Failed to delete task: ${err.message}`);
            }
        }
    };

    const toggleAddModal = () => {
        setShowAddModal(!showAddModal);
        
        // Reset form when opening modal
        if (!showAddModal) {
            setNewTask({
                title: '',
                subtasks: '',
                milestone: '',
                assigned_to: '',
                state: '',
                business_area: '',
                district: '',
                block: '',
                start_date: '',
                estimated_end_date: '',
                status: 'nil',
            });
        }
    };

    const toggleEditModal = () => {
        setShowEditModal(!showEditModal);
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="task-management-container">
            <div className="header">
                <h1>Task Management</h1>
                <button className="btn btn-primary btn-add" onClick={toggleAddModal}>+Add Task</button>
            </div>

            <table className="task-table">
                <thead>
                    <tr>
                        <th>S. No.</th>
                        <th>Task Name</th>
                        <th>Subtasks</th>
                        <th>Milestone</th>
                        <th>Assign To</th>
                        <th>State</th>
                        <th>Business Area</th>
                        <th>District</th>
                        <th>Block</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.length === 0 ? (
                        <tr key="no-tasks">
                            <td colSpan="13" style={{ textAlign: 'center' }}>No tasks available</td>
                        </tr>
                    ) : (
                        tasks.map((task, index) => (
                            <tr key={task.id || `task-${index}`}>
                                <td>{index + 1}</td>
                                <td>{task.title}</td>
                                <td>{task.subtasks}</td>
                                <td>{task.milestone_name || getMilestoneName(task.milestone)}</td>
                                <td>{task.assigned_to_name || (
                                    users.find(u => u.id === task.assigned_to)?.username || 
                                    users.find(u => u.id === task.assigned_to)?.full_name || 'Unknown'
                                )}</td>
                                <td>{task.state}</td>
                                <td>{task.business_area}</td>
                                <td>{task.district}</td>
                                <td>{task.block}</td>
                                <td>{task.start_date_display || formatDate(task.start_date)}</td>
                                <td>{task.end_date_display || formatDate(task.estimated_end_date)}</td>
                                <td>
                                    <span className={`status-badge status-${task.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                                        {task.status_display || statusDisplay[task.status] || task.status}
                                    </span>
                                </td>
                                <td className="action-buttons">
                                    <button 
                                        className="btn btn-warning btn-sm"
                                        onClick={() => handleOpenEditModal(task.id)}
                                        disabled={currentUser && task.assigned_to !== currentUser.id}
                                        title={currentUser && task.assigned_to !== currentUser.id ? 
                                            "You can only update tasks assigned to you" : "Update task"}
                                    >
                                        Update
                                    </button>
                                    <button 
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDeleteTask(task.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Add Task Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button className="back-btn" onClick={toggleAddModal}>←</button>
                            <h2>Add New Task</h2>
                            <p style={{ color: 'blue', fontSize: '14px' }}>All fields are required to create a task</p>
                        </div>
                        
                        <form onSubmit={handleAddTask}>
                            <div className="form-group">
                                <div>
                                    <label>State</label>
                                    <select 
                                        className="form-control" 
                                        name="state" 
                                        value={newTask.state} 
                                        onChange={handleNewTaskChange}
                                        required
                                    >
                                        <option value="">Select State</option>
                                        {locationData.states && locationData.states.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label>Business Area</label>
                                    <select 
                                        className="form-control" 
                                        name="business_area" 
                                        value={newTask.business_area} 
                                        onChange={handleNewTaskChange}
                                        required
                                        disabled={!newTask.state}
                                    >
                                        <option value="">Select Business Area</option>
                                        {getBusinessAreas(newTask.state).map(area => (
                                            <option key={area} value={area}>{area}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label>District</label>
                                    <select 
                                        className="form-control" 
                                        name="district" 
                                        value={newTask.district} 
                                        onChange={handleNewTaskChange}
                                        required
                                        disabled={!newTask.business_area}
                                    >
                                        <option value="">Select District</option>
                                        {getDistricts(newTask.state, newTask.business_area).map(district => (
                                            <option key={district} value={district}>{district}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <div>
                                    <label>Block</label>
                                    <select 
                                        className="form-control" 
                                        name="block" 
                                        value={newTask.block} 
                                        onChange={handleNewTaskChange}
                                        required
                                        disabled={!newTask.district}
                                    >
                                        <option value="">Select Block</option>
                                        {getBlocks(newTask.state, newTask.business_area, newTask.district).map(block => (
                                            <option key={block} value={block}>{block}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label>Milestone</label>
                                    <select 
                                        className="form-control" 
                                        name="milestone" 
                                        value={newTask.milestone} 
                                        onChange={handleNewTaskChange}
                                        required
                                    >
                                        <option value="">Select Milestone</option>
                                        {Object.keys(milestoneMapping).map(milestone => (
                                            <option key={milestone} value={milestone}>{milestone}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label>Assign To</label>
                                    <select 
                                        className="form-control" 
                                        name="assignedTo" 
                                        value={newTask.assignedTo} 
                                        onChange={handleNewTaskChange}
                                        required
                                    >
                                        <option value="">Select User</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.username || user.full_name}>
                                                {user.full_name || user.username}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <div>
                                    <label>Task Name</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        name="title" 
                                        value={newTask.title} 
                                        onChange={handleNewTaskChange} 
                                        placeholder="Enter Task Name"
                                        required 
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <div>
                                    <label>Subtasks</label>
                                    <textarea 
                                        className="form-control textarea-control" 
                                        name="subtasks" 
                                        value={newTask.subtasks} 
                                        onChange={handleNewTaskChange} 
                                        placeholder="Enter Subtasks"
                                    ></textarea>
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <div>
                                    <label>Start Date</label>
                                    <input 
                                        type="date" 
                                        className="form-control" 
                                        name="start_date" 
                                        value={newTask.start_date} 
                                        onChange={handleNewTaskChange}
                                        required 
                                    />
                                </div>
                                
                                <div>
                                    <label>Estimated End Date</label>
                                    <input 
                                        type="date" 
                                        className="form-control" 
                                        name="estimated_end_date" 
                                        value={newTask.estimated_end_date} 
                                        onChange={handleNewTaskChange}
                                        required 
                                    />
                                </div>
                            </div>
                        
                            
                            <div className="modal-footer">
                                <button type="submit" className="btn btn-primary">Create Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Task Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button className="back-btn" onClick={toggleEditModal}>←</button>
                            <h2>Edit Task</h2>
                            <p style={{ color: 'blue', fontSize: '14px' }}>Update task details</p>
                        </div>
                        
                        <form onSubmit={handleUpdateTask}>
                            <div className="form-group">
                                <div>
                                    <label>State</label>
                                    <select 
                                        className="form-control" 
                                        name="state" 
                                        value={editingTask.state} 
                                        onChange={handleEditingTaskChange}
                                        required
                                    >
                                        <option value="">Select State</option>
                                        {locationData.states && locationData.states.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label>Business Area</label>
                                    <select 
                                        className="form-control" 
                                        name="business_area" 
                                        value={editingTask.business_area} 
                                        onChange={handleEditingTaskChange}
                                        required
                                        disabled={!editingTask.state}
                                    >
                                        <option value="">Select Business Area</option>
                                        {getBusinessAreas(editingTask.state).map(area => (
                                            <option key={area} value={area}>{area}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label>District</label>
                                    <select 
                                        className="form-control" 
                                        name="district" 
                                        value={editingTask.district} 
                                        onChange={handleEditingTaskChange}
                                        required
                                        disabled={!editingTask.business_area}
                                    >
                                        <option value="">Select District</option>
                                        {getDistricts(editingTask.state, editingTask.business_area).map(district => (
                                            <option key={district} value={district}>{district}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <div>
                                    <label>Block</label>
                                    <select 
                                        className="form-control" 
                                        name="block" 
                                        value={editingTask.block} 
                                        onChange={handleEditingTaskChange}
                                        required
                                        disabled={!editingTask.district}
                                    >
                                        <option value="">Select Block</option>
                                        {getBlocks(editingTask.state, editingTask.business_area, editingTask.district).map(block => (
                                            <option key={block} value={block}>{block}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label>Milestone</label>
                                    <select 
                                        className="form-control" 
                                        name="milestone" 
                                        value={editingTask.milestone} 
                                        onChange={handleEditingTaskChange}
                                        required
                                    >
                                        <option value="">Select Milestone</option>
                                        {Object.keys(milestoneMapping).map(milestone => (
                                            <option key={milestone} value={milestone}>{milestone}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label>Assign To</label>
                                    <select 
                                        className="form-control" 
                                        name="assignedTo" 
                                        value={editingTask.assignedTo} 
                                        onChange={handleEditingTaskChange}
                                        required
                                    >
                                        <option value="">Select User</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.username || user.full_name}>
                                                {user.full_name || user.username}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <div>
                                    <label>Task Name</label>
                                    <input 
                                         type="text" 
                                         className="form-control" 
                                         name="title" 
                                         value={editingTask.title} 
                                         onChange={handleEditingTaskChange} 
                                         placeholder="Enter Task Name"
                                         required 
                                     />
                                 </div>
                             </div>
                             
                             <div className="form-group">
                                 <div>
                                     <label>Subtasks</label>
                                     <textarea 
                                         className="form-control textarea-control" 
                                         name="subtasks" 
                                         value={editingTask.subtasks} 
                                         onChange={handleEditingTaskChange} 
                                         placeholder="Enter Subtasks"
                                     ></textarea>
                                 </div>
                             </div>
                             
                             <div className="form-group">
                                 <div>
                                     <label>Start Date</label>
                                     <input 
                                         type="date" 
                                         className="form-control" 
                                         name="start_date" 
                                         value={editingTask.start_date} 
                                         onChange={handleEditingTaskChange}
                                         required 
                                     />
                                 </div>
                                 
                                 <div>
                                     <label>Estimated End Date</label>
                                     <input 
                                         type="date" 
                                         className="form-control" 
                                         name="estimated_end_date" 
                                         value={editingTask.estimated_end_date} 
                                         onChange={handleEditingTaskChange}
                                         required 
                                     />
                                 </div>
                             </div>
                             
                             <div className="form-group">
                                 <div>
                                     <label>Status</label>
                                     <select
                                         className="form-control"
                                         name="status"
                                         value={editingTask.status}
                                         onChange={handleEditingTaskChange}
                                         required
                                     >
                                         <option value="in_progress">In Progress</option>
                                         <option value="completed">Completed</option>
                                         <option value="nil">Nil</option>
                                     </select>
                                 </div>
                             </div>
                             
                             <div className="modal-footer">
                                 <button type="submit" className="btn btn-primary">Update Task</button>
                             </div>
                         </form>
                     </div>
                 </div>
             )}
         </div>
     );
 };
 
 export default TaskManagement;
                                   