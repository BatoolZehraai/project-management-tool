# Bank AL Habib Limited — SDLC Governance & Regulatory Pipeline Engine

[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%208-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Backend-Python%203.12%20%7C%20Flask%203.0-3776AB?logo=python&logoColor=white)](https://flask.palletsprojects.com/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20SQLite%20Fallback-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Security](https://img.shields.io/badge/Security-JWT%20%2B%20RBAC%20Governance-purple)](https://jwt.io/)
[![Status](https://img.shields.io/badge/Build-Passing-brightgreen)]()

An enterprise banking Software Development Life Cycle (SDLC) Governance Platform built for **Bank AL Habib Limited**. Engineered to deliver strict Department-Based Stage Ownership, multi-tier Role-Based Access Control (RBAC), Universal View-Only Cross-Department Visibility, immutable Regulatory Activity Auditing, and an Insomnia/Postman-style **API Management & Chained Execution Studio**.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Key Capabilities & Core Modules](#key-capabilities--core-modules)
   - [Department Stage Ownership & Governance Boundary](#1-department-stage-ownership--governance-boundary)
   - [Multi-Tier Role-Based Access Control (RBAC)](#2-multi-tier-role-based-access-control-rbac)
   - [Kanban Board, Stage Files & Activity Audit Log](#3-kanban-board-stage-files--activity-audit-log)
   - [Defect & Bug Lifecycle Tracking Module](#4-defect--bug-lifecycle-tracking-module)
   - [Super Admin User Management Console](#5-super-admin-user-management-console)
   - [API Management & Chained Execution Studio](#6-api-management--chained-execution-studio)
   - [User Profile & Credential Management](#7-user-profile--credential-management)
   - [Dark & Light Theme Parity](#8-dark--light-theme-parity)
3. [Technology Stack](#technology-stack)
4. [Data Models & Schema](#data-models--schema)
5. [API Reference](#api-reference)
6. [Getting Started & Installation](#getting-started--installation)
   - [Prerequisites](#prerequisites)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
7. [Default Corporate Credentials](#default-corporate-credentials)
8. [Testing & Verification](#testing--verification)
9. [Project Structure](#project-structure)
10. [License & Compliance](#license--compliance)

---

## System Architecture

The application adopts a decoupled, high-performance client-server architecture:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          Vite + React 19 + Tailwind CSS 4                              │
│  ┌──────────────────────┬───────────────────────┬──────────────────────┬─────────────┐ │
│  │  SDLC Kanban Board   │ Defect / Bug Tracker  │ Super Admin Console  │ API Studio  │ │
│  │ (Stage Governance)   │  (7-State Governance) │  (User Directory)    │(Chained 2S) │ │
│  └──────────────────────┴───────────────────────┴──────────────────────┴─────────────┘ │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ REST APIs + JWT Auth
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                          Flask 3.0 Application Server                                  │
│  ┌──────────────────────┬───────────────────────┬──────────────────────┬─────────────┐ │
│  │ Auth & RBAC Guards   │ Defect State Machine  │ Governance Controller│ CORS Proxy  │ │
│  │ (@token_required)    │ (Transition Validation│ (Tasks, Auditing)    │ (HTTP Exec) │ │
│  └──────────────────────┴───────────────────────┴──────────────────────┴─────────────┘ │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ SQLAlchemy ORM
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                        Relational Storage (Dual-Engine)                                │
│          PostgreSQL (Production)  ◄─── Automatic Fallback ───►  SQLite                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Capabilities & Core Modules

### 1. Department Stage Ownership & Governance Boundary
- **Phase-Governing Teams**: Each SDLC project phase is bound to a specific governing department (e.g., *Stage 1: Business Analysis*, *Stage 2: Architecture & Design*, *Stage 3: Software Engineering*, *Stage 4: Quality Assurance*, *Stage 5: Compliance*, *Stage 6: Operations & Release*).
- **Universal View-Only Visibility**: All authenticated corporate users can view stages, cards, and files across all departments without restriction.
- **Strict Mutation Enforcement**:
  - Task cards inside a stage can only be edited, reassigned, or have status altered by:
    1. Assigned Team Members of the task.
    2. Department Heads (`DEPT_HEAD`) of the governing department.
    3. Super Administrators (`SUPER_ADMIN`).
  - Users outside the governing department receive informative view-only banners and disabled controls.

### 2. Multi-Tier Role-Based Access Control (RBAC)
- **`SUPER_ADMIN`**: Full enterprise authority. Access to User Management, project creation, stage customization, user role promotions/demotions, system resets, and audit overrides.
- **`DEPT_HEAD`**: Departmental governance. Full write/mutation authority over tasks within stages governed by their department.
- **`TEAM_MEMBER`**: Direct execution. Mutates assigned tasks within authorized stages; view-only across foreign stages.

### 3. Kanban Board, Stage Files & Activity Audit Log
- **Kanban Board**: Drag-and-drop / 1-click status transitions across `To Do`, `In Progress`, and `Completed`.
- **Task Modals**: Sub-task checklists with auto-calculated progress bars, priority badges (`Low`, `Medium`, `High`, `Critical`), due date management, file attachments, and threaded comments.
- **Stage Files & Hierarchical Folder Tree**: Upload and organize requirements specifications, architecture diagrams, test matrices, and build artifacts (up to 16MB per file).
- **Regulatory Activity Audit Log**: Real-time chronological audit trail recording task modifications, status shifts, stage transitions, and user delegations with user attribution and timestamping.

### 4. Defect & Bug Lifecycle Tracking Module
An enterprise defect governance engine enforcing state machine progression, strict QA/Developer segregation of duties, and regulatory audit immutability:
- **7-State Lifecycle Progression**:
  - `NEW` ➔ `ASSIGNED` ➔ `IN_PROGRESS` ➔ `RESOLVED` ➔ `VERIFIED` ➔ `CLOSED` (or `REOPENED`).
- **Strict Role-Based State Transition Governance**:
  - **Developers / Assignees**: Authorized to move defects from `ASSIGNED` ➔ `IN_PROGRESS` ➔ `RESOLVED`.
  - **QA / Quality Assurance & Reporters**: Strictly empowered to verify (`RESOLVED` ➔ `VERIFIED`), close (`VERIFIED` ➔ `CLOSED`), or reject/reopen (`RESOLVED` ➔ `REOPENED` / `VERIFIED` ➔ `REOPENED`). Developers attempting unauthorized verification or closure receive `403 Forbidden`.
  - **Super Administrators (`SUPER_ADMIN`)**: Possess master transition override authority across all states.
- **Interactive Visual Lifecycle Stepper & Timeline Modal**:
  - 6-step progress pipeline displaying live status indicators, next valid target actions with role badges, and full chronological audit logs detailing exact timestamps, transition authors, and previous/new states.
- **Multi-View Defect Management Console**:
  - **Kanban Board**: Drag-and-drop / column-based defect cards grouped by active state (`NEW`, `ASSIGNED`, `IN PROGRESS`, `RESOLVED`, `VERIFIED`, `CLOSED`, `REOPENED`).
  - **Grid View**: Compact 2-column cards featuring severity badges, phase indicators, assignees, and quick status actions.
  - **Table View**: Dense data grid displaying severity, title, stage, reporter, assignee, created date, and action triggers.
- **KPI Summary Analytics**:
  - Real-time KPI tiles for Total Defect Count, Critical Severity (with pulse animation), Active In-Progress, Resolved & Verified, Closed, and Resolution Velocity percentage.
- **Multi-Dimensional Filtering & Search**:
  - Instant text search across defect title and description.
  - Severity filter (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
  - Status filter (`ALL`, `OPEN`, `RESOLVED`, `CLOSED`, etc.).
  - SDLC Phase filter and Assignee filter.
- **Immutable Audit Logging**:
  - Every single state transition, status update, and defect creation is automatically written to `ActivityLog` with the associated `bug_id`, `bug_title`, author, and timestamp.

### 5. Super Admin User Management Console
- Accessible **strictly to Super Admins** through the navbar `User Management` action.
- **KPI Summary Metrics**: Total Users, Active / Approved Accounts, Pending Approval Queue (with alert indicator), and Governing Departments.
- **Multi-Dimensional Directory Filters**:
  - Text search by employee name, email, or department.
  - Department dropdown filter.
  - Role filter (`SUPER ADMIN`, `DEPT HEAD`, `TEAM MEMBER`).
  - Status tabs (`ALL`, `APPROVED`, `PENDING`, `REJECTED`).
- **Full Employee CRUD**:
  - `+ New User Entry` drawer to directly register and provision corporate staff.
  - Inline editing of Name, Department, Role, and Status.
  - 1-click Approve and Reject triggers for registration requests.
  - Safe employee deletion with task unassignment and active admin self-deletion guard.

### 6. API Management & Chained Execution Studio
An Insomnia/Postman-style execution studio accessible on a dedicated page directly from both the public portal and the authenticated dashboard:
- **Environment Management**:
  - Create and toggle between **Local Backend**, **Development (Sandbox)**, **Staging (UAT)**, and **Production (Live)**.
  - Variable key-value table editor with dynamic syntax interpolation: `{{baseUrl}}/resource`, `{{apiKey}}`, `{{step1_token}}`.
- **2-Step Dependent Chained Pipeline**:
  - **Step 1 (Setup / Auth Endpoint)**: HTTP method selector (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), URL bar, Headers, Query Params, JSON body editor with "Prettify JSON", and **Variable Extraction Rules** (e.g. extract `response.body.token` into runtime variable `step1_token`).
  - **Step 2 (Downstream Endpoint)**: **Strictly Locked by default**. Displays an amber lock overlay explaining dependency requirements. Automatically unlocks upon Step 1 succeeding with `HTTP 200–299` and resolving required variables.
  - **Dynamic Injection**: Downstream endpoint dynamically consumes `Bearer {{step1_token}}` in headers or URL parameters.
- **Headless Pipeline Runner ("Run Chained Pipeline")**:
  - 1-click sequential automation: Step 1 -> captures output -> extracts variables -> injects into runtime context -> executes Step 2.
  - Halts execution immediately if Step 1 fails, displaying an error log.
- **Server-Side CORS Proxy (`POST /api/proxy/execute`)**:
  - Dispatches HTTP requests through Python `requests`, completely bypassing browser CORS restrictions.
  - Returns millisecond-accurate latency (`time_ms`), payload size (`size_bytes`), HTTP status, headers, and parsed data.

### 7. User Profile & Credential Management
- Accessible from the profile pill in the navbar.
- Upload custom profile pictures/avatars with instant preview and server-side cropping.
- Edit Full Name, Corporate Phone, Governing Department, and Professional Bio.
- Secure Password Update with current password verification and confirmation validation.

### 8. Dark & Light Theme Parity
- Designed with dual-theme styling using Tailwind CSS.
- **Dark Mode**: Deep `#090a12` dark background with purple and emerald accents.
- **Light Mode**: Ultra-crisp `#f8fafc` background with slate and violet borders.
- System-wide theme persistence in `localStorage`.

---

## Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.12+ | Core backend runtime |
| **Flask** | 3.0.3 | Microframework & REST API endpoints |
| **Flask-SQLAlchemy** | 3.1.1 | ORM and database relationship mapping |
| **Flask-Cors** | 4.0.1 | Cross-Origin Resource Sharing handling |
| **PyJWT** | 2.8.0 | Stateless JSON Web Token authentication |
| **psycopg2-binary**| 2.9.9 | PostgreSQL database adapter |
| **requests** | 2.34.2 | HTTP client for the Server-Side CORS proxy |
| **Werkzeug** | Built-in| Password hashing (`generate_password_hash`) & secure uploads |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.8 | User interface components & reactive state |
| **Vite** | 8.2.2 | Fast ESM build tooling & dev server |
| **Tailwind CSS** | 4.3.3 | Utility-first responsive styling |
| **Lucide React** | 1.34.0 | Modern SVG iconography |
| **Axios** | 1.20.0 | HTTP client for backend communication |

---

## Data Models & Schema

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│              User               │       │             Project             │
├─────────────────────────────────┤       ├─────────────────────────────────┤
│ id: Integer (PK)                │       │ id: Integer (PK)                │
│ name: String(100)               │       │ name: String(150)               │
│ email: String(120, Unique)      │◄──┐   │ description: Text               │
│ password_hash: String(255)      │   │   │ created_at: DateTime            │
│ department: String(100)         │   │   └────────────────┬────────────────┘
│ role: String(50)                │   │                    │ 1:N
│ status: String(20)              │   │   ┌────────────────▼────────────────┐
│ avatar_url: String(300)         │   │   │          ProjectPhase           │
│ phone / bio: String             │   │   ├─────────────────────────────────┤
└────────────────┬────────────────┘   │   │ id: Integer (PK)                │
                 │ 1:N                │   │ project_id: Integer (FK)        │
┌────────────────▼────────────────┐   │   │ name: String(100)               │
│              Task               │   │   │ governing_department: String    │
├─────────────────────────────────┤   │   │ phase_order: Integer            │
│ id: Integer (PK)                │   │   └────────────────┬────────────────┘
│ project_id: Integer (FK)        │   │                    │ 1:N
│ phase_id: Integer (FK)          │───┼────────────────────┤
│ title: String(150)              │   │                    │ 1:N
│ priority: Low|Med|High|Critical │   │   ┌────────────────▼────────────────┐
│ assignee_id: Integer (FK)───────┼───┤   │              Bug                │
│ status: To Do|In Prog|Completed │   │   ├─────────────────────────────────┤
│ checklist_json: Text            │   │   │ id: Integer (PK)                │
│ due_date: String                │   │   │ project_id: Integer (FK)        │
└────────────────┬────────────────┘   │   │ phase_id: Integer (FK)          │
                 │ 1:N                │   │ task_id: Integer (FK, Optional) │
┌────────────────▼────────────────┐   │   │ title: String(200)              │
│            Comment              │   │   │ description: Text               │
├─────────────────────────────────┤   │   │ severity: CRITICAL|HIGH|MED|LOW │
│ id: Integer (PK)                │   │   │ status: NEW|ASSIGNED|IN_PROG... │
│ task_id: Integer (FK)           │   │   │ reported_by_id: Integer (FK)    │
│ author_id: Integer (FK)         │   │   │ assigned_to_id: Integer (FK)    │
│ body: Text                      │   │   │ created_at / updated_at         │
│ created_at: DateTime            │   │   └────────────────┬────────────────┘
└─────────────────────────────────┘   │                    │ Audit Linked
                                      │   ┌────────────────▼────────────────┐
                                      │   │           ActivityLog           │
                                      │   ├─────────────────────────────────┤
                                      └───┤ id: Integer (PK)                │
                                          │ project_id: Integer (FK)        │
                                          │ bug_id: Integer (FK, Optional)  │
                                          │ user_id / user_name / email     │
                                          │ action_type / details           │
                                          │ previous_state / new_state      │
                                          │ created_at: DateTime            │
                                          └─────────────────────────────────┘
```

---

## API Reference

### 1. Authentication & Profile
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/register` | Public | Submit new account registration (defaults to `PENDING`) |
| `POST` | `/api/auth/login` | Public | Authenticate corporate email/password, returns JWT token |
| `GET` | `/api/auth/profile` | Authenticated | Retrieve current user profile |
| `PUT` | `/api/auth/profile` | Authenticated | Update current user name, phone, department, bio |
| `POST` | `/api/auth/profile/avatar` | Authenticated | Upload profile picture (`multipart/form-data`) |
| `PUT` | `/api/auth/change-password` | Authenticated | Verify old password and set new password |

### 2. Defect & Bug Lifecycle Tracking
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/projects/<id>/bugs` | Authenticated | List project bugs with filters (severity, status, phase, assignee, search) |
| `POST` | `/api/phases/<phaseId>/bugs` | Authenticated | Report a new defect bound to an SDLC phase and project |
| `PATCH`| `/api/bugs/<id>/status` | Role-Gated | Update state (`NEW`->`ASSIGNED`->`IN_PROGRESS`->`RESOLVED`->`VERIFIED`->`CLOSED`/`REOPENED`) |
| `GET` | `/api/bugs/<id>/history` | Authenticated | Fetch full chronological audit timeline for the defect |
| `PUT` | `/api/bugs/<id>` | Gov. Dept / Admin | Update defect title, description, severity, or assignee |
| `DELETE`| `/api/bugs/<id>` | Super Admin / QA | Remove defect record and audit event |

### 3. Super Admin User Management
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/admin/users` | Super Admin | Fetch all registered corporate users |
| `POST` | `/api/admin/users` | Super Admin | Manually provision a pre-approved user account |
| `PUT` | `/api/admin/users/<id>` | Super Admin | Update user Name, Department, Role, and Status |
| `DELETE` | `/api/admin/users/<id>` | Super Admin | Safely delete user (unassigns tasks, prevents self-deletion) |

### 4. Project & Stage Governance
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/projects` | Authenticated | List all projects with stage and task metrics |
| `POST` | `/api/projects` | Super Admin | Create a new corporate project workspace |
| `GET` | `/api/projects/<id>` | Authenticated | Get project details, dynamic phases, and stages |
| `POST` | `/api/projects/<id>/phases`| Super Admin | Add dynamic phase with assigned governing department |
| `DELETE`| `/api/phases/<id>` | Super Admin | Delete stage and cascade cleanup |

### 5. Tasks & Kanban Board
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/tasks?project_id=<id>`| Authenticated | Get all tasks for active project |
| `POST` | `/api/tasks` | Gov. Dept / Admin | Create a task within governing department boundary |
| `PUT` | `/api/tasks/<id>` | Gov. Dept / Assignee | Update task title, description, priority, or checklist |
| `PATCH`| `/api/tasks/<id>/status` | Gov. Dept / Assignee | Transition status (`To Do` -> `In Progress` -> `Completed`) |
| `PATCH`| `/api/tasks/<id>/shift-stage`| Gov. Dept / Admin | Shift task to a different SDLC stage |
| `DELETE`| `/api/tasks/<id>` | Gov. Dept / Admin | Delete task and log activity audit |

### 6. File & Artifact Management
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/files?project_id=<id>`| Authenticated | List files and folders for current stage or project |
| `POST` | `/api/files/upload` | Gov. Dept / Admin | Upload file attachment (`multipart/form-data`) |
| `POST` | `/api/files/folder` | Gov. Dept / Admin | Create a folder in stage file tree |
| `GET` | `/api/files/download/<id>` | Authenticated | Download file attachment |
| `DELETE`| `/api/files/<id>` | Gov. Dept / Admin | Delete file or folder hierarchy |

### 7. Activity Logs & Auditing
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/projects/<id>/activities` | Authenticated | Get regulatory audit logs for project |
| `POST` | `/api/projects/reset-db` | Super Admin | Factory system reset with sample data seeding |

### 8. API Studio CORS Proxy
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/proxy/execute` | Public / Auth | Forward HTTP request, bypass CORS, return timing & size |

---

## Getting Started & Installation

### Prerequisites
- **Python**: Version 3.10, 3.11, or 3.12+
- **Node.js**: Version 18.0+ or 20.0+ (with npm)
- **PostgreSQL** *(Optional)*: Default runs on PostgreSQL at `localhost:5432/sdlc_governance` with seamless automatic fallback to local SQLite (`sdlc_governance.db`).

---

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   - On Windows (PowerShell):
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - On Linux/macOS:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   Edit or create `backend/.env`:
   ```env
   DATABASE_URL=postgresql://postgres:1234@localhost:5432/sdlc_governance
   SECRET_KEY=sdlc-governance-secret-key-12345
   ```
   *(If PostgreSQL is not running, the application automatically creates and uses `backend/sdlc_governance.db` with zero extra configuration required).*

5. **Start the Flask Backend**:
   ```bash
   python app.py
   ```
   *Backend starts at: `http://127.0.0.1:5000`*

---

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the Vite development server**:
   ```bash
   npm run dev
   ```
   *Frontend starts at: `http://localhost:3000`*

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## Default Corporate Credentials

The application provides quick-fill demo buttons on the Sign In page:

| Role | Corporate Email | Password | Governing Department | Permissions |
|------|-----------------|----------|----------------------|-------------|
| **Super Administrator** | `admin@bankalhabib.com` | `Admin123!` | Executive Management | Full system, user administration & master bug override |
| **QA Lead / Reporter** | `qa.lead@bankalhabib.com` | `Bank123!` | Quality Assurance | Report defects, verify (`VERIFIED`), close (`CLOSED`), reopen |
| **Software Engineer** | `dev.991@bankalhabib.com`| `Bank123!` | Software Engineering | Edit tasks, progress bugs (`ASSIGNED` -> `RESOLVED`) |
| **Business Analyst** | `ba.lead@bankalhabib.com` | `Bank123!` | Business Analysis | Edit Stage 1 tasks, view all stages |

---

## Testing & Verification

Automated end-to-end integration and visual verification suites are included in `scratch/`:

```bash
# Verify Defect / Bug Lifecycle state machine, RBAC gating & ActivityLog audit trail
node scratch/test_bug_lifecycle.mjs

# Verify backend proxy executor & API Studio endpoints
node scratch/test_proxy_api.mjs

# Verify Super Admin User Management API CRUD & RBAC permissions
node scratch/test_admin_user_management.mjs

# Headless Chrome visual verification (Defect Tracker Kanban & Stepper Modal)
node scratch/verify_bug_tracker_ui.mjs

# Headless Chrome visual verification (Light/Dark themes & chained pipeline)
node scratch/verify_api_studio_ui.mjs
```

---

## Project Structure

```
sdlc-governance-engine/
├── backend/
│   ├── app.py                  # Primary Flask application server & REST routes
│   ├── config.py               # Database and upload configurations
│   ├── models.py               # SQLAlchemy ORM schemas & serialization methods
│   ├── requirements.txt        # Backend Python dependencies
│   ├── reset_db_schema.py      # Database initialization & sample data seeder
│   ├── .env                    # Environment credentials & database URI
│   └── uploads/                # Local storage for avatars and stage attachments
│       └── avatars/            # Cropped user profile pictures
├── frontend/
│   ├── index.html              # HTML entry point
│   ├── package.json            # Node.js dependencies & build scripts
│   ├── vite.config.js          # Vite bundler configuration
│   └── src/
│       ├── App.jsx             # Main application orchestrator & SDLC Dashboard
│       ├── main.jsx            # React root mount
│       ├── index.css           # Tailwind CSS 4 directives & font imports
│       ├── assets/
│       │   └── bahl-logo.png   # Official Bank AL Habib Limited crest emblem
│       └── components/
│           ├── ApiStudio.jsx   # Insomnia/Postman API Studio & Chained Runner
│           └── BugTracker.jsx  # Enterprise Defect Lifecycle Governance Console
└── README.md                   # Complete system technical documentation
```

---

## License & Compliance

© 2026 Bank AL Habib Limited. All rights reserved.  
Engineered for strict banking regulatory compliance, ISO 20022 messaging governance, and immutable delivery auditing.
