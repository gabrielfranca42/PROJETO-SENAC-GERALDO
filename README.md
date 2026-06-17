# SIGAC — Integrated Complementary Activities Management System

> A full-stack academic platform designed to digitize and automate the submission, validation, and tracking of complementary activity hours for higher-education students.

---

## 📖 Table of Contents

- [Project Purpose](#-project-purpose)
- [Key Features](#-key-features)
- [System Design](#-system-design)
  - [High-Level Architecture](#high-level-architecture)
  - [Data Flow](#data-flow)
  - [Entity-Relationship Diagram](#entity-relationship-diagram)
- [Technology Stack](#-technology-stack)
- [Backend Architecture](#-backend-architecture)
  - [Modular MVC Structure](#modular-mvc-structure)
  - [Project Tree](#project-tree)
  - [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running with Docker](#running-with-docker)
- [Deployment](#-deployment)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Related Repositories](#-related-repositories)
- [License](#-license)

---

## 🎯 Project Purpose

In Brazilian higher-education institutions (such as SENAC), students are required to complete a minimum number of **complementary activity hours** (e.g., workshops, internships, extension projects, lectures) to graduate. Traditionally, this process involves:

1. Students physically delivering paper certificates to coordinators.
2. Coordinators manually verifying, counting, and recording hours in spreadsheets.
3. Students having no real-time visibility into their progress.

**SIGAC** (Sistema Integrado de Gestão de Atividades Complementares) eliminates this manual overhead by providing:

- A **mobile app** where students upload certificates directly from their phones.
- A **web dashboard** where coordinators and administrators review, approve, or reject submissions.
- An **intelligent OCR engine** that automatically extracts hours and subject data from uploaded certificates.
- **Automated email notifications** at every step of the workflow.
- A **real-time dashboard** showing each student's progress toward their graduation requirements.

The ultimate goal is a **paperless, auditable, and transparent** workflow that benefits students, coordinators, and institutional administrators equally.

---

## ✨ Key Features

| Area | Feature |
|---|---|
| **Student (Mobile)** | Upload certificates (PDF/Image), track approved hours, view per-category progress |
| **Coordinator (Web)** | Review pending certificates, approve/reject/request revision, adjust claimed hours, manage enrolled students |
| **Administrator (Web)** | Full CRUD for courses, category rules, coordinators; system-wide dashboard with analytics |
| **OCR Engine** | Auto-extract hours and subject from certificates using Tesseract.js (Portuguese language) |
| **Notifications** | Email alerts on submission, approval, rejection, login, and student onboarding |
| **Security** | JWT authentication, role-based access control, Helmet headers, rate limiting |
| **Audit Trail** | Immutable audit log for every evaluation and administrative action |
| **DevOps** | Docker support, GitHub Actions CI, Render cloud deployment with auto-ping keep-alive |

---

## 🏗 System Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          SIGAC PLATFORM                                │
│                                                                        │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────────────┐  │
│  │  Mobile App  │    │   Web Dashboard  │    │   Web Dashboard      │  │
│  │  (Student)   │    │   (Coordinator)  │    │   (Administrator)    │  │
│  │              │    │                  │    │                      │  │
│  │ React Native │    │   React + Vite   │    │   React + Vite       │  │
│  │ Expo SDK 54  │    │   (PWA-ready)    │    │   (PWA-ready)        │  │
│  └──────┬───────┘    └────────┬─────────┘    └──────────┬───────────┘  │
│         │                     │                         │              │
│         └─────────────────────┼─────────────────────────┘              │
│                               │                                        │
│                    HTTPS (REST API v1)                                  │
│                               │                                        │
│                  ┌────────────▼────────────┐                           │
│                  │   Node.js / Express 5   │                           │
│                  │      Backend API        │                           │
│                  │                         │                           │
│                  │  ┌───────┐ ┌─────────┐  │                           │
│                  │  │  JWT  │ │  RBAC   │  │                           │
│                  │  │ Auth  │ │ Roles   │  │                           │
│                  │  └───────┘ └─────────┘  │                           │
│                  │  ┌───────┐ ┌─────────┐  │                           │
│                  │  │ OCR   │ │ Email   │  │                           │
│                  │  │Engine │ │ Service │  │                           │
│                  │  └───────┘ └─────────┘  │                           │
│                  └────────────┬────────────┘                           │
│                               │                                        │
│                  ┌────────────▼────────────┐                           │
│                  │     MongoDB 6.0         │                           │
│                  │   (Mongoose ODM)        │                           │
│                  └─────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Student uploads certificate via Mobile App
        │
        ▼
  ┌─────────────────┐
  │ Multer receives  │──► File saved to disk temporarily
  │ multipart upload │
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │ FileProcessing   │──► Tesseract OCR (images) or pdf-parse (PDFs)
  │ Service          │    extracts text from certificate
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │ Activity Service │──► Validates against course rules:
  │ (Business Rules) │    - Category hour limits
  │                  │    - Semester hour caps
  │                  │    - Total course hour cap
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │ MongoDB          │──► Activity saved with status PENDING
  │ (Base64 storage) │    File stored as Base64 in document
  └────────┬────────┘
           │
           ▼
  ┌─────────────────┐
  │ Email Service    │──► Coordinator notified of new submission
  └─────────────────┘
           │
           ▼
  Coordinator reviews on Web Dashboard
        │
        ▼
  APPROVED / REJECTED / NEEDS_REVISION
        │
        ▼
  ┌─────────────────┐
  │ Audit Log        │──► Immutable record of decision
  │ Email Service    │──► Student notified of result
  └─────────────────┘
```

### Entity-Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│     User     │       │    Activity      │       │    Course    │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ _id          │◄──┐   │ _id              │   ┌──►│ _id          │
│ name         │   │   │ student (ref)  ──┼───┘   │ name         │
│ email        │   │   │ course (ref)   ──┼───────│ totalHours   │
│ password     │   └───│                  │       │ semesterMax  │
│ role (enum)  │       │ title            │       │ coordinator  │
│ matricula    │       │ hoursClaimed     │       │ categories[] │
│ courses[]    │       │ category         │       │  ├─ name     │
│ createdAt    │       │ fileData (B64)   │       │  ├─ maxHours │
└──────────────┘       │ fileMimeType     │       │  └─ semester │
                       │ ocrText          │       │    MaxHours  │
┌──────────────┐       │ status (enum)    │       └──────────────┘
│   AuditLog   │       │ feedback         │
├──────────────┤       │ semester         │
│ action       │       │ createdAt        │
│ performedBy  │       └──────────────────┘
│ targetResource│
│ resourceId   │
│ details      │
│ createdAt    │
└──────────────┘
```

---

## 🛠 Technology Stack

### Backend

| Library | Version | Purpose |
|---|---|---|
| **Node.js** | 20+ | JavaScript runtime |
| **Express** | 5.x | HTTP framework (latest major) |
| **Mongoose** | 9.x | MongoDB ODM with schema validation |
| **jsonwebtoken** | 9.x | JWT token signing and verification |
| **bcryptjs** | 3.x | Password hashing (bcrypt algorithm) |
| **Multer** | 1.4.x | Multipart file upload handling |
| **Tesseract.js** | 5.x | OCR engine for image text extraction |
| **pdf-parse** | 1.x | PDF text extraction |
| **Sharp** | 0.35.x | Image processing and optimization |
| **Nodemailer** | 6.x | SMTP email delivery |
| **Helmet** | 8.x | HTTP security headers |
| **express-rate-limit** | 8.x | API rate limiting per IP |
| **Zod** | 4.x | Runtime schema validation |
| **dotenv** | 17.x | Environment variable loading |
| **Jest** | 30.x | Unit testing framework |
| **Supertest** | 7.x | HTTP assertion testing |
| **Nodemon** | 3.x | Development auto-restart |

### Frontend (Web Dashboard)

| Library | Version | Purpose |
|---|---|---|
| **React** | 19.x | UI component library |
| **Vite** | 8.x | Build tool and dev server |
| **React Router DOM** | 7.x | Client-side routing (HashRouter) |
| **Axios** | 1.x | HTTP client with interceptors |
| **Recharts** | 3.x | Data visualization charts |
| **Lucide React** | 1.x | Icon library |
| **vite-plugin-pwa** | 1.x | Progressive Web App support |

### Mobile App (Student)

| Library | Version | Purpose |
|---|---|---|
| **React Native** | 0.81.x | Cross-platform mobile framework |
| **Expo** | SDK 54 | Managed workflow and native APIs |
| **React Navigation** | 7.x | Stack + Bottom Tab navigation |
| **Axios** | 1.x | HTTP client |
| **AsyncStorage** | 2.x | Persistent local key-value storage |
| **expo-document-picker** | 14.x | Native file picker for certificates |
| **expo-status-bar** | 3.x | Status bar customization |

### Infrastructure

| Tool | Purpose |
|---|---|
| **MongoDB 6.0** | Document database (Docker or Atlas) |
| **Docker** | Multi-stage container build |
| **Docker Compose** | Local orchestration (backend + MongoDB) |
| **GitHub Actions** | CI pipeline on push/PR to main |
| **Render** | Cloud hosting (backend API) |
| **GitHub Pages** | Static hosting (frontend PWA) |

---

## 📐 Backend Architecture

### Modular MVC Structure

The backend follows a **domain-driven modular MVC** pattern. Each domain module is self-contained with its own model, repository, service, controller, and routes:

```
Module Pattern:
  module/
  ├── module.model.js        → Mongoose schema definition
  ├── module.repository.js   → Data access layer (DB queries)
  ├── module.service.js      → Business logic and validation
  ├── module.controller.js   → HTTP request/response handling
  └── module.routes.js       → Express route definitions
```

**Layer Responsibilities:**

| Layer | Responsibility |
|---|---|
| **Routes** | Define endpoints, attach middlewares (auth, RBAC, multer, validation) |
| **Controller** | Parse HTTP input, delegate to services, format HTTP output |
| **Service** | Enforce business rules, orchestrate cross-module logic |
| **Repository** | Abstract Mongoose queries (find, save, update, delete) |
| **Model** | Define document schema, indexes, pre-save hooks |

### Project Tree

```
PROJETO-SENAC-GERALDO/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions CI pipeline
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection (Mongoose)
│   │   ├── middlewares/
│   │   │   ├── auth.js               # JWT token verification
│   │   │   ├── authRole.js           # Role-based authorization (RBAC)
│   │   │   └── validateRequest.js    # Zod schema validation
│   │   ├── modules/
│   │   │   ├── auth/                 # Authentication (login + JWT)
│   │   │   ├── users/                # User CRUD + registration
│   │   │   ├── courses/              # Course + category rules CRUD
│   │   │   ├── activities/           # Certificate submission + evaluation
│   │   │   └── dashboard/            # Aggregated stats + audit log
│   │   ├── utils/
│   │   │   ├── EmailService.js       # SMTP email (Nodemailer)
│   │   │   ├── FileProcessingService.js  # OCR router (PDF vs Image)
│   │   │   └── orcService.js         # Tesseract + regex extraction
│   │   ├── app.js                    # Express app configuration
│   │   ├── server.js                 # Entry point + Render keep-alive
│   │   └── seed.js                   # Database seeder (test data)
│   ├── Dockerfile                    # Multi-stage production build
│   ├── package.json
│   └── .env.example
├── docker-compose.yml                # Local dev (backend + MongoDB)
├── CONTRIBUTING.md
└── README.md
```

### Role-Based Access Control (RBAC)

The system implements a **hierarchical RBAC model** with four distinct roles:

| Role | Scope | Key Permissions |
|---|---|---|
| `SUPER_ADMIN` | System-wide | Full bypass of all RBAC checks; can delete any resource |
| `ADMIN` | System-wide | CRUD courses, coordinators, and users; view dashboard |
| `COORDINATOR` | Per-course | Evaluate activities, adjust hours, manage students within assigned courses only |
| `STUDENT` | Self only | Submit certificates, view own activities, track personal progress |

**Middleware chain:** Every protected route passes through `authenticate` (JWT verification) → `authorize([roles])` (RBAC check). The `SUPER_ADMIN` role automatically bypasses the role array check.

---

## 📡 API Reference

Base URL: `https://projeto-senac-geraldo-1.onrender.com/api/v1`

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/login` | Authenticate and receive JWT | Public |

### Users

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/users/register` | Register a new user | Public |
| `GET` | `/users/me` | Get logged-in user's profile | JWT |
| `GET` | `/users` | List users (filter: `?role=COORDINATOR`) | JWT + ADMIN |
| `GET` | `/users/:id` | Get user by ID | JWT + ADMIN |
| `PUT` | `/users/:id` | Update user | JWT + ADMIN |
| `DELETE` | `/users/:id` | Delete user | JWT + SUPER_ADMIN |

### Courses

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/courses` | Create course | JWT + ADMIN |
| `GET` | `/courses` | List all courses | JWT |
| `GET` | `/courses/:id` | Get course by ID | JWT |
| `PUT` | `/courses/:id` | Update course | JWT + ADMIN |
| `DELETE` | `/courses/:id` | Delete course | JWT + SUPER_ADMIN |
| `POST` | `/courses/:id/categories` | Add category rule | JWT + ADMIN |
| `DELETE` | `/courses/:id/categories/:catId` | Remove category rule | JWT + ADMIN |

### Activities (Certificates)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/activities` | Submit certificate (multipart) | JWT + STUDENT |
| `GET` | `/activities` | List activities (`?status=PENDING&courseId=x`) | JWT |
| `GET` | `/activities/:id` | Get activity details | JWT |
| `PUT` | `/activities/:id` | Update activity (pending only) | JWT + STUDENT |
| `DELETE` | `/activities/:id` | Delete activity (pending only) | JWT + STUDENT |
| `PUT` | `/activities/:id/evaluate` | Approve/Reject/Request revision | JWT + COORDINATOR |
| `PUT` | `/activities/:id/adjust-hours` | Adjust claimed hours | JWT + COORDINATOR |
| `POST` | `/activities/extract-ocr` | Extract OCR data from file | JWT |

### Dashboard

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/dashboard/stats` | Aggregated statistics | JWT + ADMIN |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+
- **MongoDB** 6.0+ (local, Docker, or MongoDB Atlas)
- **Docker** and **Docker Compose** (optional, for containerized setup)

### Installation

```bash
# Clone the repository
git clone https://github.com/gabrielfranca42/PROJETO-SENAC-GERALDO.git
cd PROJETO-SENAC-GERALDO

# Install backend dependencies
cd backend
npm install
```

### Environment Variables

Create a `.env` file in the `backend/` directory based on `.env.example`:

```env
# Database
MONGO_URI=mongodb://root:rootpassword@127.0.0.1:27017/pi_db?authSource=admin

# Authentication
JWT_SECRET=your-secure-secret-key

# Server
PORT=3000

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Running Locally

```bash
# Development (with hot-reload via Nodemon)
npm run dev

# Production
npm start

# Seed the database with test data
node src/seed.js

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

The API will be available at `http://localhost:3000/api/v1`

### Running with Docker

```bash
# Start MongoDB + Backend
docker-compose up -d

# Start only MongoDB (for local development)
docker-compose up -d mongodb

# Build the backend image manually
docker build -t sigac-backend ./backend

# Run the image
docker run -p 3000:3000 --env-file ./backend/.env sigac-backend
```

---

## ☁ Deployment

The backend is deployed on **Render** (free tier) with an auto-ping mechanism to prevent cold starts:

```javascript
// server.js — keeps the Render instance awake
setInterval(async () => {
  await fetch("https://projeto-senac-geraldo-1.onrender.com");
}, 13 * 60 * 1000); // Every 13 minutes (before the 15-minute idle timeout)
```

The frontend is deployed on **GitHub Pages** as a static PWA build.

---

## 🔄 CI/CD Pipeline

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and pull request to `main`:

1. **Checkout** — Clones the repository
2. **Setup Node.js 20** — Installs the runtime
3. **Install Dependencies** — Runs `npm install` in the `backend/` directory

---

## 📦 Related Repositories

| Project | Description | Stack |
|---|---|---|
| [FRONTEND-REACT-PI](https://github.com/gabrielfranca42/FRONTEND-REACT-PI) | Web dashboard for coordinators and administrators | React 19, Vite 8, Recharts |
| [REACT-NATIVE-SIGAC](https://github.com/gabrielfranca42/REACT-NATIVE-SIGAC) | Mobile app for students (ValidaUP) | React Native 0.81, Expo SDK 54 |

---

## 📄 License

This project was developed as an academic integrative project (Projeto Integrador) at **SENAC Recife** for the Systems Analysis and Development program.