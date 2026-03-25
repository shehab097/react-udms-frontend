# Contributing Guide

Welcome to UDMS Frontend! We appreciate your interest in contributing. This guide will help you get started.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Report issues professionally
- Help newcomers feel welcome

## Getting Started

### 1. Fork the Repository
```bash
git clone https://github.com/shehab097/react-udms-frontend.git
cd udmp
```

### 2. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
# Or for bug fixes:
git checkout -b fix/your-bug-fix-name
```

### 3. Set Up Development Environment
```bash
npm install
npm run dev
```

## Development Workflow

### Before Starting Work

1. **Sync with main branch:**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Create a descriptive branch name:**
   - Features: `feature/add-user-authentication`
   - Bugs: `fix/login-token-expired`
   - Documentation: `docs/update-readme`
   - Styles: `style/fix-navbar-spacing`

### While Working

1. **Follow code style:**
   ```bash
   npm run lint
   ```

2. **Test your changes:**
   - Manually test in browser
   - Test on multiple screen sizes
   - Check console for errors

3. **Commit with clear messages:**
   ```bash
   git commit -m "Add: User profile editing feature"
   # or
   git commit -m "Fix: Token refresh not working"
   ```

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `Add` - New feature
- `Fix` - Bug fix
- `Refactor` - Code refactoring
- `Style` - CSS/styling changes
- `Docs` - Documentation updates
- `Test` - Test additions/updates
- `Chore` - Build/dependencies/config

**Examples:**
```
Add: User profile page with edit functionality

Implement profile editing for all user roles
- Add profile page components
- Create profile API endpoints
- Add form validation
- Add success/error notifications

Closes #123
```

```
Fix: Login token not persisting correctly

Use sessionStorage instead of localStorage
for better session management

Fixes #456
```

## Pull Request Process

### Before Submitting

1. **Update your branch:**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run linter:**
   ```bash
   npm run lint
   ```

3. **Build and test:**
   ```bash
   npm run build
   npm run preview
   ```

### Submit Pull Request

1. **Create PR with description:**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Tested on desktop
   - [ ] Tested on mobile
   - [ ] All tests passing

   ## Related Issues
   Closes #123
   ```

2. **Wait for review:**
   - Address feedback promptly
   - Keep discussions professional
   - Update PR based on comments

## Code Standards

### Component Structure
```javascript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ComponentName() {
  const navigate = useNavigate();
  const [state, setState] = useState('');

  useEffect(() => {
    // initialization logic
  }, []);

  const handleAction = () => {
    // handler logic
  };

  return (
    <div className="container">
      {/* JSX content */}
    </div>
  );
}
```

### Naming Conventions
- **Components:** `PascalCase` (e.g., `UserProfile`)
- **Functions:** `camelCase` (e.g., `getUserData`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `API_TIMEOUT`)
- **CSS Classes:** `kebab-case` (e.g., `user-profile`)

### Styling Guidelines
```javascript
// Use Tailwind CSS classes
<div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
</div>

// For complex styles, use CSS modules or separate CSS files
// Avoid inline styles:
// ❌ style={{ backgroundColor: 'red', padding: '10px' }}
// ✅ className="bg-red-500 p-2.5"
```

### Error Handling
```javascript
// Always handle errors gracefully
try {
  const data = await fetchWithAuth('/api/endpoint');
  setState(data);
} catch (error) {
  console.error('Error fetching data:', error);
  // Show user-friendly error message
  showToast('Error', 'Failed to load data', 'error');
}
```

### Comments and Documentation
```javascript
/**
 * Fetches user data and updates state
 * @param {string} userId - The user ID to fetch
 * @returns {Promise<void>}
 */
const fetchUser = async (userId) => {
  // Only fetch if userId is provided
  if (!userId) return;
  
  try {
    const data = await fetchWithAuth(`/api/users/${userId}`);
    setUser(data);
  } catch (error) {
    handleError(error);
  }
};
```

## Testing

### Manual Testing Checklist
- [ ] Feature works on desktop (Chrome, Firefox, Safari, Edge)
- [ ] Feature works on mobile (iOS, Android)
- [ ] No console errors
- [ ] No console warnings (except third-party)
- [ ] Navigation works correctly
- [ ] Form validation works
- [ ] Error states display correctly
- [ ] Loading states display correctly
- [ ] Responsive design working

### Testing Different Scenarios

1. **Success path:**
   - Normal user flow works correctly
   - Data displays properly

2. **Error path:**
   - Network errors handled
   - API errors displayed
   - User cannot proceed with invalid data

3. **Edge cases:**
   - Empty data
   - Very long text
   - Special characters
   - Multiple rapid clicks

## Documentation

When contributing new features, update relevant documentation:

1. **Code comments:** Explain the "why", not the "what"
2. **DOCUMENTATION.md:** Update feature descriptions
3. **API_DOCUMENTATION.md:** Document new API calls
4. **Component README:** For complex components, create README.md

## Common Issues

### Issue: Lint errors
```bash
npm run lint
# Fix automatically if possible
npm run lint -- --fix
```

### Issue: Build fails
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Port already in use
```bash
# On Windows, kill process using port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# On Mac/Linux
lsof -i :5173
kill -9 <PID>
```

## Review Process

### What Reviewers Look For
- Code quality and style compliance
- No breaking changes
- Proper error handling
- Performance considerations
- Documentation updates
- Testing coverage

### Timeline
- Initial review: 24-48 hours
- Follow-up feedback: 12-24 hours
- Approval and merge: Once approved and all comments addressed

## Questions or Issues?

- Check existing issues and discussions
- Comment on related issues for context
- Create new issue with clear description
- Tag maintainers if urgent

## Recognition

Contributors will be recognized in:
- Project README
- Release notes
- GitHub contributors page

Thank you for contributing to UDMS Frontend! 🎉

---

**Last Updated:** March 2026
