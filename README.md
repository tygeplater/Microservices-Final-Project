# Microservices-Final-Project
12/1/25
Tyge Plater

This is the Final Project repository for the CSC5201 Microservices Final Project

## F1 Service
This is the first sports service within the application, more could be added in the future, but for now this is the main starting service for serving sports content like Event Calendars, News, Standings, etc. 

## Stats Service
This is the main statistics service for the whole application.  Kafka will be utilized to send data from the Sports Services back to the Stats Service, which will be recieved and logged to a database.  

This will allow logs to be stored, and displayed on a simple frontend that visualizes the database data.  


# Add JWT-Based Access Control to Backend Services

## Overview
Implement JWT authentication with role-based access control (RBAC) for both `f1-service` and `stats-service` backends. Authentication will be integrated into `stats-service` (since it has a database), and both services will validate JWT tokens. Usage statistics endpoints (`/api/usage/*`) will be restricted to ADMIN role only, ensuring they are available via administrative endpoints as required. Both TypeScript frontends will be updated to handle authentication.

## Implementation Plan

### 1. Backend Authentication Infrastructure

#### 1.1 Update Dependencies
- Add `python-jose[cryptography]` and `passlib[bcrypt]` to both services' `requirements.txt`
- Add `python-multipart` for form data handling in stats-service

#### 1.2 Database Schema (stats-service)
- Create `User` model in `stats-service/backend/api/models.py` with fields: id, username, email, hashed_password, role
- Create `Role` enum with values: ADMIN (for accessing usage statistics), USER (for regular API access)
- Update `database.py` to include User model and create migration
- Create a default admin user during initialization (or provide seed script)

#### 1.3 Authentication Utilities
- Create `stats-service/backend/api/auth.py` with:
  - JWT token generation/validation functions
  - Password hashing utilities
  - Token secret key management (via environment variables)
  - Role checking utilities (`require_role` function for ADMIN/USER roles)

#### 1.4 Authentication Endpoints (stats-service)
- Add `/api/auth/register` endpoint in `stats-service/backend/api/api.py`
- Add `/api/auth/login` endpoint that returns JWT token
- Add `/api/auth/me` endpoint to get current user info
- Update CORS to allow credentials

#### 1.5 Protected Endpoint Middleware
- Create `get_current_user` dependency function for both services
- Create `require_role` dependency function for role-based access (ADMIN, USER roles)
- Apply authentication to all endpoints except `/health` in both services
- **Admin-only endpoints**: Protect `/api/usage/summary`, `/api/usage/by-endpoint`, `/api/usage/recent` in stats-service with ADMIN role requirement
- Regular endpoints (`/api/session-info`, `/api/weekend-results`, `/api/schedule`, `/api/stats`) require USER role or higher
- Update `f1-service/backend/api/api.py` to validate JWT tokens from requests
- Update `stats-service/backend/api/api.py` to validate JWT tokens and protect usage endpoints
- Ensure usage tracking middleware continues to work for all requests (including authenticated ones) - tracking should happen before auth checks

#### 1.6 Shared Authentication Logic
- Create shared auth validation module that both services can use
- Both services will validate JWT tokens using the same secret key (from environment variable)
- Update CORS configuration in both services to handle credentials properly

### 2. Frontend Authentication

#### 2.1 F1 Service Frontend
- Create `f1-service/frontend/src/auth/auth.ts` for auth utilities (token storage, API calls)
- Create `f1-service/frontend/src/contexts/AuthContext.tsx` for auth state management
- Create login/register components in `f1-service/frontend/src/components/`
- Update `f1-service/frontend/src/api/api.hub.ts` to include JWT token in fetch headers
- Add auth routes and protect routes that require authentication

#### 2.2 Stats Service Frontend
- Create `stats-service/frontend/src/auth/auth.ts` for auth utilities
- Create `stats-service/frontend/src/contexts/AuthContext.tsx` for auth state management
- Create login/register components
- Update API calls to include JWT token in headers
- Add auth routes and protect routes
- Create admin dashboard component for viewing usage statistics (requires ADMIN role)

### 3. Configuration Updates

#### 3.1 Environment Variables
- Add `JWT_SECRET_KEY` to both backend services' environment configuration
- Add `JWT_ALGORITHM` (default: HS256)
- Add `JWT_EXPIRATION_HOURS` (default: 24)
- Update `docker-compose.yml` to include these environment variables

#### 3.2 CORS Updates
- Update CORS in both services to properly handle credentials
- Restrict origins to specific frontend URLs instead of "*" (f1-service: localhost:3000, stats-service: localhost:3001)

## Files to Modify

### Backend Files
- `stats-service/backend/requirements.txt` - Add auth dependencies
- `f1-service/backend/requirements.txt` - Add auth dependencies
- `stats-service/backend/api/models.py` - Add User model
- `stats-service/backend/api/database.py` - Add User table creation
- `stats-service/backend/api/api.py` - Add auth endpoints and protect routes (especially `/api/usage/*` with ADMIN role)
- `f1-service/backend/api/api.py` - Add auth middleware and protect routes
- `stats-service/backend/api/auth.py` - **NEW** - Authentication utilities
- `docker-compose.yml` - Add JWT environment variables

### Frontend Files
- `f1-service/frontend/src/api/api.hub.ts` - Add token to headers
- `f1-service/frontend/src/auth/auth.ts` - **NEW** - Auth utilities
- `f1-service/frontend/src/contexts/AuthContext.tsx` - **NEW** - Auth context
- `stats-service/frontend/src/stats-service.tsx` - Update API calls with auth
- `stats-service/frontend/src/auth/auth.ts` - **NEW** - Auth utilities
- `stats-service/frontend/src/contexts/AuthContext.tsx` - **NEW** - Auth context

## Security Considerations
- JWT secret key stored in environment variables
- Passwords hashed using bcrypt
- Tokens expire after configured time
- Health endpoints excluded from authentication
- Usage statistics endpoints (`/api/usage/*`) restricted to ADMIN role only
- Regular API endpoints require USER role or higher
- CORS configured to allow credentials for authenticated requests
- Usage tracking middleware continues to track all requests (including authenticated ones) for statistics

## Requirements Compliance
- ✅ **Service APIs have access controls**: All endpoints (except `/health`) require authentication with appropriate roles
- ✅ **Usage statistics available via administrative endpoint**: `/api/usage/*` endpoints are protected with ADMIN role requirement, ensuring only administrators can access usage statistics