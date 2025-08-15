# Career Compass

A comprehensive job search and career management platform for resume optimization and cover letter generation.

## Features

- **Multi-User Support**: Secure user authentication and data isolation
- **Job Tracking**: Manage job applications with status tracking
- **Resume Management**: Create, edit, and optimize resumes
- **Cover Letter Generator**: AI-powered cover letter creation and optimization
- **PostgreSQL Database**: Robust data persistence with proper relationships

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with connection pooling
- **AI**: Google Vertex AI (Gemini models)
- **Authentication**: JWT, Passport.js
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL (or use Docker)

## Quick Start

###  Install Dependencies

```bash

# Frontend
npm install
```

###  Seed Database

```bash
npm run db:seed
```

This creates sample users:
- **Admin users**: alice@example.com, bob@example.com (password: admin123)
- **Regular users**: carlos@example.com, diana@example.com (password: user123)

### 6. Start Development Servers

```bash
cd frontend
npm run dev
```

## Database Schema

The application uses PostgreSQL with the following main tables:

- **users**: User accounts with authentication
- **jobs**: Job applications linked to users
- **resumes**: User resumes with content
- **cover_letters**: Cover letters linked to users and jobs

All tables include proper foreign key relationships and user isolation.

## API Endpoints

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/jobs` - Get user's jobs
- `POST /api/jobs` - Create new job
- `GET /api/resumes` - Get user's resumes
- `POST /api/resumes` - Create new resume
- `GET /api/cover-letters` - Get user's cover letters
- `POST /api/cover-letters` - Create new cover letter

## Multi-User Features

- **User Isolation**: All data is properly scoped to authenticated users
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Data Relationships**: Jobs, resumes, and cover letters are linked to specific users

### Database Seeding
```bash
npm run db:seed
```

### Type Checking
```bash
cd frontend
npm run typecheck
```

