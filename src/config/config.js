/**
 * Application Configuration
 *
 * BASE_URL: Backend API base URL
 * DEV_BASE_URL: Development environment base URL
 * PROD_BASE_URL: Production environment base URL
 *
 * Usage:
 *  import { BASE_URL, API_ENDPOINT } from './config';
 *  fetch(`${BASE_URL}/api/users`)
 */

// Environment-specific base URLs
const DEV_BASE_URL = "http://localhost:8080";
const PROD_BASE_URL = "https://api.yourdomain.com";

// Automatically select BASE_URL based on environment
const BASE_URL =
    import.meta.env.MODE === "production" ? PROD_BASE_URL : DEV_BASE_URL;

// API endpoints
export const API_ENDPOINT = `/api`;
export const AUTH_ENDPOINT = `${BASE_URL}/auth`;
export const REGISTER_ENDPOINT = `${BASE_URL}/register`;
export const USERS_ENDPOINT = `${BASE_URL}/users`;
export const COURSES_ENDPOINT = `${BASE_URL}/course`;
export const ATTENDANCE_ENDPOINT = `${BASE_URL}/attendance`;
export const NOTICE_ENDPOINT = `${BASE_URL}/notice`;
export const STUDENT_ENDPOINT = `${BASE_URL}/student`;
export const TEACHER_ENDPOINT = `${BASE_URL}/teacher`;
export const ADMIN_ENDPOINT = `${BASE_URL}/admin`;
export const SEMESTER_ENDPOINT = `${BASE_URL}/semester`;
export const STUDENT_ENROLLED_ENDPOINT = `${BASE_URL}/student-enrolled`;

// Full endpoint builder
export const buildEndpoint = (endpoint, path = "") => {
    return `${endpoint}${path}`;
};

// Export BASE_URL as default
export default BASE_URL;

// Configuration object
export const CONFIG = {
    BASE_URL,
    DEV_BASE_URL,
    PROD_BASE_URL,
    API_ENDPOINT,
    AUTH_ENDPOINT,
    USERS_ENDPOINT,
    COURSES_ENDPOINT,
    ATTENDANCE_ENDPOINT,
    NOTICE_ENDPOINT,
    STUDENT_ENDPOINT,
    TEACHER_ENDPOINT,
    ADMIN_ENDPOINT,
    REQUEST_TIMEOUT: 30000, // 30 seconds
    TOKEN_KEY: "token",
    ROLE_KEY: "role",
    USERNAME_KEY: "username",
};
