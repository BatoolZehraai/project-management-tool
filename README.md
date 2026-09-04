# Bank AL Habib Limited (BAHL) - Enterprise SDLC Governance & Regulatory Pipeline Platform

[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%20%7C%20Tailwind%204-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Flask](https://img.shields.io/badge/Backend-Flask%203.0%20%7C%20Python-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20SQLite%20Fallback-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

An enterprise-grade Software Development Life Cycle (SDLC) Governance, Regulatory Audit, and API Pipeline Orchestration platform built specifically for **Bank AL Habib Limited (BAHL)**. The platform enforces strict inter-departmental boundary control, Stage Ownership with Role-Based Access Control (RBAC), universal cross-department read visibility, complete regulatory compliance audit logging, and an Insomnia/Postman-grade chained API management studio with server-side proxy execution.

---

## Table of Contents

- [Project Identity & System Overview](#project-identity--system-overview)
- [System Architecture](#system-architecture)
- [Key Capabilities & Governance Modules](#key-capabilities--governance-modules)
  - [1. Department Stage Ownership & Governance Boundaries](#1-department-stage-ownership--governance-boundaries)
  - [2. Multi-Tier RBAC Matrix](#2-multi-tier-rbac-matrix)
  - [3. Kanban Board & Hierarchical Stage File Tree](#3-kanban-board--hierarchical-stage-file-tree)
  - [4. Immutable Regulatory Activity Audit Log](#4-immutable-regulatory-activity-audit-log)
  - [5. Super Admin User Directory & Approvals Console](#5-super-admin-user-directory--approvals-console)
  - [6. Insomnia-Style API Management Studio & Chained Runner](#6-insomnia-style-api-management-studio--chained-runner)
  - [7. User Profile Management & Security](#7-user-profile-management--security)
  - [8. Corporate UI Theming System](#8-corporate-ui-theming-system)
- [Data Models & Entity Relationship Schema](#data-models--entity-relationship-schema)
- [REST API Reference](#rest-api-reference)
- [Project Directory File Tree](#project-directory-file-tree)
- [Installation & Running Guide](#installation--running-guide)
  - [Dual-Engine Database Fallback](#dual-engine-database-fallback)
  - [Backend Setup (Flask / Python)](#backend-setup)
  - [Frontend Setup (Vite / React 19 / Tailwind 4)](#frontend-setup)
- [Default Corporate Credentials](#default-corporate-credentials)
- [Verification & Automated Testing Suite](#verification--automated-testing-suite)
---

## Project Identity & System Overview

The **BAHL Enterprise SDLC Governance Platform** solves regulatory coordination problems across regulated banking units (Business Analysis, Architecture, Software Engineering, Quality Assurance, DevOps, Information Security, and Internal Audit). 

Standard project management tools fail within regulated financial environments due to permissive mutation boundaries and untracked actions. This platform guarantees:

1. **Stage Sovereignty:** Only authorized departments can mutate project artifacts, move Kanban stages, or alter definitions of done within their designated SDLC phase.
2. **Transparent Read-Through Visibility:** All departments retain real-time view access to cross-functional boards, documentation, and blockers to eliminate organizational silos.
3. **Regulatory Audit Immutability:** Every mutation, assignment, comment, state movement, or document upload is recorded with an immutable actor footprint, network timestamp, and delta capture.
4. **Autonomous API Pipeline Verification:** Integrated tooling to execute multi-step chained API workflows against ISO 20022 and Open Banking endpoints with environment isolation and server-side CORS proxies.

---

## System Architecture

The platform uses a decoupled client-server architecture with an intelligent dual-engine persistence layer.

```mermaid
graph TD
    subgraph Frontend["Presentation Layer (Vite + React 19 + Tailwind 4)"]
        A[Stage Kanban Board]
        B[Stage File Tree]
        C[API Studio Runner]
        D[Admin Directory & Approvals]
    end

    subgraph Backend["Application Layer (Flask 3.0 REST API)"]
        M["Security & RBAC Middleware (@require_auth)"]
        E[SDLC Stages & Tasks API]
        F[Regulatory Audit Service]
        G[CORS Proxy Runner]
        M --> E
        M --> F
        M --> G
    end

    subgraph Database["Data Access Layer (SQLAlchemy 2.0)"]
        DB_Check{"Database Engine Probe"}
        PG[(PostgreSQL - Primary Engine)]
        SQL[(SQLite - Zero-Config Fallback)]
        DB_Check -->|Active Connection| PG
        DB_Check -->|Unavailable / Offline| SQL
    end

    Frontend -->|JWT Bearer / REST API| M
    E --> DB_Check
    F --> DB_Check
```

## Key Capabilities & Governance Modules

### 1. Department Stage Ownership & Governance Boundaries
The system segments the software delivery pipeline into distinct SDLC stages (e.g., *Stage 1: Business Analysis & Requirements (BRD/SRS)*, *Stage 2: Solution Architecture & Threat Modeling*, *Stage 3: Core Implementation*, *Stage 4: Quality Engineering*, *Stage 5: Production Deployment*).

* **Stage Mutation Lock:** Only members belonging to the active stage's designated department (or `SUPER_ADMIN`) can create tasks, edit issue metadata, execute drag-and-drop column transitions, or upload deliverables.
* **Universal Read-Through Mode:** Users from all other departments can inspect tasks, view specifications, read discussion threads, and review attached documents.
* **UI Enforcement:** For non-governing department users, all mutation controls are locked:
  * `+ New Task` button is replaced by a lock indicator (`🔒 View-Only Mode: Governed by [Department]`).
  * Kanban drag-and-drop listeners are stripped from the DOM.
  * Task modals open in inspect-only mode without edit or delete actions.
* **Stage-Bound Delegation:** The task assignee dropdown filters down to active, approved members of the specific department governing that phase.

### 2. Multi-Tier RBAC Matrix

| Capability / Operational Scope | SUPER_ADMIN | DEPT_HEAD | TEAM_MEMBER | External Dept Member |
| :--- | :---: | :---: | :---: | :---: |
| **Global User Administration (Approve/Reject/Edit/Delete)** | Yes | No | No | No |
| **Create Projects & Project Phases** | Yes | No | No | No |
| **Create Tasks in Own Department Stage** | Yes | Yes | Yes | No (Read-Only) |
| **Assign Tasks within Own Department** | Yes | Yes | No (Self/Colleagues) | No |
| **Drag & Drop Task Status Movement** | Yes | Yes | Yes (Assigned/Dept) | No (Locked) |
| **View Cross-Department Stages & Tasks** | Yes | Yes | Yes | Yes (Universal View) |
| **Add Comments & Discussion Notes** | Yes | Yes | Yes | Yes (Collaboration) |
| **Upload Files to Stage File Tree** | Yes | Yes | Yes | No (Locked) |
| **Execute Chained API Pipeline (API Studio)** | Yes | Yes | Yes | Yes |
| **Access System Regulatory Audit Trail** | Yes | Yes (Dept Scope) | No | No |

### 3. Kanban Board & Hierarchical Stage File Tree
* **Dynamic Status Workflows:** Workflows transition through `TO DO`, `IN PROGRESS`, and `COMPLETED` swimlanes with real-time counters and priority badges (`High`, `Medium`, `Low`).
* **Interactive Task Details Modal:** Includes checklist tracking with progression completion ratios, Markdown support, and audit-stamped team comments.
* **Stage Files & Folders System:** Integrated document manager per SDLC phase with full directory nesting, file type icons, upload timestamps, and direct download links.

### 4. Immutable Regulatory Activity Audit Log
* Meets compliance requirements for financial systems.
* Tracks every critical mutation with actor metadata, user identity, action type (`TASK_CREATED`, `STATUS_UPDATED`, `STAGE_CHANGED`, `DELEGATION_MODIFIED`, `FILE_UPLOADED`), delta details (previous state vs. new state), and microsecond-precision timestamps.
* Provides a real-time Audit Feed below the active Kanban board with chronological sorting and actor badge highlights.

### 5. Super Admin User Directory & Approvals Console
* Complete user access control pane protected by `SUPER_ADMIN` middleware.
* **KPI Metrics Ribbon:** Displays live counts for Total Active Users, Pending Approvals, Approved Operators, and Rejected Accounts.
* **Approval Controls:** One-click approval or rejection for onboarding accounts.
* **Inline Role & Department Manager:** Quick role updates (`SUPER_ADMIN`, `DEPT_HEAD`, `TEAM_MEMBER`) and department assignments without dropping database connections.
* **Safe Deletion Guard:** Enforces cascading cleanups and prevents self-deletion for administrative integrity.

### 6. Insomnia-Style API Management Studio & Chained Runner
A complete API execution studio directly inside the platform for testing microservices and banking APIs (e.g., ISO 20022 compliance endpoints).

* **Environment Manager:** Switch seamlessly between `Local`, `Development`, `UAT`, and `Production` with support for `{{variable}}` template syntax.
* **2-Step Dependent Chained Pipeline:**
  * **Step 1 (Upstream Producer):** Full HTTP method support (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), header tables, body editors, and variable extractors (e.g., extracting JSON path `body.token` or `body.accountId`).
  * **Step 2 (Downstream Consumer):** Hard-locked until Step 1 returns a `2xx` success code. Automatically resolves variables extracted from Step 1 (e.g., `Authorization: Bearer {{token}}`).
* **Automated Headless Pipeline Runner:** One-click pipeline runner to validate multi-step API flows with detailed error logs and run times.
* **Integrated Backend CORS Proxy:** Routes calls through `POST /api/proxy/execute` on the Flask engine, bypassing browser-side Cross-Origin Resource Sharing (CORS) limits.

### 7. User Profile Management & Security
* Self-service interface for users to update phone numbers, biographies, and custom avatars.
* Secure password alteration with current-password validation and bcrypt hashing.
* Clear display of corporate metadata, including verified corporate email and assigned SDLC department.

### 8. Corporate UI Theming System
* Custom-built styling tailored for Bank AL Habib.
* Single-click toggle between High-Fidelity Light and Dark themes.
* Built using CSS variables and Tailwind CSS 4 color definitions for clean contrast and readability.

---

## Data Models & Entity Relationship Schema

```mermaid
erDiagram
    User ||--o{ Task : "assigned to"
    User ||--o{ ActivityLog : "performs action"
    User ||--o{ Comment : "authors"
    User ||--o{ FileItem : "uploads"
    
    Project ||--|{ ProjectPhase : "contains stages"
    Project ||--o{ ActivityLog : "tracks"
    
    ProjectPhase ||--o{ Task : "groups"
    ProjectPhase ||--o{ FileItem : "stores"
    
    Task ||--o{ Comment : "has discussion"
    Task ||--o{ ActivityLog : "records changes"

    User {
        int id PK
        string name
        string email UK
        string department
        string role
        string status
    }

    Project {
        int id PK
        string code
        string name
        string description
        string status
    }

    ProjectPhase {
        int id PK
        int project_id FK
        string name
        string governing_dept
        int sequence_order
    }

    Task {
        int id PK
        int phase_id FK
        int assigned_to FK
        string title
        string status
        string priority
        json checklist
    }

    ActivityLog {
        int id PK
        int user_id FK
        int project_id FK
        int task_id FK
        string action_type
        string details
        datetime timestamp
    }

    Comment {
        int id PK
        int task_id FK
        int user_id FK
        string message
        datetime timestamp
    }

    FileItem {
        int id PK
        int phase_id FK
        int user_id FK
        string filename
        string file_path
        boolean is_folder
        int parent_id FK
    }
```

* **`User`**: Core identity table storing encrypted passwords, department assignments, and RBAC tiers (`SUPER_ADMIN`, `DEPT_HEAD`, `TEAM_MEMBER`).
* **`Project`**: Master entity for corporate systems (e.g., `Core Banking Ledger System Migration`).
* **`ProjectPhase`**: Tracks discrete SDLC gates with department mapping (`governing_dept`).
* **`Task`**: Work items containing priorities, status states, checklist arrays, and stage references.
* **`Comment`**: Time-stamped conversation notes attached to tasks.
* **`ActivityLog`**: Immutable regulatory ledger tracking all changes, states, and actors.
* **`FileItem`**: Nested folder structures and deliverables linked to phases.

---

## REST API Reference

### 1. Authentication & Identity
| Endpoint | Method | Access Level | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/register` | `POST` | Public | Submit onboarding profile for admin approval |
| `/api/auth/login` | `POST` | Public | Authenticate credentials and receive Bearer JWT |
| `/api/auth/me` | `GET` | Authenticated | Retrieve authenticated user context |
| `/api/auth/profile` | `PUT` | Authenticated | Update user bio, avatar URL, or phone number |
| `/api/auth/change-password` | `POST` | Authenticated | Validate existing password and set new password |

### 2. User Administration (Super Admin)
| Endpoint | Method | Access Level | Description |
| :--- | :---: | :---: | :--- |
| `/api/admin/users` | `GET` | `SUPER_ADMIN` | List all users with filtering by department/status |
| `/api/admin/users/<id>/approve`| `POST` | `SUPER_ADMIN` | Approve a pending user account |
| `/api/admin/users/<id>/reject` | `POST` | `SUPER_ADMIN` | Reject a user onboarding request |
| `/api/admin/users/<id>` | `PUT` | `SUPER_ADMIN` | Update department, role, or user status |
| `/api/admin/users/<id>` | `DELETE`| `SUPER_ADMIN` | Delete user record with dependency checks |

### 3. Projects & SDLC Stages
| Endpoint | Method | Access Level | Description |
| :--- | :---: | :---: | :--- |
| `/api/projects` | `GET` | Authenticated | List all active corporate projects |
| `/api/projects` | `POST` | `SUPER_ADMIN` | Register a new corporate project container |
| `/api/projects/<id>/phases` | `GET` | Authenticated | List all lifecycle stages for a project |
| `/api/projects/<id>/phases` | `POST` | `SUPER_ADMIN` | Append a new governed SDLC phase |

### 4. Tasks & Governance Operations
| Endpoint | Method | Access Level | Description |
| :--- | :---: | :---: | :--- |
| `/api/phases/<phase_id>/tasks` | `GET` | Authenticated | List all tasks in a stage (Universal Read) |
| `/api/phases/<phase_id>/tasks` | `POST` | Dept Member | Create a new task within an owned stage |
| `/api/tasks/<id>` | `PUT` | Dept Member | Modify title, description, or checklists |
| `/api/tasks/<id>/status` | `PATCH`| Dept Member | Update stage status (`TO DO` -> `COMPLETED`) |
| `/api/tasks/<id>` | `DELETE`| Dept Head / Admin | Remove a task record from the board |

### 5. Task Collaboration & Discussion
| Endpoint | Method | Access Level | Description |
| :--- | :---: | :---: | :--- |
| `/api/tasks/<id>/comments` | `GET` | Authenticated | Retrieve complete conversation history |
| `/api/tasks/<id>/comments` | `POST` | Authenticated | Add a collaboration comment to a task |

### 6. Phase Document Management
| Endpoint | Method | Access Level | Description |
| :--- | :---: | :---: | :--- |
| `/api/phases/<id>/files` | `GET` | Authenticated | Retrieve stage document hierarchy |
| `/api/phases/<id>/files` | `POST` | Dept Member | Upload a stage specification or folder |
| `/api/files/<id>` | `DELETE`| Dept Head / Admin | Remove a file from the stage repository |

### 7. Regulatory Audit & CORS Proxy
| Endpoint | Method | Access Level | Description |
| :--- | :---: | :---: | :--- |
| `/api/projects/<id>/activities`| `GET` | Authenticated | Retrieve immutable project audit trail |
| `/api/proxy/execute` | `POST` | Authenticated | Run HTTP calls server-side to avoid CORS limits |

---

## Project Directory File Tree
---
```text
bahl-sdlc-platform/
│
├── backend/
│   ├── app.py                      # Flask Application entry point and router configuration
│   ├── config.py                   # Environment settings and database connection logic
│   ├── models.py                   # SQLAlchemy schema models (User, Task, AuditLog, etc.)
│   ├── middleware.py               # RBAC and stage boundary validation guards
│   ├── requirements.txt            # Python dependencies
│   ├── test_suite.py               # End-to-end verification and API proxy tests
│   │
│   ├── routes/
│   │   ├── auth_routes.py          # Registration, login, profile, and password routes
│   │   ├── admin_routes.py         # Directory management and user approval endpoints
│   │   ├── project_routes.py       # Projects, phases, and stage configuration routes
│   │   ├── task_routes.py          # Task CRUD and column movement endpoints
│   │   ├── file_routes.py          # Stage file tree and document upload routes
│   │   ├── audit_routes.py         # Regulatory activity log query endpoints
│   │   └── proxy_routes.py         # Chained API Studio backend CORS proxy runner
│   │
│   └── uploads/                    # Local storage folder for uploaded stage files
│
└── frontend/
    ├── package.json                # Frontend dependencies and Vite scripts
    ├── vite.config.js              # Vite bundler configuration and dev-server proxies
    ├── tailwind.config.js          # Tailwind CSS 4 theme rules and color palettes
    ├── index.html                  # HTML entry point
    │
    └── src/
        ├── main.jsx                # React runtime bootstrap
        ├── App.jsx                 # Top-level router, theme provider, and auth wrapper
        │
        ├── components/
        │   ├── Navbar.jsx          # Corporate header with project selector and theme toggle
        │   ├── KanbanBoard.jsx     # Drag-and-drop workspace with column management
        │   ├── TaskCard.jsx        # Individual task item with priority indicators
        │   ├── TaskModal.jsx       # Modal for task details, checklists, and comments
        │   ├── StageFileTree.jsx   # Nested folder and file explorer per stage
        │   ├── ActivityAudit.jsx   # Regulatory audit log stream
        │   ├── AdminConsole.jsx    # User directory, approval buttons, and role selectors
        │   └── ApiStudio.jsx       # Insomnia-style API runner with chained step support
        │
        ├── context/
        │   ├── AuthContext.jsx     # Authentication state, login, and active user context
        │   └── ThemeContext.jsx    # Global light and dark mode state provider
        │
        └── services/
            └── api.js              # Axios HTTP interceptors and API service helpers
```

## Installation & Running Guide

### Dual-Engine Database Fallback

The backend uses an automatic database fallback mechanism:

1. On boot, the server attempts to connect to PostgreSQL using `DATABASE_URL`.
2. If PostgreSQL is unreachable, timed out, or unconfigured, the application logs a warning and automatically falls back to an embedded SQLite database (`sdlc_governance.db`).
3. Database tables are verified and created on startup across either engine.
---

### Backend Setup

#### Prerequisites
* Python 3.10, 3.11, or 3.12
* `pip` and `virtualenv`

#### Installation Steps
```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a Python virtual environment
python -m venv venv

# On Linux/macOS:
source venv/bin/activate

# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# 3. Install dependencies
pip install -r requirements.txt

# 4. Optional: Set environment variables (falls back to SQLite defaults if left unset)
export SECRET_KEY="bahl-corporate-enterprise-secret-key"
export DATABASE_URL="postgresql://postgres:password@localhost:5432/bahl_governance"
export PORT=5000

# 5. Start the Flask server
python app.py
The Flask backend will start on http://localhost:5000 with the REST API served under /api/*.
```
---
### Frontend Setup

#### Prerequisites
* Node.js (v18.x, v20.x, or newer)
* `npm` or `yarn`

#### Installation Steps
``` Bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the Vite development server
npm run dev
# Run tests inside the backend environment
cd backend
python test_suite.py
```
---
## Default Corporate Credentials

The database initializes with seed accounts for testing and evaluation across roles:

| Name | Corporate Email | Password | Department | System Role | Operational Access Scope |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Corporate Admin** | `admin@bankalhabib.com` | `Admin@123!` | IT Administration | `SUPER_ADMIN` | Global Access, Directory Management, All Stages |
| **Lead BA Analyst** | `analyst.992@bankalhabib.com` | `Password123!` | Business Analysis | `TEAM_MEMBER` | Governs Stage 1 (Business Analysis & Requirements) |
| **Senior Engineer** | `dev.991@bankalhabib.com` | `Password123!` | Software Engineering | `TEAM_MEMBER` | Governs Stage 3 (Dev Implementation & Task Sprint) |

---

## Verification & Automated Testing Suite

The project includes an automated test runner (`backend/test_suite.py`) covering governance permissions, proxy operations, and database integrity.

```bash
# Run tests inside the backend environment
cd backend
python test_suite.py
