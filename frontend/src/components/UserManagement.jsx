import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserManagement.css';
import './EditUser.css';
import { fetchUsers, addUser, editUser, deleteUser } from "../api/taskApi"; // API functions

// Add User Form Component
const AddUserForm = ({ onClose, onUserAdded, existingUsers }) => {
    const [formData, setFormData] = useState({
        username: '',
        full_name: '',
        email: '',
        phone: '',
        role: 'user', // Default role matching backend
        password: '',
        confirm_password: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Validate username
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (existingUsers && existingUsers.length > 0 && existingUsers.some(user => user.username === formData.username)) {
            newErrors.username = 'Username is already in use';
        }
        
        // Validate full name
        if (!formData.full_name.trim()) {
            newErrors.full_name = 'Full name is required';
        }
        
        // Validate email
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        } else if (existingUsers && existingUsers.length > 0 && existingUsers.some(user => user.email === formData.email)) {
            newErrors.email = 'Email is already in use';
        }
        
        // Validate phone (optional)
        if (formData.phone && !/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/[\s()-]/g, ''))) {
            newErrors.phone = 'Phone number is invalid';
        }
        
        // Validate password
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        
        // Validate confirm password(
        console.log(formData.confirm_password);
        console.log(formData.password);
        if (formData.password !== formData.confirm_password) {
            console.log('Passwords do not match');
            newErrors.confirm_password = 'Passwords do not match';
        }
        
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // Format data for API
            const userData = {
                username: formData.username,
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role,
                password: formData.password,
                confirm_password: formData.confirm_password
            };
            
            const newUser = await addUser(userData);
            onUserAdded(newUser);
        } catch (error) {
            console.error("Failed to add user:", error);
            
            // Handle API validation errors
            if (error.response && error.response.data) {
                const apiErrors = {};
                Object.entries(error.response.data).forEach(([key, value]) => {
                    apiErrors[key] = Array.isArray(value) ? value[0] : value;
                });
                setErrors(apiErrors);
            } else {
                setErrors({ general: `Failed to add user: ${error.message}` });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="user-form">
            <h2>Add New User</h2>
            {errors.general && <div className="error-message">{errors.general}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username*</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter username"
                        className={errors.username ? 'error' : ''}
                    />
                    {errors.username && <div className="error-text">{errors.username}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="full_name">Full Name*</label>
                    <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="Enter full name"
                        className={errors.full_name ? 'error' : ''}
                    />
                    {errors.full_name && <div className="error-text">{errors.full_name}</div>}
                </div>
                
                <div className="form-group">
                    <label htmlFor="email">Email Address*</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                        className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <div className="error-text">{errors.email}</div>}
                </div>
                
                <div className="form-group">
                     <label htmlFor="phone">Phone Number</label>
                     <input
                         type="tel"
                         id="phone"
                         name="phone"
                         value={formData.phone}
                         onChange={handleChange}
                         placeholder="Enter phone number"
                         className={errors.phone ? 'error' : ''}
                     />
                     {errors.phone && <div className="error-text">{errors.phone}</div>}
                 </div>
                
                <div className="form-group">
                    <label htmlFor="role">Role*</label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <option value="admin">Admin</option>
                        <option value="project_manager">Project Manager</option>
                        <option value="site_manager">Site Manager</option>
                        <option value="surveyor">Surveyor</option>
                        <option value="row_coordinator">ROW Coordinator</option>
                        <option value="quality_inspector">Quality Inspector</option>
                        <option value="user">User</option>
                        <option value="viewer">Viewer</option>
                    </select>
                    {errors.role && <div className="error-text">{errors.role}</div>}
                </div>
                
                <div className="form-group">
                    <label htmlFor="password">Password*</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        className={errors.password ? 'error' : ''}
                    />
                    {errors.password && <div className="error-text">{errors.password}</div>}
                </div>
                
                <div className="form-group">
                    <label htmlFor="confirm_password">Confirm Password*</label>
                    <input
                        type="password"
                        id="confirm_password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        placeholder="Confirm password"
                        className={errors.confirm_password ? 'error' : ''}
                    />
                    {errors.confirm_password && <div className="error-text">{errors.confirm_password}</div>}
                </div>
                
                <div className="form-actions">
                    <button type="button" onClick={onClose} className="cancel-btn">
                        Cancel
                    </button>
                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Adding...' : 'Add User'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// EditUserModal Component
const EditUserModal = ({ user, allUsers, onUserUpdated }) => {
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        full_name: '',
        email: '',
        phone: '',
        role: '',
        password: '',
        confirm_password: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user && showModal) {
            setFormData({
                username: user.username || '',
                full_name: user.full_name || '',
                email: user.email || '',
                phone: user.phone || '',
                role: user.role || 'user', // Match what the backend expects
                password: '',
                confirm_password: ''
            });
        }
    }, [user, showModal]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Validate full name
        if (!formData.full_name.trim()) {
            newErrors.full_name = 'Full name is required';
        }
        
        // Validate email
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        } else if (
            allUsers && allUsers.some(u => u.email === formData.email && u.id !== user.id)
        ) {
            newErrors.email = 'Email is already in use';
        }
        
        // Validate phone (optional)
        if (formData.phone && !/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/[\s()-]/g, ''))) {
            newErrors.phone = 'Phone number is invalid';
        }
        
        // Validate password - only if user is trying to change it
        if (formData.password) {
            if (formData.password.length < 8) {
                newErrors.password = 'Password must be at least 8 characters';
            }
            
            // Validate confirm password
            if (formData.password !== formData.confirm_password) {
                newErrors.confirm_password = 'Passwords do not match';
            }
        }
        
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // Format data for API - only include password if it's being changed
            const userData = {
                username: formData.username, // Include username field
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone,
                role: formData.role
            };
            
            if (formData.password) {
                userData.password = formData.password;
            }
            
            // Call the API function
            await editUser(user.id, userData);
            
            // Show success message
            alert('User updated successfully!');
            
            // Refresh user list
            onUserUpdated();
            setShowModal(false);
        } catch (error) {
            console.error("Failed to update user:", error);
            
            // Handle API validation errors
            if (error.response && error.response.data) {
                const apiErrors = {};
                Object.entries(error.response.data).forEach(([key, value]) => {
                    apiErrors[key] = Array.isArray(value) ? value[0] : value;
                });
                setErrors(apiErrors);
            } else {
                // Display general error to user
                setErrors({ general: error.message });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleModal = () => {
        setShowModal(!showModal);
        if (!showModal) {
            // Reset form when opening
            setErrors({});
        }
    };

    return (
        <>
            <button 
                onClick={toggleModal} 
                className="edit-btn"
                title="Edit User"
            >
                Update
            </button>
            
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>Edit User: {user.username}</h2>
                            <button onClick={toggleModal} className="close-btn">
                                &times;
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            {errors.general && <div className="error-message">{errors.general}</div>}
                            
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="edit_username">Username*</label>
                                    <input
                                        type="text"
                                        id="edit_username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="Enter username"
                                        className={errors.username ? 'error' : ''}
                                        disabled={true} // Username is typically not editable
                                    />
                                    {errors.username && <div className="error-text">{errors.username}</div>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="edit_full_name">Full Name*</label>
                                    <input
                                        type="text"
                                        id="edit_full_name"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        placeholder="Enter full name"
                                        className={errors.full_name ? 'error' : ''}
                                    />
                                    {errors.full_name && <div className="error-text">{errors.full_name}</div>}
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="edit_email">Email Address*</label>
                                    <input
                                        type="email"
                                        id="edit_email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter email address"
                                        className={errors.email ? 'error' : ''}
                                    />
                                    {errors.email && <div className="error-text">{errors.email}</div>}
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="edit_phone">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="edit_phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Enter phone number"
                                        className={errors.phone ? 'error' : ''}
                                    />
                                    {errors.phone && <div className="error-text">{errors.phone}</div>}
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="edit_role">Role*</label>
                                    <select
                                        id="edit_role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="project_manager">Project Manager</option>
                                        <option value="site_manager">Site Manager</option>
                                        <option value="surveyor">Surveyor</option>
                                        <option value="row_coordinator">ROW Coordinator</option>
                                        <option value="quality_inspector">Quality Inspector</option>
                                        <option value="user">User</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                    {errors.role && <div className="error-text">{errors.role}</div>}
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="edit_password">Change Password (optional)</label>
                                    <input
                                        type="password"
                                        id="edit_password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter new password"
                                        className={errors.password ? 'error' : ''}
                                    />
                                    {errors.password && <div className="error-text">{errors.password}</div>}
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="edit_confirm_password">Confirm New Password</label>
                                    <input
                                        type="password"
                                        id="edit_confirm_password"
                                        name="confirm_password"
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        placeholder="Confirm new password"
                                        className={errors.confirm_password ? 'error' : ''}
                                    />
                                    {errors.confirm_password && <div className="error-text">{errors.confirm_password}</div>}
                                </div>
                                
                                <div className="form-actions">
                                    <button type="button" onClick={toggleModal} className="cancel-btn">
                                        Cancel
                                    </button>
                                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                                        {isSubmitting ? 'Updating...' : 'Update User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const navigate = useNavigate();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const userData = await fetchUsers();
            console.log('Fetched users:', userData);
            setUsers(userData);
            setError(null);
        } catch (error) {
            console.error('Failed to load users:', error);
            setError(error.message);
            
            // Handle authentication errors
            if (error.message && error.message.includes('need to log in')) {
                // Redirect to login page
                navigate('/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(userId);
                // Refresh user list after deletion
                await loadUsers();
                alert('User deleted successfully');
            } catch (error) {
                console.error("Failed to delete user:", error);
                alert(`Failed to delete user: ${error.message}`);
            }
        }
    };

    const toggleAddUserForm = () => {
        setShowAddUserForm(!showAddUserForm);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };

    const handleUserAdded = async () => {
        // Refresh the users list after adding new user
        await loadUsers();
        // Close the form after successful addition
        setShowAddUserForm(false);
    };

    // Filter users based on search term
    const filteredUsers = users && users.length > 0 ? users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (user.full_name && user.full_name.toLowerCase().includes(searchLower)) ||
            (user.email && user.email.toLowerCase().includes(searchLower)) ||
            (user.role && user.role.toLowerCase().includes(searchLower)) ||
            (user.username && user.username.toLowerCase().includes(searchLower))
        );
    }) : [];

    // Pagination logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers && filteredUsers.length > 0 ? 
        filteredUsers.slice(indexOfFirstUser, indexOfLastUser) : [];
    const totalPages = Math.ceil((filteredUsers ? filteredUsers.length : 0) / usersPerPage);

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    return (
        <div className="user-management-container">
            <div className="user-management-header">
                <h1>User Management</h1>
                <div className="user-management-actions">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="search-input"
                        />
                    </div>
                    <button 
                        onClick={toggleAddUserForm} 
                        className="add-user-btn"
                    >
                        {showAddUserForm ? 'Cancel' : 'Add User'}
                    </button>
                </div>
            </div>

            {showAddUserForm && (
                <div className="add-user-form-container">
                    <AddUserForm 
                        onClose={toggleAddUserForm} 
                        onUserAdded={handleUserAdded} 
                        existingUsers={users}
                    />
                </div>
            )}

            {isLoading && (
                <div className="loading-container">
                    <div className="loader"></div>
                    <p>Loading users...</p>
                </div>
            )}

            {error && (
                <div className="error-message">
                    <p>Error: {error}</p>
                    <button onClick={loadUsers} className="retry-btn">Retry</button>
                </div>
            )}

            {!isLoading && !error && (!users || users.length === 0) && (
                <div className="no-users-container">
                    <p>No users found. Click 'Add User' to create your first user.</p>
                </div>
            )}

            {!isLoading && !error && users && users.length > 0 && (
                <>
                    <div className="table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Full Name</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers && currentUsers.length > 0 ? (
                                    currentUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.full_name || '-'}</td>
                                            <td>{user.phone || '-'}</td>
                                            <td>{user.email || '-'}</td>
                                            <td>
                                                {user.role && (
                                                    <span className={`role-badge ${(user.role || '').toLowerCase()}`}>
                                                        {(user.role || '').replace('_', ' ')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="action-buttons">
                                                <EditUserModal 
                                                    user={user} 
                                                    allUsers={users}
                                                    onUserUpdated={loadUsers}
                                                />
                                                <button 
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="delete-btn"
                                                    title="Delete User"
                                                >
                                                   Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="no-results">
                                            No users match your search criteria
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button 
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="pagination-btn"
                            >
                                &laquo; Prev
                            </button>
                            
                            <div className="pagination-info">
                                Page {currentPage} of {totalPages}
                            </div>
                            
                            <button 
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="pagination-btn"
                            >
                                Next &raquo;
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default UserManagement;