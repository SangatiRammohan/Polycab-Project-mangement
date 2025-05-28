# Django-React-Vite Application

This project is a web application built using Django for the backend and React with Vite for the frontend. The application features an admin dashboard with user and task management functionalities, along with a login system.

## Project Structure

```
django-react-vite-app
├── backend
│   ├── manage.py
│   ├── db.sqlite3
│   ├── requirements.txt
│   ├── backend
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── users
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── tasks
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   └── static
│       └── banner.jpg
├── frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── src
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── components
│   │   │   ├── LoginForm.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── UserManagement.jsx
│   │   │   ├── TaskManagement.jsx
│   │   │   ├── AddUserForm.jsx
│   │   │   ├── AddTaskForm.jsx
│   │   │   ├── FilterComponent.jsx
│   │   │   ├── Cards.jsx
│   │   │   └── WorkProgressGraph.jsx
│   │   ├── assets
│   │   │   └── banner.jpg
│   │   └── styles
│       │   └── styles.css
└── README.md
```

## Backend

- **Django Framework**: The backend is built using Django, a high-level Python web framework that encourages rapid development and clean, pragmatic design.
- **Database**: SQLite is used as the database for simplicity and ease of use during development.
- **User Management**: Admins can manage users, including adding, editing, and deleting user accounts.
- **Task Management**: Admins can manage tasks assigned to users, including adding, editing, and deleting tasks.

## Frontend

- **React with Vite**: The frontend is built using React, a JavaScript library for building user interfaces, and Vite, a fast build tool that provides a smooth development experience.
- **Login System**: A login form is provided for user authentication. Admins can log in with the credentials `username: admin` and `password: admin`.
- **Dashboard**: After logging in, the admin is presented with a dashboard that includes a banner image, a navigation bar, and various management components.
- **Responsive Design**: The application is designed to be responsive and user-friendly.

## Getting Started

### Prerequisites

- Python 3.x
- Node.js and npm

### Backend Setup

1. Navigate to the `backend` directory.
2. Install the required packages:
   ```
   pip install -r requirements.txt
   ```
3. Run the Django server:
   ```
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the `frontend` directory.
2. Install the required packages:
   ```
   npm install
   ```
3. Start the Vite development server:
   ```
   npm run dev
   ```

## Usage

- Access the application at `http://localhost:3000` for the frontend.
- Use the admin credentials to log in and access the dashboard.

## License

This project is licensed under the MIT License.