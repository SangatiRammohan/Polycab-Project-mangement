
import Cookies from 'js-cookie'; 
const BASE_URL = 'http://localhost:8000/api/v1/';
const TASKS_URL = `${BASE_URL}tasks/dashboard/task-summary/`;
const USERS_URL = `${BASE_URL}users/`;
const AUTH_URL = `${BASE_URL}auth/`;


export async function logout() {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${AUTH_URL}logout/`, {
        method: 'POST',
        headers: {
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
    });
    if (!response.ok) {
        throw new Error(`Logout failed: ${response.status}`);
    }
    localStorage.removeItem('authToken');
    return await response.json();
}

// Task-related API functions
export async function fetchTasks() {
    const response = await fetch(TASKS_URL, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status}`);
    }
    const data = await response.json();
    return data;
}



export async function AllTasks() {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${BASE_URL}tasks/alltasks/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status}`);
    }else {
        console.log('Tasks fetched successfully:', response.status);


    }
    const data = await response.json();
    console.log('Fetched tasks:', data);
    return data;
}

export async function addTask(task) {
    const csrfToken = Cookies.get('csrftoken');
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${BASE_URL}tasks/tasks/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
            'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(task),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`❌ Failed to create task: ${JSON.stringify(error)}`);
    }
    const taskData = await response.json();
    console.log('Task created successfully:', taskData);
    return taskData;
}


export async function editTask(taskId, updatedTask) {
    console.log(`Updating task ${taskId} with data:`, updatedTask);
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${BASE_URL}tasks/tasks/${taskId}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(updatedTask),
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

export async function deleteTask(taskId) {
    console.log(`Deleting task ${taskId}`);
    const csrfToken = Cookies.get('csrftoken');
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${BASE_URL}tasks/tasks/${taskId}/`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.status}`);
    }
    return true;
}

// User-related API functions
// New API functions for dashboard
export async function fetchUsers() {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    console.log('Token:', token);
    if (!token) {
        throw new Error('Authentication token is missing. Please log in.');
    }

    // Fetch users only if token is present
    const response = await fetch(`${USERS_URL}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Send token for authentication
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched users:', data);
    return data;
}



export async function fetchMilestoneProgress() {
    const response = await fetch(`${BASE_URL}dashboard/milestone-progress/`, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch milestone progress: ${response.status}`);
    }
    const data = await response.json();
    console.log('Fetched milestone progress:', data);
    return data;
}


// Constants (ensure these are correctly defined elsewhere in your application)


export async function addUser(user) {
    console.log('Adding user with data:', user);

    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Authentication token is missing. Please log in.');
    }
    
    console.log('Token:', token);


    try {
        // Add user via API
        const response = await fetch(`${USERS_URL}bulk-create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Send token for authentication
            },
            body: JSON.stringify([user]),
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Forbidden: You do not have permission to add users. Please ensure you are logged in as an admin.');
            }
            const errorData = await response.json();
            console.error('Error data:', errorData);
            throw new Error(`Failed to add user: ${JSON.stringify(errorData)}`);
        }

        // Successfully added user, now fetch updated list of users
        return await fetchUsers();  // Fetch and return updated list of users
    } catch (error) {
        console.error('Error in addUser:', error);
        throw error;
    }
}


export async function editUser(userId, updatedUser) {
    console.log(`Updating user ${userId} with data:`, updatedUser);
    const token = localStorage.getItem('authToken');

   
    const userPayload = {
        id: userId,
        ...updatedUser
    };

    // if (userPayload.role) {
    //     const validRoles = [
    //         'admin', 'project_manager', 'site_manager', 'surveyor',
    //         'row_coordinator', 'quality_inspector', 'user', 'viewer'
    //     ];

    //     if (!validRoles.includes(userPayload.role)) {
    //         throw new Error(`Invalid role: ${userPayload.role}. Must be one of: ${validRoles.join(', ')}`);
    //     }
    // }

    const response = await fetch(`${USERS_URL}bulk-update/`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify([userPayload]),  // must be a list of user updates
    });

    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = JSON.stringify(errorData);
        } catch (err) {
            errorMessage = `Status: ${response.status}`;
        }
        throw new Error(`Failed to update user: ${errorMessage}`);
    }

    return await response.json();
}

export async function deleteUser(userId) {
    console.log(`Deleting user ${userId}`);
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${USERS_URL}${userId}/`, {
        method: 'DELETE',
        headers: {
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
    });
    if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.status}`);
    }
    return true;
}

export async function getUsersByRole(role) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${USERS_URL}?role=${role}`, {
        headers: {
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch users by role: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Fetched users with role ${role}:`, data);
    return data;
}

export async function searchUsers(searchTerm) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${USERS_URL}?search=${encodeURIComponent(searchTerm)}`, {
        headers: {
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
    });
    if (!response.ok) {
        throw new Error(`Failed to search users: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Search results for "${searchTerm}":`, data);
    return data;
}

export async function getCurrentUser() {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${USERS_URL}current/`, {
        headers: {
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch current user: ${response.status}`);
    }
    const data = await response.json();
    console.log('Current user:', data);
    return data;
}

export async function bulkCreateUsers(users) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${USERS_URL}bulk-create/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(users),
    });
    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = JSON.stringify(errorData);
        } catch (err) {
            errorMessage = `Status: ${response.status}`;
        }
        throw new Error(`Failed to bulk create users: ${errorMessage}`);
    }
    return await response.json();
}

export async function bulkUpdateUsers(users) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${USERS_URL}bulk-update/`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(users),
    });
    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = JSON.stringify(errorData);
        } catch (err) {
            errorMessage = `Status: ${response.status}`;
        }
        throw new Error(`Failed to bulk update users: ${errorMessage}`);
    }
    return await response.json();
}

export async function bulkDeleteUsers(userIds) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${USERS_URL}bulk-delete/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ ids: userIds }),
    });
    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = JSON.stringify(errorData);
        } catch (err) {
            errorMessage = `Status: ${response.status}`;
        }
        throw new Error(`Failed to bulk delete users: ${errorMessage}`);
    }
    return await response.json();
}

// Password and authentication related functions
export async function changePassword(oldPassword, newPassword, confirmPassword) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${AUTH_URL}change-password/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
            old_password: oldPassword,
            new_password: newPassword,
            confirm_password: confirmPassword
        }),
    });
    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = JSON.stringify(errorData);
        } catch (err) {
            errorMessage = `Status: ${response.status}`;
        }
        throw new Error(`Failed to change password: ${errorMessage}`);
    }
    return await response.json();
}

export async function requestPasswordReset(email) {
    const response = await fetch(`${AUTH_URL}password-reset/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });
    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = JSON.stringify(errorData);
        } catch (err) {
            errorMessage = `Status: ${response.status}`;
        }
        throw new Error(`Failed to request password reset: ${errorMessage}`);
    }
    return await response.json();
}

export async function resetPassword(uidb64, token, newPassword, confirmPassword) {
    const response = await fetch(`${AUTH_URL}password-reset-confirm/${uidb64}/${token}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            new_password: newPassword,
            confirm_password: confirmPassword
        }),
    });
    if (!response.ok) {
        let errorMessage;
        try {
            const errorData = await response.json();
            errorMessage = JSON.stringify(errorData);
        } catch (err) {
            errorMessage = `Status: ${response.status}`;
        }
        throw new Error(`Failed to reset password: ${errorMessage}`);
    }
    return await response.json();
}

