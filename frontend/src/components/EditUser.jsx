import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './EditUser.css';

const EditUser = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        email: '',
        role: '',
        password: '',
        confirm_password: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);
    const [passwordChange, setPasswordChange] = useState(false);

    useEffect(() => {
        fetchUser();
    }, [userId]);

    const fetchUser = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await fetch(`/api/users/${userId}/`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            
            const userData = await response.json();
            
            // Set form data without password fields
            setFormData({
                full_name: userData.full_name,
                phone: userData.phone,
                email: userData.email,
                role: userData.role,
                password: '',
                confirm_password: '',
            });
            
            setError(null);
        } catch (error) {
            console.error("Failed to fetch user:", error);
            setError(error.message || "Failed to load user data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Clear error when field is corrected
        if (formError && formError[name]) {
            setFormError({ ...formError, [name]: null });
        }
    };

    const togglePasswordFields = () => {
        setPasswordChange(!passwordChange);
        
        // Clear password fields when toggling
        if (!passwordChange) {
            setFormData({
                ...formData,
                password: '',
                confirm_password: '',
            });
        }
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.full_name.trim()) {
            errors.full_name = 'Full name is required';
        }
        
        if (!formData.phone.trim()) {
            errors.phone = 'Phone is required';
        } else if (!/^\d{10}$/.test(formData.phone.trim())) {
            errors.phone = 'Phone must be 10 digits';
        }
        
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email is invalid';
        }
        
        if (!formData.role) {
            errors.role = 'Role is required';
        }
        
        // Validate password fields only if password change is enabled
        if (passwordChange) {
            if (!formData.password) {
                errors.password = 'Password is required';
            } else if (formData.password.length < 8) {
                errors.password = 'Password must be at least 8 characters';
            }
            
            if (formData.password !== formData.confirm_password) {
                errors.confirm_password = 'Passwords do not match';
            }
        }
        
        return Object.keys(errors).length === 0 ? null : errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        const errors = validateForm();
        if (errors) {
            setFormError(errors);
            return;
        }
        
        setIsSubmitting(true);
        setFormError(null);
        
        try {
            const token = localStorage.getItem('token');
            
            // Create request payload
            const payload = {
                full_name: formData.full_name,
                phone: formData.phone,
                email: formData.email,
                role: formData.role,
            };
            
            // Only include password if password change is enabled
            if (passwordChange && formData.password) {
                payload.password = formData.password;
            }
            
            const response = await fetch(`/api/users/${userId}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to update user');
            }
            
            // Success!
            alert('User updated successfully!');
            navigate('/user-management');
        } catch (error) {
            console.error('Error updating user:', error);
            setFormError({ general: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="edit-user-container loading-container">
                <div className="loader"></div>
                <p>Loading user data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="edit-user-container">
                <div className="error-message">
                    <p>{error}</p>
                    <div className="error-actions">
                        <button onClick={fetchUser} className="retry-btn">Retry</button>
                        <Link to="/user-management" className="back-btn">Back to User Management</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="edit-user-container">
            <div className="edit-user-header">
                <h1>Edit User</h1>
                <Link to="/user-management" className="back-link">
                    Back to User Management
                </Link>
            </div>
            
            <div className="edit-user-form">
                {formError && formError.general && (
                    <div className="form-error general-error">
                        {formError.general}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="full_name">Full Name</label>
                        <input 
                            type="text" 
                            id="full_name"
                            name="full_name" 
                            value={formData.full_name}
                            onChange={handleChange} 
                            className={formError && formError.full_name ? 'error' : ''}
                        />
                        {formError && formError.full_name && (
                            <div className="field-error">{formError.full_name}</div>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="phone">Phone</label>
                        <input 
                            type="text" 
                            id="phone"
                            name="phone" 
                            value={formData.phone}
                            onChange={handleChange}
                            className={formError && formError.phone ? 'error' : ''}
                        />
                        {formError && formError.phone && (
                            <div className="field-error">{formError.phone}</div>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            type="email" 
                            id="email"
                            name="email" 
                            value={formData.email}
                            onChange={handleChange}
                            className={formError && formError.email ? 'error' : ''}
                        />
                        {formError && formError.email && (
                            <div className="field-error">{formError.email}</div>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="role">Role</label>
                        <select 
                            id="role"
                            name="role" 
                            value={formData.role}
                            onChange={handleChange}
                            className={formError && formError.role ? 'error' : ''}
                        >
                            <option value="">Select Role</option>
                            <option value="admin">Admin</option>
                            <option value="project_manager">Project Manager</option>
                            <option value="site_manager">Site Manager</option>
                            <option value="surveyor">Surveyor</option>
                            <option value="row_coordinator">ROW Coordinator</option>
                            <option value="quality_inspector">Quality Inspector</option>
                            <option value="user">User</option>
                            <option value="viewer">Viewer</option>
                        </select>
                        {formError && formError.role && (
                            <div className="field-error">{formError.role}</div>
                        )}
                    </div>
                    
                    <div className="password-toggle">
                        <label className="checkbox-container">
                            <input 
                                type="checkbox" 
                                checked={passwordChange} 
                                onChange={togglePasswordFields} 
                            />
                            <span className="checkmark"></span>
                            Change Password
                        </label>
                    </div>
                    
                    {passwordChange && (
                        <>
                            <div className="form-group">
                                <label htmlFor="password">New Password</label>
                                <input 
                                    type="password" 
                                    id="password"
                                    name="password" 
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={formError && formError.password ? 'error' : ''}
                                />
                                {formError && formError.password && (
                                    <div className="field-error">{formError.password}</div>
                                )}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="confirm_password">Confirm New Password</label>
                                <input 
                                    type="password" 
                                    id="confirm_password"
                                    name="confirm_password" 
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    className={formError && formError.confirm_password ? 'error' : ''}
                                />
                                {formError && formError.confirm_password && (
                                    <div className="field-error">{formError.confirm_password}</div>
                                )}
                            </div>
                        </>
                    )}
                    
                    <div className="form-actions">
                        <Link to="/user-management" className="cancel-btn">
                            Cancel
                        </Link>
                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUser;