// Reusable password input with show/hide toggle
// Usage:
//   <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
//   <PasswordInput id="edit_password" name="password" value={formData.password} onChange={handleChange} className={errors.password ? 'error' : ''} />

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './PasswordInput.css';

const PasswordInput = ({
    id,
    name,
    value,
    onChange,
    placeholder = 'Password',
    className = '',
    required = false,
    autoComplete = 'current-password',
}) => {
    const [show, setShow] = useState(false);

    return (
        <div className={`password-input-wrapper ${className}`}>
            <input
                type={show ? 'text' : 'password'}
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                autoComplete={autoComplete}
                className="password-input-field"
            />
            <button
                type="button"
                className="password-eye-btn"
                onClick={() => setShow(prev => !prev)}
                tabIndex={-1}
                title={show ? 'Hide password' : 'Show password'}
            >
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
        </div>
    );
};

export default PasswordInput;