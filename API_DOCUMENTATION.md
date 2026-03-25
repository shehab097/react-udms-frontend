# API Documentation

## Overview

This document describes the API endpoints used by the UDMS Frontend application. All endpoints require JWT authentication headers.

## Authentication Header

All protected requests must include:

```
Authorization: Bearer {jwt_token}
```

---

## Base URL

```
{VITE_API_URL}/api
```

---

## Authentication Endpoints

### Login

**Endpoint:** `POST /auth/login`

**Request:**

```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

**Response (200 OK):**

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "user_id",
        "email": "user@example.com",
        "name": "User Name",
        "role": "student", // or "teacher", "admin"
        "username": "username"
    }
}
```

### Register

**Endpoint:** `POST /auth/register`

**Request:**

```json
{
    "email": "newuser@example.com",
    "password": "password123",
    "name": "New User",
    "role": "student" // or "teacher", "admin"
}
```

**Response (201 Created):**

```json
{
    "message": "User registered successfully",
    "user": {
        "id": "user_id",
        "email": "newuser@example.com",
        "name": "New User",
        "role": "student",
        "username": "newuser"
    }
}
```

### Logout

**Endpoint:** `POST /auth/logout`

**Response (200 OK):**

```json
{
    "message": "Logged out successfully"
}
```

---

## User Management Endpoints

### Get All Users

**Endpoint:** `GET /users`

**Query Parameters:**

- `role` (optional): Filter by role (student, teacher, admin)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200 OK):**

```json
{
    "users": [
        {
            "id": "user_id",
            "name": "User Name",
            "email": "user@example.com",
            "role": "student",
            "username": "username",
            "createdAt": "2026-03-26T10:00:00Z"
        }
    ],
    "total": 100,
    "page": 1,
    "limit": 10
}
```

### Get User by ID

**Endpoint:** `GET /users/:userId`

**Response (200 OK):**

```json
{
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "student",
    "username": "username",
    "phone": "+1234567890",
    "address": "123 Main St",
    "enrolledCourses": ["course_id_1", "course_id_2"],
    "createdAt": "2026-03-26T10:00:00Z"
}
```

### Get User by Username

**Endpoint:** `GET /users/username/:username`

**Response (200 OK):** Same as Get User by ID

### Update User Profile

**Endpoint:** `PUT /users/:userId`

**Request:**

```json
{
    "name": "Updated Name",
    "phone": "+1234567890",
    "address": "New Address",
    "profileImage": "url_to_image"
}
```

**Response (200 OK):**

```json
{
    "message": "User updated successfully",
    "user": {
        "id": "user_id",
        "name": "Updated Name",
        "email": "user@example.com",
        "phone": "+1234567890",
        "address": "New Address"
    }
}
```

### Delete User

**Endpoint:** `DELETE /users/:userId`

**Response (200 OK):**

```json
{
    "message": "User deleted successfully"
}
```

---

## Course Endpoints

### Get All Courses

**Endpoint:** `GET /courses`

**Query Parameters:**

- `semester` (optional): Filter by semester
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200 OK):**

```json
{
    "courses": [
        {
            "id": "course_id",
            "name": "Course Name",
            "code": "CS101",
            "description": "Course description",
            "semester": 1,
            "instructor": {
                "id": "teacher_id",
                "name": "Teacher Name"
            },
            "enrolledStudents": 45,
            "createdAt": "2026-03-26T10:00:00Z"
        }
    ],
    "total": 50,
    "page": 1,
    "limit": 10
}
```

### Get Course by ID

**Endpoint:** `GET /courses/:courseId`

**Response (200 OK):**

```json
{
    "id": "course_id",
    "name": "Course Name",
    "code": "CS101",
    "description": "Course description",
    "semester": 1,
    "instructor": {
        "id": "teacher_id",
        "name": "Teacher Name",
        "email": "teacher@example.com"
    },
    "students": [
        {
            "id": "student_id",
            "name": "Student Name",
            "studentId": "STU001"
        }
    ],
    "createdAt": "2026-03-26T10:00:00Z"
}
```

### Create Course (Admin Only)

**Endpoint:** `POST /courses`

**Request:**

```json
{
    "name": "New Course",
    "code": "CS102",
    "description": "New course description",
    "semester": 1,
    "instructorId": "teacher_id"
}
```

**Response (201 Created):**

```json
{
    "message": "Course created successfully",
    "course": {
        "id": "new_course_id",
        "name": "New Course",
        "code": "CS102",
        "description": "New course description",
        "semester": 1,
        "instructorId": "teacher_id"
    }
}
```

### Enroll Student in Course

**Endpoint:** `POST /courses/:courseId/enroll`

**Request:**

```json
{
    "studentId": "student_id"
}
```

**Response (200 OK):**

```json
{
    "message": "Student enrolled successfully"
}
```

---

## Attendance Endpoints

### Get Attendance Records

**Endpoint:** `GET /attendance`

**Query Parameters:**

