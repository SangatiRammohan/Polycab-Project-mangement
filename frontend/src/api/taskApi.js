import Cookies from 'js-cookie';

// All URLs come from .env — never hardcoded
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/`;
const USERS_URL = `${BASE_URL}users/`;
const AUTH_URL  = `${BASE_URL}auth/`;

// Single shared helper — always uses Token auth
const authHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Token ${token}` }),
    };
};

export async function logout() {
    const response = await fetch(`${AUTH_URL}logout/`, {
        method: 'POST',
        headers: authHeaders(),
    });
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    if (!response.ok) throw new Error(`Logout failed: ${response.status}`);
    return await response.json();
}

export async function fetchTasks() {
    const response = await fetch(`${BASE_URL}tasks/task-summary/`, {
        headers: authHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch tasks: ${response.status}`);
    return await response.json();
}

export async function AllTasks() {
    const response = await fetch(`${BASE_URL}tasks/alltasks/`, {
        method: 'GET',
        headers: authHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch tasks: ${response.status}`);
    return await response.json();
}

export async function addTask(task) {
    const response = await fetch(`${BASE_URL}tasks/tasks/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(task),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to create task: ${JSON.stringify(error)}`);
    }
    return await response.json();
}

export async function editTask(taskId, updatedTask) {
    const response = await fetch(`${BASE_URL}tasks/tasks/${taskId}/`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updatedTask),
    });
    if (!response.ok) {
        let msg;
        try { msg = JSON.stringify(await response.json()); }
        catch { msg = `Status: ${response.status}`; }
        throw new Error(`Failed to update task: ${msg}`);
    }
    return await response.json();
}

export async function deleteTask(taskId) {
    const response = await fetch(`${BASE_URL}tasks/tasks/${taskId}/`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to delete task: ${response.status}`);
    return true;
}

export async function fetchUsers() {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token is missing. Please log in.');
    const response = await fetch(`${USERS_URL}`, { headers: authHeaders() });
    if (!response.ok) throw new Error(`Failed to fetch users: ${response.status}`);
    return await response.json();
}

export async function fetchMilestoneProgress() {
    const response = await fetch(`${BASE_URL}tasks/milestone-progress/`, {
        headers: authHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch milestone progress: ${response.status}`);
    return await response.json();
}

export async function addUser(user) {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token is missing. Please log in.');
    const response = await fetch(`${USERS_URL}bulk-create/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify([user]),
    });
    if (!response.ok) {
        if (response.status === 403) throw new Error('Forbidden: Admin access required.');
        const errorData = await response.json();
        throw new Error(`Failed to add user: ${JSON.stringify(errorData)}`);
    }
    return await fetchUsers();
}

export async function editUser(userId, updatedUser) {
    const response = await fetch(`${USERS_URL}bulk-update/`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify([{ id: userId, ...updatedUser }]),
    });
    if (!response.ok) {
        let msg;
        try { msg = JSON.stringify(await response.json()); }
        catch { msg = `Status: ${response.status}`; }
        throw new Error(`Failed to update user: ${msg}`);
    }
    return await response.json();
}

export async function deleteUser(userId) {
    const response = await fetch(`${USERS_URL}${userId}/`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to delete user: ${response.status}`);
    return true;
}

export async function getUsersByRole(role) {
    const response = await fetch(`${USERS_URL}?role=${role}`, { headers: authHeaders() });
    if (!response.ok) throw new Error(`Failed to fetch users by role: ${response.status}`);
    return await response.json();
}

export async function searchUsers(searchTerm) {
    const response = await fetch(`${USERS_URL}?search=${encodeURIComponent(searchTerm)}`, {
        headers: authHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to search users: ${response.status}`);
    return await response.json();
}

export async function getCurrentUser() {
    const response = await fetch(`${USERS_URL}me/`, { headers: authHeaders() });
    if (!response.ok) throw new Error(`Failed to fetch current user: ${response.status}`);
    return await response.json();
}

export async function bulkCreateUsers(users) {
    const response = await fetch(`${USERS_URL}bulk-create/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(users),
    });
    if (!response.ok) {
        let msg;
        try { msg = JSON.stringify(await response.json()); }
        catch { msg = `Status: ${response.status}`; }
        throw new Error(`Failed to bulk create users: ${msg}`);
    }
    return await response.json();
}

export async function bulkUpdateUsers(users) {
    const response = await fetch(`${USERS_URL}bulk-update/`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(users),
    });
    if (!response.ok) {
        let msg;
        try { msg = JSON.stringify(await response.json()); }
        catch { msg = `Status: ${response.status}`; }
        throw new Error(`Failed to bulk update users: ${msg}`);
    }
    return await response.json();
}

export async function bulkDeleteUsers(userIds) {
    const response = await fetch(`${USERS_URL}bulk-delete/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ ids: userIds }),
    });
    if (!response.ok) {
        let msg;
        try { msg = JSON.stringify(await response.json()); }
        catch { msg = `Status: ${response.status}`; }
        throw new Error(`Failed to bulk delete users: ${msg}`);
    }
    return await response.json();
}

export async function changePassword(oldPassword, newPassword, confirmPassword) {
    const response = await fetch(`${AUTH_URL}password-change/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword, confirm_password: confirmPassword }),
    });
    if (!response.ok) {
        let msg;
        try { msg = JSON.stringify(await response.json()); }
        catch { msg = `Status: ${response.status}`; }
        throw new Error(`Failed to change password: ${msg}`);
    }
    return await response.json();
}

export async function requestPasswordReset(email) {
    const response = await fetch(`${AUTH_URL}password-reset/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    if (!response.ok) {
        let msg;
        try { msg = JSON.stringify(await response.json()); }
        catch { msg = `Status: ${response.status}`; }
        throw new Error(`Failed to request password reset: ${msg}`);
    }
    return await response.json();
}

export async function resetPassword(uidb64, token, newPassword, confirmPassword) {
    const response = await fetch(`${AUTH_URL}password-reset-confirm/${uidb64}/${token}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: newPassword, confirm_password: confirmPassword }),
    });
    if (!response.ok) {
        let msg;
        try { msg = JSON.stringify(await response.json()); }
        catch { msg = `Status: ${response.status}`; }
        throw new Error(`Failed to reset password: ${msg}`);
    }
    return await response.json();
}