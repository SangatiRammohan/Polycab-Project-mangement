# Polycab Project Management System

---

## Why I Built This

This project holds a very personal story behind it.

In early 2026, I appeared for a technical interview at a company working on infrastructure and field project management solutions for clients like Polycab. As part of their interview process, the team gave me a real-world assignment — build a full-stack project management system that could handle task tracking, user management, location-based filtering, and role-based dashboards, similar to what their own teams use internally.

I gave everything I had to this project. I worked through every requirement they described — building the Django REST API from scratch, designing the role-based authentication system, creating the admin and user dashboards, implementing cascading location dropdowns for Bihar's geography, and making the entire application responsive for mobile field workers. I put in long hours learning the technologies I hadn't used before, debugging deployment issues, and refining the UI to match professional standards.

**Unfortunately, I did not clear the interview.** The result was disappointing, and it was a tough moment for me personally. But rather than letting the effort go to waste, I decided to complete the project fully — not just to the level required for the assignment, but to a standard I could be genuinely proud of. I fixed every bug, improved the UI, added proper environment configuration, switched to a production database, and deployed it live on the internet.

This project represents more than just code. It represents persistence, the willingness to learn from failure, and the commitment to see something through even when the original goal didn't work out. I am sharing it publicly so that others can see what I built, learn from it, and so that future opportunities can judge my work for themselves.

---

## About the Project

A full-stack web application built for **Polycab** to manage field projects, track task progress across multiple milestones, and coordinate teams working across different states, districts, and blocks in Bihar. The system provides role-based access for administrators and field workers, enabling efficient project tracking and real-time status updates.

---

## What This Project Does

The Polycab Project Management System is designed to track and manage large-scale infrastructure projects across geographical regions. Administrators can create and assign tasks to field workers, monitor progress through an interactive dashboard, and manage the entire team from a central interface. Field workers log in to view their assigned tasks and update the status of their work in real time.

The application supports a full project lifecycle — from initial desktop surveys and network health checkups, through detailed design and right-of-way coordination, all the way to final handover and as-built documentation.

---

## Tech Stack

### Backend
- **Django 4.2** — Python web framework handling all business logic, authentication, and API endpoints
- **Django REST Framework** — Provides a powerful and flexible RESTful API layer
- **Token Authentication** — Secure stateless authentication using DRF's built-in token system
- **PostgreSQL** — Production database hosted on Render, providing robust relational data storage
- **MySQL** — Used for local development
- **django-cors-headers** — Handles Cross-Origin Resource Sharing between the frontend and backend
- **Gunicorn** — Production WSGI server for serving the Django application on Render
- **python-dotenv** — Manages environment variables for both local and production environments
- **dj-database-url** — Parses the database URL for seamless PostgreSQL integration on Render

### Frontend
- **React 18** — JavaScript library for building the user interface
- **Vite** — Fast build tool and development server
- **React Router v6** — Client-side routing for navigation between pages
- **Axios** — HTTP client for API communication
- **Lucide React** — Icon library used throughout the interface
- **Chart.js / React-Chartjs-2** — Powers the work progress timeline graph
- **js-cookie** — Cookie management for CSRF token handling

### Deployment
- **Vercel** — Hosts the React frontend with automatic GitHub deployments
- **Render** — Hosts the Django backend as a Python web service
- **Render PostgreSQL** — Cloud database for production data

---

## How It Works

### Authentication Flow
When a user visits the application, they are presented with a login page that includes demo credentials for quick access. Upon submitting credentials, the frontend sends a POST request to the backend's login endpoint. The backend validates the username and password, and if correct, returns an authentication token along with the user's role and profile information. This token is stored in the browser's local storage and sent with every subsequent API request as a Token header. Based on the role returned — admin or regular user — the application redirects to the appropriate dashboard.

### Role-Based Access
The system supports multiple user roles including Admin, Project Manager, Site Manager, Surveyor, ROW Coordinator, Quality Inspector, User, and Viewer. Admins have full access to all parts of the system including user management, task management, and the analytics dashboard. Regular users can only see and update their own assigned tasks through a personal dashboard.

