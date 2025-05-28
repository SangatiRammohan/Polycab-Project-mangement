import React, { useState } from 'react';

const AddUserForm = ({ onAddUser, onCancel }) => {
    const [fullname, setFullname] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === confirmPassword) {
            onAddUser({ fullname, phone, email, role, password });
            resetForm();
        } else {
            alert("Passwords do not match");
        }
    };

    const resetForm = () => {
        setFullname('');
        setPhone('');
        setEmail('');
        setRole('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="add-user-form">
            <h2>Add New User</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Full Name:</label>
                    <input
                        type="text"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Phone:</label>
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Role:</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
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
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Confirm Password:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Create User</button>
                <button type="button" onClick={onCancel}>Back</button>
            </form>
        </div>
    );
};

export default AddUserForm;