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
   - [Executive Overview & Delivery Analytics](#1-executive-overview--delivery-analytics)
   - [Department Stage Ownership & Governance Boundary](#2-department-stage-ownership--governance-boundary)
   - [Multi-Tier Role-Based Access Control (RBAC)](#3-multi-tier-role-based-access-control-rbac)
   - [SDLC Kanban Board & Task Governance](#4-sdlc-kanban-board--task-governance)
   - [Timeline & Milestone Schedule Planner](#5-timeline--milestone-schedule-planner)
   - [Project Documents & Stage Repository](#6-project-documents--stage-repository)
   - [Defect & Bug Lifecycle Tracking Module](#7-defect--bug-lifecycle-tracking-module)
   - [API Management & Chained Execution Studio](#8-api-management--chained-execution-studio)
   - [Corporate Video Meetings & MoM Engine](#9-corporate-video-meetings--mom-engine)
   - [Corporate Team & Access Governance](#10-corporate-team--access-governance)
   - [Compliance Audit Trail & Activity Feed](#11-compliance-audit-trail--activity-feed)
   - [Theme Parity & UI Engineering](#12-theme-parity--ui-engineering)
3. [Technology Stack](#technology-stack)
4. [Data Models & Schema](#data-models--schema)
5. [API Reference](#api-reference)
6. [Getting Started & Installation](#getting-started--installation)
   - [Prerequisites](#prerequisites)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
7. [Default Corporate Credentials](#default-corporate-credentials)
8. [Automated Testing & Verification](#automated-testing--verification)
9. [Project Structure](#project-structure)
10. [License & Compliance](#license--compliance)

---

## System Architecture

The application adopts a decoupled, high-performance client-server architecture:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          Vite + React 19 + Tailwind CSS 4                              │
│  ┌──────────────────────┬───────────────────────┬──────────────────────┬─────────────┐ │
│  │ Metrics & Velocity   │ Timeline / Planner    │ Kanban Governance    │ Defect Hub  │ │
│  │ (Spline & Donut)     │ (Calendar & Agenda)   │ (Stage Boundaries)   │ (7-State)   │ │
│  ├──────────────────────┼───────────────────────┼──────────────────────┼─────────────┤ │
│  │ Document Repository  │ Video Meetings & MoM  │ Team & Access Gov.   │ API Studio  │ │
│  │ (Stage File Trees)   │ (Virtual Reviews)     │ (RBAC Provisioning)  │(Chained 2S) │ │
│  └──────────────────────┴───────────────────────┴──────────────────────┴─────────────┘ │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
│ RESTful APIs + JWT Auth Bearer Tokens
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                          Flask 3.0 Application Server                                  │
│  ┌──────────────────────┬───────────────────────┬──────────────────────┬─────────────┐ │
│  │ Auth & RBAC Guards   │ Defect State Machine  │ Governance Controller│ CORS Proxy  │ │
│  │ (@token_required)    │ (Transition Rules)    │ (Tasks, Milestones)  │ (HTTP Exec) │ │
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

### 1. Executive Overview & Delivery Analytics
- **Live Governance KPIs**: Real-time visibility into Total Tasks, Active Workload (In Progress), Critical Defects (with live pulse indicator), and Overall Stage Completion percentage.
- **Task Completion Velocity**: Spline trend chart tracking daily sprint throughput and delivery progression.
- **Workflow Distribution**: Donut analytics breaking down distribution across `Completed`, `In Progress`, and `Planned / Backlog`.
- **Task Priority Breakdown**: Proportional risk meters categorizing active deliverables across `Critical`, `High`, `Medium`, and `Low` priorities.
- **SDLC Stage Velocity**: Phase-by-phase completion progress across all SDLC stages (Requirements, Architecture, Implementation, VAPT, Acceptance).

### 2. Department Stage Ownership & Governance Boundary
- **Phase-Governing Teams**: Each SDLC project phase is bound to a specific governing department (e.g., *Business Analysis*, *Architecture & Design*, *Software Engineering*, *Quality Assurance*, *Compliance*, *Operations & Release*).
- **Universal View-Only Visibility**: Authenticated users can view stages, cards, timelines, files, and specifications across all departments without restriction.
- **Strict Mutation Enforcement**:
  - Task cards inside a stage can only be edited, reassigned, or have their status changed by:
    1. Assigned Team Members of the task.
    2. Department Heads (`DEPT_HEAD`) of the governing department.
    3. Super Administrators (`SUPER_ADMIN`).
  - Users outside the governing department receive informative view-only banners and disabled controls.

### 3. Multi-Tier Role-Based Access Control (RBAC)
- **`SUPER_ADMIN`**: Full enterprise authority. User provisioning, directory approvals, project initialization, dynamic phase creation, system database resets, and master audit overrides.
- **`DEPT_HEAD`**: Departmental operational authority. Full mutation control over deliverables, timelines, meetings, and defects governed by their department.
- **`TEAM_MEMBER`**: Direct execution. Mutates assigned tasks, reports defects, and updates progress within authorized project stages; view-only access across other departments.

### 4. SDLC Kanban Board & Task Governance
- **Three-Tier Workflow Columns**: Clean visual drag-and-drop / 1-click status transitions across `PLANNED / BACKLOG`, `IN PROGRESS`, and `COMPLETED`.
- **Card Metadata Badges**: Explicit badges for priority level, governing SDLC phase tags, target delivery date, assignee avatar pills, and sub-task progress counters.
- **Sub-task Checklists**: Interactive checklists with real-time percentage completion calculations and dynamic visual progress bars.
- **Phase Filter Switching**: Dropdown filtering to view all stages concurrently or scope directly down to a single department's phase.

### 5. Timeline & Milestone Schedule Planner
- **Dual Visual Modes**:
  - **Grid Calendar View**: Interactive monthly calendar mapping deliverables to scheduled deadlines, flagged with color-coded priority and stage pills.
  - **Agenda List View**: Chronological delivery itinerary grouped by month with direct status and risk indicators.
- **Milestone Metric Banners**: Real-time month-level rollups for Total Deliverables, Active In-Progress count, Completed count, and High/Critical Risk count.
- **Stage Scoping**: Quick filters to isolate milestones for specific SDLC governance phases.

### 6. Project Documents & Stage Repository
- **Centralized Document Vault**: Unified artifact repository storing requirements specifications (BRD/SRS), PCI-DSS threat models, architecture schemas, and audit evidence.
- **Hierarchical Directory Tree**: Create folders and sub-folders scoped globally or per SDLC Stage.
- **Document Metadata & Management**: Displays file extension tags, file size footprint, author attribution, 1-click downloads, and deletion safeguards.

### 7. Defect & Bug Lifecycle Tracking Module
- **7-State Lifecycle Progression**:
  - `NEW` ➔ `ASSIGNED` ➔ `IN_PROGRESS` ➔ `RESOLVED` ➔ `VERIFIED` ➔ `CLOSED` (with rejection loops to `REOPENED`).
- **Segregation of Duties (SOD)**:
  - **Developers**: Can accept and resolve defects (`ASSIGNED` ➔ `IN_PROGRESS` ➔ `RESOLVED`).
  - **QA Leads & Reporters**: Sole authority to verify (`VERIFIED`), formally close (`CLOSED`), or reject solutions (`REOPENED`). Developers attempting unauthorized verification receive `403 Forbidden`.
  - **Super Admins**: Full transition override permissions.
- **Multi-Console Switcher**: Toggle defect views across **Kanban State Board**, **Compact Grid Cards**, or **Dense Tabular Grid**.
- **Defect Metrics**: Instant count tiles for Total Defects, Critical Severity, In Triage/Fix, QA Verified, and Resolution Velocity Rate.

### 8. API Management & Chained Execution Studio
- **Multi-Environment Vault**: Switch dynamically between `Local Backend`, `Development (Sandbox)`, `Staging (UAT)`, and `Production (Live)`.
- **Dynamic Syntax Interpolation**: Reusable variable substitution using double curly brace syntax (`{{baseUrl}}`, `{{token}}`).
- **2-Step Dependent Chained Pipeline**:
  - **Step 1 (Auth / Token Issuer)**: Dispatches credentials and extracts target response keys (e.g., `response.body.token` into runtime variable `step1_token`).
  - **Step 2 (Downstream Endpoint)**: Locked by default; automatically unlocks when Step 1 succeeds and injects `Bearer {{step1_token}}` into headers or URLs.
- **Server-Side CORS Proxy**: Built-in backend proxy (`POST /api/proxy/execute`) that forwards external HTTP/HTTPS calls via Python `requests`, bypassing browser CORS locks while capturing response latency (`time_ms`) and payload size (`size_bytes`).

### 9. Corporate Video Meetings & MoM Engine
- **Virtual Stage Gate Reviews**: Integrated virtual meeting rooms for architectural review boards (ARB), sprint sign-offs, and audit discussions.
- **Instant & Scheduled Sessions**: Launch ad-hoc governance meetings (`Instant`) or schedule forward-looking review milestones with stage linkage.
- **Minutes of Meeting (MoM) Archiving**: Immutable recording of discussions, compliance decisions, and action items accessible under the `Past MoMs` repository.

### 10. Corporate Team & Access Governance
- **Employee Directory Console**: Centralized user provisioning drawer (`+ Add Corporate User`) and management console.
- **Multi-Dimensional Filters**: Filter corporate staff by department or search directly by employee name and corporate email.
- **Lifecycle & Permission Management**: Inline role assignment (`SUPER_ADMIN`, `DEPT_HEAD`, `TEAM_MEMBER`), status management (`APPROVED`, `PENDING`, `REJECTED`), and safe employee offboarding with active admin self-deletion guards.

### 11. Compliance Audit Trail & Activity Feed
- **ISO 20022 Ready Ledger**: Permanent append-only database audit log recording all phase shifts, state transitions, deliverable modifications, and user identity events.
- **Multi-Dimensional Audit Filtering**: Filter logs by action type (`All Activity`, `Status Shifts`, `Stage Moves`, `Creations`, `Task Edits`).
- **Chronological Timeframe Scoping**: Preset time filters (`Last 7 Days`, `Last 30 Days`, `Archive >30d`) with expandable historical activity drawers.

### 12. Theme Parity & UI Engineering
- **Dual Corporate Themes**:
  - **Light Theme**: Clean `#f8fafc` banking portal styling with crisp border hierarchy and subtle indigo/violet accents.
  - **Dark Theme**: Low-glare `#090a12` dark surface with emerald and purple status accents.
- **Collapsible Responsive Navigation**: Fixed sidebar navigation with toggleable compact mode, displaying corporate branding and active workspace status.
- **Persistent State**: Theme preference and sidebar collapse state stored across sessions in `localStorage`.

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
│ status: Planned|In Prog|Done    │   │   ├─────────────────────────────────┤
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
└─────────────────────────────────┘   │                    │
                                      │   ┌────────────────▼────────────────┐
┌─────────────────────────────────┐   │   │            Meeting              │
│            StageFile            │   │   ├─────────────────────────────────┤
├─────────────────────────────────┤   │   │ id: Integer (PK)                │
│ id: Integer (PK)                │   │   │ project_id: Integer (FK)        │
│ project_id: Integer (FK)        │   │   │ phase_id: Integer (FK, Optional)│
│ phase_id: Integer (FK, Optional)│   │   │ title: String(200)              │
│ filename: String(255)           │   │   │ scheduled_at: DateTime          │
│ file_path: String(500)          │   │   │ mom_notes: Text                 │
│ file_size: Integer              │   │   │ status: UPCOMING|COMPLETED      │
│ is_folder: Boolean              │   │   │ host_id: Integer (FK)           │
│ parent_id: Integer (FK, Self)   │   │   └────────────────┬────────────────┘
│ uploaded_by_id: Integer (FK)────┼───┤                    │
└─────────────────────────────────┘   │   ┌────────────────▼────────────────┐
                                      │   │           ActivityLog           │
                                      │   ├─────────────────────────────────┤
                                      └───┤ id: Integer (PK)                │
                                          │ project_id: Integer (FK)        │
                                          │ bug_id: Integer (FK, Optional)  │
                                          │ task_id: Integer (FK, Optional) │
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
| `POST` | `/api/auth/register` | Public | Register new corporate account (defaults to `PENDING`) |
| `POST` | `/api/auth/login` | Public | Authenticate email/password, returns JWT token |
| `GET` | `/api/auth/profile` | Authenticated | Retrieve current user profile |
| `PUT` | `/api/auth/profile` | Authenticated | Update user name, phone, department, bio |
| `POST` | `/api/auth/profile/avatar` | Authenticated | Upload profile avatar (`multipart/form-data`) |
| `PUT` | `/api/auth/change-password` | Authenticated | Verify existing password and set new password |

### 2. Analytics & Overview
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/projects/<id>/metrics` | Authenticated | Fetch sprint velocity, completion %, and priority breakdowns |
| `GET` | `/api/projects/<id>/milestones` | Authenticated | Fetch deliverable schedule scoped to calendar months |

### 3. SDLC Tasks & Kanban Board
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/tasks?project_id=<id>`| Authenticated | Get all tasks for active project |
| `POST` | `/api/tasks` | Gov. Dept / Admin | Create a task within department boundary |
| `PUT` | `/api/tasks/<id>` | Gov. Dept / Assignee | Update task title, description, priority, or checklist |
| `PATCH`| `/api/tasks/<id>/status` | Gov. Dept / Assignee | Transition status (`PLANNED` -> `IN PROGRESS` -> `COMPLETED`) |
| `PATCH`| `/api/tasks/<id>/shift-stage`| Gov. Dept / Admin | Shift task to a different SDLC stage |
| `DELETE`| `/api/tasks/<id>` | Gov. Dept / Admin | Delete task and log activity audit |

### 4. Defect & Bug Lifecycle Tracking
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/projects/<id>/bugs` | Authenticated | List project bugs with multi-filter queries |
| `POST` | `/api/phases/<phaseId>/bugs` | Authenticated | Report a new defect bound to an SDLC phase |
| `PATCH`| `/api/bugs/<id>/status` | Role-Gated | Update state (`NEW`->`ASSIGNED`->`IN_PROGRESS`->`RESOLVED`->`VERIFIED`->`CLOSED`) |
| `GET` | `/api/bugs/<id>/history` | Authenticated | Fetch full chronological audit timeline |
| `PUT` | `/api/bugs/<id>` | Gov. Dept / Admin | Update defect title, description, severity, or assignee |
| `DELETE`| `/api/bugs/<id>` | Super Admin / QA | Remove defect record and audit event |

### 5. Document & File Management
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/files?project_id=<id>`| Authenticated | List files and folders for active stage/project |
| `POST` | `/api/files/upload` | Gov. Dept / Admin | Upload file attachment (`multipart/form-data`) |
| `POST` | `/api/files/folder` | Gov. Dept / Admin | Create a directory folder in the stage repository |
| `GET` | `/api/files/download/<id>` | Authenticated | Download artifact attachment |
| `DELETE`| `/api/files/<id>` | Gov. Dept / Admin | Delete file or folder hierarchy |

### 6. Meetings & Governance Reviews
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/projects/<id>/meetings` | Authenticated | List upcoming and past governance review sessions |
| `POST` | `/api/projects/<id>/meetings` | Gov. Dept / Admin | Schedule a virtual review session or instant meeting |
| `POST` | `/api/meetings/<id>/mom` | Gov. Dept / Admin | Record and archive Minutes of Meeting notes |

### 7. User Management & Audit Trail
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/admin/users` | Super Admin | Fetch all registered corporate users |
| `POST` | `/api/admin/users` | Super Admin | Provision a pre-approved corporate user account |
| `PUT` | `/api/admin/users/<id>` | Super Admin | Update user Name, Department, Role, and Status |
| `DELETE` | `/api/admin/users/<id>` | Super Admin | Safe user deletion with task re-assignment guards |
| `GET` | `/api/projects/<id>/activities` | Authenticated | Query regulatory audit logs with type and date filters |
| `POST` | `/api/projects/reset-db` | Super Admin | Factory database reset and default data seeding |

### 8. API Studio CORS Proxy
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/proxy/execute` | Public / Auth | Forward HTTP request, bypass CORS, return timing & size |

---

## Getting Started & Installation

### Prerequisites
- **Python**: Version 3.10, 3.11, or 3.12+
- **Node.js**: Version 18.0+ or 20.0+ (with npm)
- **PostgreSQL** *(Optional)*: Default connects to PostgreSQL at `localhost:5432/sdlc_governance` with seamless automatic fallback to local SQLite (`sdlc_governance.db`).

---

### Backend Setup

1. **Navigate to the backend directory**:
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

## Automated Testing & Verification

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
│   ├── app.py                  # Primary Flask server & REST API endpoints
│   ├── config.py               # Database URI & file upload configuration
│   ├── models.py               # SQLAlchemy ORM schemas & serialization logic
│   ├── requirements.txt        # Backend Python dependencies
│   ├── reset_db_schema.py      # Database seeder & default records
│   ├── test_meetings.py        # Automated test suite for Meetings & MoM
│   ├── verify_backend.py       # End-to-end backend verification script
│   ├── .env                    # Environment credentials & database URI
│   └── uploads/                # Local storage for avatars and stage attachments
│       └── avatars/            # Cropped user profile pictures
├── frontend/
│   ├── index.html              # HTML entry point
│   ├── package.json            # Node.js dependencies & build scripts
│   ├── vite.config.js          # Vite bundler configuration
│   └── src/
│       ├── App.jsx             # Main dashboard orchestrator & navigation router
│       ├── main.jsx            # React root mount
│       ├── index.css           # Tailwind CSS 4 directives & design tokens
│       ├── assets/
│       │   └── bahl-logo.png   # Official Bank AL Habib Limited emblem
│       ├── hooks/
│       │   └── useStagePermission.js # Stage RBAC boundary enforcement hook
│       └── components/
│           ├── Sidebar.jsx             # Collapsible branded sidebar navigation
│           ├── OverviewMetrics.jsx     # Analytics dashboard, velocity charts & KPIs
│           ├── KanbanBoard.jsx         # SDLC Stage-gated Kanban task board
│           ├── TimelinePlanner.jsx     # Calendar & Agenda milestone scheduler
│           ├── StageFilesView.jsx      # Hierarchical stage artifact & document vault
│           ├── BugTracker.jsx          # Enterprise 7-State Defect Governance Console
│           ├── ApiStudio.jsx           # Insomnia/Postman API Studio & Chained Runner
│           ├── MeetingsView.jsx        # Governance meetings schedule & MoM archive
│           ├── MeetingRoom.jsx         # Virtual review session video workspace
│           ├── TeamApprovalsView.jsx   # Team access governance & user directory
│           ├── AuditTrailView.jsx      # Regulatory activity feed & immutable ledger
│           ├── SnippetDrawer.jsx       # API code snippet generation drawer
│           └── UploadConfirmModal.jsx  # Stage document upload confirmation modal
└── README.md                   # Complete system technical documentation
```

---

## License & Compliance

Developed for internal regulatory operations at Bank AL Habib Limited. Designed to comply with ISO 20022, PCI-DSS, and enterprise regulatory compliance frameworks.