### Admin Dashboard
The admin dashboard provides a high-level overview of all project tasks across all milestones and locations. Tasks are grouped by milestone type and displayed as project cards showing counts of nil, in-progress, and completed tasks. A location filter allows admins to drill down by state, business area, district, and block. A timeline graph visualises task progress over time with colour coding for different statuses.

### Task Management
Admins can create tasks by specifying all relevant details including the task title, subtasks, milestone category, assigned team member, location hierarchy (state, business area, district, block), start and end dates, and initial status. Tasks can be edited or deleted at any time. The system supports ten milestone types covering the full project lifecycle from desktop survey design through to final handover.

### User Dashboard
Field workers log in to see only their assigned tasks in a clean table view. They can update the status of each task between Nil, In Progress, and Completed using a dropdown selector. Changes are saved immediately to the database via a PATCH request to the backend API. The dashboard shows the banner image at the top and a logout button that clears all stored credentials.

### User Management
Admins can add new users to the system by filling in a form with the user's name, email, phone number, role, and password. Users can be edited to update any of their details or change their password. Bulk operations are supported for creating, updating, and deleting multiple users at once. The user list is paginated and searchable by name, email, username, or role.

### Location Hierarchy
The system is built around a four-level location hierarchy specific to Bihar — State, Business Area, District, and Block. All task forms use cascading dropdowns where selecting a state populates the business area options, selecting a business area populates the districts, and selecting a district populates the available blocks. This ensures data consistency and accurate geographical tracking.

---

## Project Milestones Tracked

The system tracks ten distinct project milestones that represent the phases of infrastructure deployment. Desktop Survey Design covers the initial planning and mapping phase. Network Health Checkup assesses the current state of existing infrastructure. HOTO Existing handles the handover of existing assets. Detailed Design covers the engineering design phase. ROW manages Right of Way clearances. IFC tracks Issued for Construction approvals. IC monitors Initial Construction progress. As-Built documents the completed construction as it was actually built. HOTO Final is the final handover to the client. Field Survey covers physical ground surveys.

---

## Responsive Design

The application is fully responsive across all device sizes. On laptops and desktops, data is displayed in full tables with all columns visible. On tablets and mobile phones, the same data switches to a card-based layout where each record is shown as a compact card with rows of label-value pairs. This ensures the application is fully usable by field workers accessing it from mobile devices in the field.

---

## Security

All API endpoints except the login endpoint require a valid authentication token. Passwords are hashed using Django's built-in password hashing system and are never stored in plain text. Environment variables are used to manage all sensitive configuration including the secret key, database credentials, and CORS origins — none of these values are committed to version control. The CORS configuration restricts API access to only the authorised frontend domain.

---

## Local Development Setup

### Prerequisites
- Python 3.11 or higher
- Node.js 18 or higher
- MySQL running locally

### Backend
Navigate to the backend directory, create and activate a Python virtual environment, install all dependencies from the requirements file, configure your local environment variables in a `.env` file, run database migrations, and start the Django development server.

### Frontend
Navigate to the frontend directory, install Node dependencies, configure your local environment variables in a `.env` file pointing to your local backend, and start the Vite development server.

---

## Production Deployment

The backend is deployed on Render as a Python web service. On every push to the main branch, Render automatically pulls the latest code, installs dependencies, runs database migrations, collects static files, and restarts the Gunicorn server. The PostgreSQL database is hosted as a managed Render database service.

The frontend is deployed on Vercel. On every push to the main branch, Vercel automatically builds the React application using Vite and deploys the static output globally via their CDN. The frontend communicates with the Render backend via the public API URL configured as an environment variable at build time.

---

## Live Demo

| | Link |
|---|---|
| **Frontend (Live App)** | https://polycab-project-mangement.vercel.app |
| **Backend API** | https://polycab-project-mangement.onrender.com/api/v1/ |
| **Django Admin Panel** | https://polycab-project-mangement.onrender.com/admin/ |

### Demo Credentials

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `Admin123!` |
| User | `rammohan` | `Rammohan@01` |

> Note: The backend is hosted on Render's free tier. If the app takes 30-60 seconds to respond on the first request, this is normal — the server wakes up from sleep after a period of inactivity. Please wait a moment and try again.

---

## License

This project is licensed under the MIT License.