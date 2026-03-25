# UDMS Frontend

University Data Management System - React-based Frontend Application

A comprehensive web application for managing university operations including user management, course administration, attendance tracking, and notice distribution across different user roles (Students, Teachers, and Admins).

## Quick Start

### Prerequisites

- Node.js v14.0.0 or higher
- npm v6.0.0 or higher
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/shehab097/react-udms-frontend.git
cd udmp

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Tech Stack

| Technology       | Version | Purpose                     |
| ---------------- | ------- | --------------------------- |
| React            | ^19.2.4 | UI library                  |
| React Router DOM | ^6.30.3 | Client-side routing         |
| Vite             | ^8.0.0  | Build tool and dev server   |
| Tailwind CSS     | ^3.4.19 | Utility-first CSS framework |
| Lucide React     | ^1.7.0  | Icon library                |
| ESLint           | ^9.39.4 | Code linting                |

## Documentation

Comprehensive documentation is available in the project:

- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Complete project guide including architecture, components, services, and best practices
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - API endpoints reference and usage examples
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Environment setup, configuration, and troubleshooting
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines and development workflow

## Available Scripts

```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint to check code quality
npm run lint

# Fix linting errors automatically
npm run lint -- --fix
```

## Configuration

### Base URL Configuration

The application uses a centralized configuration for API endpoints located in `src/config/config.js`.

**To change the API base URL:**

1. Edit `src/config/config.js`:

```javascript
const DEV_BASE_URL = "http://localhost:8080"; // Development
const PROD_BASE_URL = "https://api.yourdomain.com"; // Production
```

2. The BASE_URL automatically switches based on the environment:
    - `npm run dev` → Uses DEV_BASE_URL
    - `npm run build` → Uses PROD_BASE_URL

All API calls use the centralized BASE_URL, so changing it in one place updates everywhere.

**Pre-configured Endpoints:**

- `STUDENT_ENDPOINT` - Student API
- `TEACHER_ENDPOINT` - Teacher API
- `ADMIN_ENDPOINT` - Admin API
- `COURSES_ENDPOINT` - Course API
- `ATTENDANCE_ENDPOINT` - Attendance API
- `NOTICE_ENDPOINT` - Notice API
- `SEMESTER_ENDPOINT` - Semester API
- `USERS_ENDPOINT` - User management API

## Project Structure

```
udmp/
├── public/                      # Static assets
├── src/
│   ├── assets/                 # Images, fonts, media
│   ├── components/             # Reusable components
│   ├── pages/                  # Page components
│   │   ├── profile/           # User profile editing
│   │   └── profileView/       # User profile viewing
│   ├── routes/                # Route definitions
│   ├── services/              # API and utility services
│   ├── config/                # Configuration files
│   │   └── config.js          # Centralized BASE_URL config
│   ├── App.jsx               # Root component
│   └── main.jsx              # Entry point
├── DOCUMENTATION.md          # Main project documentation
├── API_DOCUMENTATION.md      # API reference
├── SETUP_GUIDE.md           # Setup and configuration
├── CONTRIBUTING.md          # Contributing guidelines
├── package.json             # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── eslint.config.js        # ESLint configuration
```

## Key Features

### 1. Authentication & Authorization

- JWT-based token authentication
- Role-based access control (RBAC)
- Protected routes with automatic redirection

### 2. User Management

- User creation, editing, and deletion
- Role assignment (Student, Teacher, Admin)
- Profile management and viewing

### 3. Course Management

- Course creation and administration
- Course enrollment tracking
- Teacher assignment

### 4. Attendance Tracking

- Attendance dashboard and overview
- Mark attendance functionality
- Attendance history and statistics

### 5. Communication

- Notice/announcement system
- System-wide notifications
- Toast notifications for user feedback

## Development Workflow

### Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### Make Changes and Test

```bash
npm run dev
# Make changes and test in browser
```

### Lint and Commit

```bash
npm run lint -- --fix
git add .
git commit -m "feat: Add your feature description"
```

### Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

## Environment Setup

### Development Environment

Create a `.env` file in the root directory:

```bash
VITE_API_URL=http://localhost:8080
VITE_API_TIMEOUT=30000
```

### Production Build

```bash
npm run build
# Output will be in dist/ directory
```

## API Integration

All API calls use the centralized `fetchWithAuth` function from `src/services/api.js`:

```javascript
import { fetchWithAuth } from "../services/api.js";
import { STUDENT_ENDPOINT } from "../config/config.js";

// Fetch data
const students = await fetchWithAuth(`${STUDENT_ENDPOINT}?page=1`);

// Create data
const newStudent = await fetchWithAuth(`${STUDENT_ENDPOINT}`, {
    method: "POST",
    body: JSON.stringify(studentData),
});
```

All requests automatically include the JWT authentication token.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5173
kill -9 <PID>
```

### Module Not Found

```bash
npm install
npm run dev
```

### Tailwind CSS Not Working

```bash
# Stop dev server and restart
npm run dev
```

For more troubleshooting tips, see [SETUP_GUIDE.md](./SETUP_GUIDE.md).

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- Code of conduct
- Development process
- Pull request guidelines
- Commit message conventions
- Coding standards

## Resources

- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Lucide React Icons](https://lucide.dev)

## Support

For issues, questions, or suggestions:

1. Check existing [GitHub Issues](https://github.com/shehab097/react-udms-frontend/issues)
2. Create a new issue with detailed description
3. Contact the development team

## License

This project is private and proprietary to the university.

## Author

**Developer:** Shehab  
**Repository:** [react-udms-frontend](https://github.com/shehab097/react-udms-frontend)

## Status

**Version:** 0.0.0  
**Status:** In Development  
**Last Updated:** March 2026
