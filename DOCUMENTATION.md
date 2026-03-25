# UDMS Frontend Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Available Scripts](#available-scripts)
6. [Project Architecture](#project-architecture)
7. [Key Features](#key-features)
8. [Components](#components)
9. [Pages](#pages)
10. [Services](#services)
11. [Routes](#routes)
12. [Authentication Flow](#authentication-flow)
13. [Best Practices](#best-practices)
14. [Troubleshooting](#troubleshooting)

---

## Project Overview

**UDMS Frontend** (University Data Management System) is a React-based web application designed to manage university operations including user management, course administration, attendance tracking, and notice distribution across different user roles (Students, Teachers, and Admins).

### Key Objectives
- Provide a centralized platform for university data management
- Support role-based access control (Students, Teachers, Admins)
- Enable efficient course and enrollment management
- Track student attendance
- Facilitate communication through notices
- Maintain user profiles and authentication

---

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | ^19.2.4 | UI library |
| React Router DOM | ^6.30.3 | Client-side routing |
| Vite | ^8.0.0 | Build tool and dev server |
| Tailwind CSS | ^3.4.19 | Utility-first CSS framework |
| Lucide React | ^1.7.0 | Icon library |
| ESLint | ^9.39.4 | Code linting |
| PostCSS | ^8.5.8 | CSS transformation |
| Autoprefixer | ^10.4.27 | CSS vendor prefixes |

**Node Version:** >= 14.0.0

---

## Project Structure

```
udmp/
├── public/                      # Static assets
├── src/
│   ├── assets/                 # Images, fonts, and media files
│   ├── components/             # Reusable React components
│   │   ├── LoginFrom.jsx      # Login form component
│   │   ├── Navbar.jsx         # Navigation bar
│   │   ├── Toast.jsx          # Toast notification component
│   │   └── UserCard.jsx       # User profile card component
│   ├── pages/                  # Page components
│   │   ├── AccessDenied.jsx   # 403 error page
│   │   ├── Admin.jsx          # Admin management page
│   │   ├── AttendanceDashboard.jsx # Attendance overview
│   │   ├── Course.jsx         # Course management
│   │   ├── Dashboard.jsx      # Main dashboard
│   │   ├── Home.jsx           # Home page
│   │   ├── Login.jsx          # Login page
│   │   ├── Logout.jsx         # Logout handler
│   │   ├── MarkAttendance.jsx # Attendance marking
│   │   ├── NotFound.jsx       # 404 error page
│   │   ├── Notice.jsx         # Notice management
│   │   ├── Register.jsx       # User registration
│   │   ├── Semester.jsx       # Semester management
│   │   ├── Student.jsx        # Student management
│   │   ├── StudentEnrolled.jsx # Enrolled students view
│   │   ├── Teacher.jsx        # Teacher management
│   │   ├── Users.jsx          # General user management
│   │   ├── profile/           # User profile editing
│   │   │   ├── admin/         # Admin profile edit
│   │   │   ├── student/       # Student profile edit
│   │   │   └── teacher/       # Teacher profile edit
│   │   └── profileView/       # User profile viewing
│   │       ├── admin/         # Admin profile view
│   │       ├── student/       # Student profile view
│   │       └── teacher/       # Teacher profile view
│   ├── routes/
│   │   └── AppRoutes.jsx      # Route definitions
│   ├── services/              # API and utility services
│   │   ├── api.js            # API request handler with auth
│   │   ├── authService.js    # Authentication logic
│   │   └── tokenService.js   # JWT token management
│   ├── layouts/              # Layout components (if used)
│   ├── App.jsx              # Root component
│   ├── main.jsx             # Entry point
│   ├── App.css              # App-level styles
│   └── index.css            # Global styles
├── eslint.config.js         # ESLint configuration
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── package.json             # Project metadata and dependencies
├── index.html              # HTML template
└── README.md               # Project README
```

---

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/shehab097/react-udms-frontend.git
   cd udmp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (if needed)
   Create a `.env` file in the root directory with your API endpoint:
   ```
   VITE_API_URL=http://your-api-endpoint
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

---

## Available Scripts

### Development
```bash
npm run dev
```
Starts the Vite development server with hot module replacement (HMR) for instant code updates.

### Build
```bash
npm run build
```
Creates a production-ready build in the `dist/` directory optimized for deployment.

### Preview
```bash
npm run preview
```
Preview the production build locally before deployment.

### Linting
```bash
npm run lint
```
Runs ESLint to check code quality and adherence to style guidelines.

---

## Project Architecture

### Component Hierarchy
```
App (AppRoutes)
  ├── Login
  ├── Register
  ├── Logout
  ├── Home
  │   ├── Navbar
  │   └── MainContent
  ├── Dashboard
  │   ├── Navbar
  │   └── AdminPanel/StudentPanel/TeacherPanel
  ├── Users
  ├── Teacher
  ├── Student
  ├── Admin
  ├── Course
  ├── Notice
  ├── StudentEnrolled
  ├── AttendanceDashboard
  ├── MarkAttendance
  ├── Profile Pages (Edit)
  ├── ProfileView Pages (View)
  ├── AccessDenied
  └── NotFound
```

### Data Flow
```
User Action
    ↓
Components (React)
    ↓
Services (API Calls)
    ↓
Backend API
    ↓
Database
    ↓
Response Flow Back to UI
```

---

## Key Features

### 1. **Authentication & Authorization**
   - JWT-based token authentication
   - User login, registration, and logout
   - Role-based access control (RBAC)
   - Protected routes with authentication

### 2. **User Management**
   - User creation and management
   - Role assignment (Student, Teacher, Admin)
   - User profile management
   - Profile viewing capabilities

### 3. **Course Management**
   - Course creation and administration
   - Course enrollment tracking
   - Semester management

### 4. **Attendance Tracking**
   - Attendance dashboard for overview
   - Mark attendance functionality
   - Attendance history and reports

### 5. **Communication**
   - Notice/announcement system
   - System-wide notifications
   - Toast notifications for user feedback

### 6. **Role-Based Pages**
   - **Admin Panel:** Manage users, courses, attendance, notices
   - **Teacher Dashboard:** View students, mark attendance, manage courses
   - **Student Dashboard:** View courses, check attendance, view notices

---

## Components

### LoginFrom.jsx
**Purpose:** Reusable login form component
**Props:** Depends on parent implementation
**Features:**
- Form validation
- Error handling
- Submit handling for authentication

### Navbar.jsx
**Purpose:** Navigation header displayed across pages
**Features:**
- Links to different sections
- User menu
- Responsive design
- Role-based menu items

### Toast.jsx
**Purpose:** Toast notification display
**Features:**
- Success, error, info, warning notifications
- Auto-dismiss functionality
- Customizable duration and messages

### UserCard.jsx
**Purpose:** Display user information in card format
**Features:**
- User avatar/profile picture
- User details (name, role, email, etc.)
- Interactive elements (edit, view profile, etc.)

---

## Pages

### Authentication Pages
- **Login.jsx:** User login interface
- **Register.jsx:** New user registration
- **Logout.jsx:** Logout handler and redirect

### Dashboard Pages
- **Dashboard.jsx:** Main dashboard (role-specific content)
- **Home.jsx:** Welcome/home page

### Management Pages
- **Users.jsx:** Global user management
- **Admin.jsx:** Admin user management
- **Teacher.jsx:** Teacher user management
- **Student.jsx:** Student user management
- **Course.jsx:** Course management interface
- **Notice.jsx:** Notice/announcement management
- **StudentEnrolled.jsx:** View enrolled students
- **Semester.jsx:** Semester management

### Attendance Pages
- **AttendanceDashboard.jsx:** Attendance overview and statistics
- **MarkAttendance.jsx:** Interface to mark student attendance

### Profile Pages
- **profile/[role]/[username].jsx:** User profile editing pages
- **profileView/[role]/[username].jsx:** User profile viewing pages

### Error Pages
- **AccessDenied.jsx:** 403 Forbidden page
- **NotFound.jsx:** 404 Not Found page

---

## Services

### api.js
**Purpose:** Centralized API communication with authentication

```javascript
// Usage
fetchWithAuth('/api/users', { method: 'GET' })
  .then(data => console.log(data))
  .catch(error => console.error(error))
```

**Features:**
- Automatic JWT token injection
- Standardized request/response handling
- Error handling

### authService.js
**Purpose:** Authentication business logic

**Key Functions:**
- `login(credentials)` - Authenticate user
- `register(userData)` - Create new user account
- `logout()` - Clear session
- `isAuthenticated()` - Check auth status
- `getCurrentUser()` - Get logged-in user info

### tokenService.js
**Purpose:** JWT token lifecycle management

**Key Functions:**
- `setToken(token)` - Store token locally
- `getToken()` - Retrieve stored token
- `removeToken()` - Clear stored token
- `isTokenValid()` - Check token expiration
- `refreshToken()` - Refresh expired token (if implemented)

### config.js
**Purpose:** Centralized configuration for API base URL and endpoints

**Features:**
- Environment-specific BASE_URL (development vs production)
- Pre-configured endpoint constants
- Automatic environment detection
- Easy maintenance of API endpoints

**Usage:**
```javascript
import { BASE_URL, COURSES_ENDPOINT, STUDENT_ENDPOINT } from '../config/config';

// Use endpoints in fetch calls
fetch(`${STUDENT_ENDPOINT}/${studentId}`, { headers });
```

**Configuration Variables:**
- `BASE_URL` - Auto-selected based on environment (defaults to `http://localhost:8080` in dev)
- `COURSES_ENDPOINT` - Course API endpoint
- `STUDENT_ENDPOINT` - Student API endpoint
- `ADMIN_ENDPOINT` - Admin API endpoint
- `TEACHER_ENDPOINT` - Teacher API endpoint
- `NOTICE_ENDPOINT` - Notice API endpoint
- `ATTENDANCE_ENDPOINT` - Attendance API endpoint

---

## Routes

### Public Routes
- `/` - Login (default)
- `/login` - Login page
- `/register` - Registration page
- `/accessdenied` - Access denied page

### Protected Routes
- `/home` - Home page
- `/dashboard` - Main dashboard
- `/users` - User management
- `/teacher` - Teacher management
- `/student` - Student management
- `/admin` - Admin management
- `/course` - Course management
- `/notice` - Notice management
- `/studentenrolled` - Enrolled students
- `/student/:username` - Student profile edit
- `/teacher/:username` - Teacher profile edit
- `/admin/:username` - Admin profile edit
- `/view/student/:username` - Student profile view
- `/view/teacher/:username` - Teacher profile view
- `/view/admin/:username` - Admin profile view
- `/logout` - Logout handler

### Error Routes
- `/accessdenied` - 403 Forbidden

---

## Authentication Flow

### Login Flow
```
User enters credentials
        ↓
AuthService.login(credentials)
        ↓
API call to backend /login endpoint
        ↓
Backend validates credentials
        ↓
Backend returns JWT token + user data
        ↓
TokenService.setToken(token) stores token
        ↓
Redirect to Dashboard
```

### Authenticated Requests
```
Component needs data
        ↓
Calls fetchWithAuth(url, options)
        ↓
TokenService.getToken() retrieves token
        ↓
Authorization header added: "Bearer {token}"
        ↓
API call made with authenticated header
        ↓
Backend verifies token
        ↓
Returns protected data if valid
```

### Logout Flow
```
User clicks logout
        ↓
AuthService.logout()
        ↓
TokenService.removeToken() clears token
        ↓
Redirect to Login page
```

---

## Best Practices

### 1. **Code Organization**
- Keep components small and focused
- Use descriptive file names
- Organize by feature/route

### 2. **State Management**
- Use local component state for UI state
- Lift state for parent-child communication
- Consider Context API for global state needs

### 3. **API Calls**
- Always use `fetchWithAuth` for protected endpoints
- Handle errors gracefully
- Show loading states during data fetching

### 4. **Error Handling**
```javascript
try {
  const data = await fetchWithAuth('/api/endpoint');
  // Process data
} catch (error) {
  console.error('Error:', error);
  // Show toast notification
}
```

### 5. **Component Structure**
```javascript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ComponentName() {
  const navigate = useNavigate();
  const [state, setState] = useState('');

  useEffect(() => {
    // Side effects
  }, []);

  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### 6. **Styling**
- Use Tailwind CSS utility classes
- Avoid inline styles
- Create reusable style classes in CSS files when needed

### 7. **API Integration**
- Use consistent error messages
- Implement loading states
- Validate data before rendering

---

## Troubleshooting

### Issue: Token Expired or Invalid
**Solution:**
- Clear browser storage: `localStorage.clear()`
- Implement token refresh mechanism in `tokenService.js`
- Force user to login again

### Issue: CORS Errors
**Solution:**
- Ensure backend CORS headers are properly configured
- Check API endpoint URL in environment variables
- Verify API server is running

### Issue: Blank Pages or Routes Not Working
**Solution:**
- Clear cache: `Ctrl+Shift+Delete`
- Rebuild project: `npm run build`
- Check browser console for errors: `F12`
- Verify routes in `AppRoutes.jsx`

### Issue: Styling Not Applied
**Solution:**
- Rebuild Tailwind CSS: Stop dev server and restart
- Check class names syntax
- Verify `tailwind.config.js` includes all template paths

### Issue: API Calls Failing
**Solution:**
- Check network tab in DevTools (F12)
- Verify backend server is running
- Check Authorization header: `Authorization: Bearer {token}`
- Ensure token is valid and not expired

### Issue: Hot Module Replacement (HMR) Not Working
**Solution:**
- Save file again to trigger HMR
- Restart development server: `npm run dev`
- Clear browser cache

---

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Hosting
1. Build the project: `npm run build`
2. Upload `dist/` folder to hosting service (Vercel, Netlify, GitHub Pages, etc.)
3. Configure environment variables on hosting platform
4. Set backend API URL for production

### Environment-Specific Configuration
Create `.env.production` for production-specific variables:
```
VITE_API_URL=https://api.yourdomain.com
```

---

## Contributing

### Guidelines
1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and test thoroughly
3. Commit with clear messages: `git commit -m "Add feature description"`
4. Push to branch: `git push origin feature/feature-name`
5. Create Pull Request with description

### Code Style
- Run linter before committing: `npm run lint`
- Follow ESLint rules defined in `eslint.config.js`
- Use meaningful variable and function names

---

## Resources

### Documentation Links
- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Lucide React Icons](https://lucide.dev)

### Related Repositories
- Backend API: [react-udms-backend](https://github.com/shehab097/react-udms-backend)

---

## Support & Contact

For issues, questions, or suggestions:
1. Check existing GitHub issues
2. Create a new GitHub issue with detailed description
3. Contact the development team

---

**Last Updated:** March 2026
**Project Version:** 0.0.0
**Status:** In Development