- `courseId` (optional): Filter by course
- `studentId` (optional): Filter by student
- `date` (optional): Filter by date (YYYY-MM-DD)
- `page` (optional): Page number

**Response (200 OK):**

```json
{
    "records": [
        {
            "id": "attendance_id",
            "studentId": "student_id",
            "studentName": "Student Name",
            "courseId": "course_id",
            "courseName": "Course Name",
            "date": "2026-03-26",
            "status": "present", // "present", "absent", "late"
            "remarks": "Optional remarks",
            "recordedBy": "teacher_id",
            "recordedAt": "2026-03-26T10:00:00Z"
        }
    ],
    "total": 45,
    "page": 1,
    "limit": 10
}
```

### Mark Attendance

**Endpoint:** `POST /attendance/mark`

**Request:**

```json
{
    "courseId": "course_id",
    "date": "2026-03-26",
    "records": [
        {
            "studentId": "student_id_1",
            "status": "present"
        },
        {
            "studentId": "student_id_2",
            "status": "absent",
            "remarks": "Sick leave"
        }
    ]
}
```

**Response (200 OK):**

```json
{
    "message": "Attendance marked successfully",
    "recordedCount": 2
}
```

### Get Student Attendance Summary

**Endpoint:** `GET /attendance/student/:studentId`

**Query Parameters:**

- `courseId` (optional): Filter by course

**Response (200 OK):**

```json
{
    "studentId": "student_id",
    "studentName": "Student Name",
    "summary": [
        {
            "courseId": "course_id",
            "courseName": "Course Name",
            "total": 30,
            "present": 28,
            "absent": 2,
            "percentage": 93.33
        }
    ]
}
```

---

## Notice/Announcement Endpoints

### Get All Notices

**Endpoint:** `GET /notices`

**Query Parameters:**

- `type` (optional): Filter by type
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200 OK):**

```json
{
    "notices": [
        {
            "id": "notice_id",
            "title": "Notice Title",
            "content": "Notice content",
            "type": "general", // "general", "urgent", "academic"
            "createdBy": {
                "id": "admin_id",
                "name": "Admin Name"
            },
            "createdAt": "2026-03-26T10:00:00Z",
            "expiresAt": "2026-04-26T10:00:00Z"
        }
    ],
    "total": 10,
    "page": 1,
    "limit": 10
}
```

### Create Notice (Admin Only)

**Endpoint:** `POST /notices`

**Request:**

```json
{
    "title": "New Notice",
    "content": "Notice content",
    "type": "general",
    "expiresAt": "2026-04-26T10:00:00Z"
}
```

**Response (201 Created):**

```json
{
    "message": "Notice created successfully",
    "notice": {
        "id": "notice_id",
        "title": "New Notice",
        "content": "Notice content",
        "type": "general"
    }
}
```

### Update Notice

**Endpoint:** `PUT /notices/:noticeId`

**Request:**

```json
{
    "title": "Updated Title",
    "content": "Updated content",
    "type": "urgent"
}
```

**Response (200 OK):**

```json
{
    "message": "Notice updated successfully"
}
```

### Delete Notice

**Endpoint:** `DELETE /notices/:noticeId`

**Response (200 OK):**

```json
{
    "message": "Notice deleted successfully"
}
```

---

## Semester Endpoints

### Get All Semesters

**Endpoint:** `GET /semesters`

**Response (200 OK):**

```json
{
    "semesters": [
        {
            "id": "semester_id",
            "number": 1,
            "name": "Spring 2026",
            "startDate": "2026-01-15",
            "endDate": "2026-05-15",
            "status": "active" // "upcoming", "active", "completed"
        }
    ]
}
```

---

## Error Responses

### Unauthorized (401)

```json
{
    "error": "Unauthorized",
    "message": "Invalid or expired token"
}
```

### Forbidden (403)

```json
{
    "error": "Forbidden",
    "message": "You don't have permission to access this resource"
}
```

### Not Found (404)

```json
{
    "error": "Not Found",
    "message": "Resource not found"
}
```

### Validation Error (400)

```json
{
    "error": "Validation Error",
    "message": "Validation failed",
    "errors": [
        {
            "field": "email",
            "message": "Invalid email format"
        }
    ]
}
```

### Server Error (500)

```json
{
    "error": "Internal Server Error",
    "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

- Rate limit: 100 requests per minute per IP
- Rate limit headers included in response:
    - `X-RateLimit-Limit`: 100
    - `X-RateLimit-Remaining`: Remaining requests
    - `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Pagination

For endpoints that support pagination:

- Default limit: 10
- Maximum limit: 100
- Default page: 1

**Query Example:**

```
GET /users?page=2&limit=20
```

---

## Testing API Endpoints

### Using Postman

1. Import UDMS API Postman collection (if available)
2. Set environment variables for base URL and token
3. Use pre-configured requests to test endpoints

### Using cURL

```bash
# Login
curl -X POST http://api.example.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get users with auth
curl -X GET http://api.example.com/api/users \
  -H "Authorization: Bearer {token}"
```

---

**Last Updated:** March 2026
**API Version:** 1.0
