# RELEASETRACK — “Live. Test. Monitor.”

> **Enterprise QA and Multi-University Release Tracking Application**  
> Complete production-ready full-stack application built with React, TypeScript, Tailwind CSS, Node.js, Express, and MongoDB.

---

## 🌟 Overview & Capabilities

**ReleaseTrack** provides a centralized platform for QA teams and release managers to answer core release lifecycle questions across multi-tenant and standalone university deployments:

1. **What went live today / this month?** — Live KPI cards, Recent Activities feed, and interactive September 2026 Calendar.
2. **Which university received the release?** — 18 universities (IITKGP, Atlas, BDU, CU, DYP, BITS, VIT, SRM, MANIPAL, etc.).
3. **What feature/change was released?** — Master Feature catalog with real-time live matrix status.
4. **Was it a Feature, Enhancement, Bug Fix, or Hotfix?** — Rich badge color coding (Red, Green, Amber, Purple).
5. **Which Jira ticket was associated?** — Direct Jira bug ticket linkage and status tracking.
6. **Was sanity testing completed?** — Sanity reports with test case counters (Passed/Failed/Blocked), notes, and evidence upload.
7. **Which Lead IDs were generated?** — Test lead tracking with CRM (LSQ), Opportunity, and ERP verification status.
8. **What is the live status of a feature?** — Dynamically derived from MongoDB production releases (auto-updates when rolled back).

---

## 🎨 Design Aesthetics & Visual Fidelity

The application implements dual high-fidelity themes accurately matching the reference designs:
- **Dark Mode (Default)**: Deep navy/black surfaces (`#090b10`, `#0f131a`, `#141a24`), glowing crimson accents (`#ef4444`), subtle wave gradients, and crisp dark typography.
- **Light Mode**: Crisp white surfaces (`#ffffff`, `#f8fafc`), clean gray borders (`#e2e8f0`), red badge accents, and high-contrast typography.
- **Interactive Calendar**: September 2026 visual calendar with colored release category dots (Feature, Enhancement, Bug Fix, Hotfix) and click-to-open day inspection drawer.
- **Omnibar Global Search (`⌘ K` / `Ctrl+K`)**: Instant categorized search across universities, releases, features, bugs, and test leads.

---

## 📂 Project Architecture

```
d:\Release Tracking\
  ├── client/                               # Vite + React + TypeScript + Tailwind CSS Frontend
  │   ├── src/
  │   │   ├── api/                          # Axios API client & typed endpoints
  │   │   ├── components/
  │   │   │   ├── common/                   # Badge, Button, Modal, Drawer, Sparkline, DateFilter, Skeleton, EmptyState
  │   │   │   ├── dashboard/                # KpiCard, RecentLiveActivitiesTable, ReleaseCalendarWidget, UniversitiesSummaryCard, FeaturesMatrixCard, LeadTrackingSummaryCard
  │   │   │   ├── layout/                   # Navbar, Sidebar, Layout
  │   │   │   └── search/                   # GlobalOmnibar (Ctrl+K search)
  │   │   ├── context/                      # AuthContext, ThemeContext, EnvironmentContext, NotificationContext
  │   │   ├── pages/                        # Dashboard, Universities, UniversityDetail, LiveReleases, ReleaseDetail, Features, FeatureDetail, BugTickets, SanityReports, LeadTracking, CalendarPage, Reports, AuditLogs, UsersPage, SettingsPage, Login, ForgotPassword, ResetPassword
  │   │   ├── types/                        # TypeScript domain model interfaces
  │   │   ├── test/                         # Frontend Vitest & React Testing Library test suite
  │   │   ├── App.tsx                       # React Router & RBAC Protected Route configuration
  │   │   ├── main.tsx                      # React root entry
  │   │   └── index.css                     # Tailwind tokens & dark/light styling
  │   ├── package.json
  │   └── vite.config.ts
  │
  ├── server/                               # Node.js + Express + TypeScript + Mongoose Backend
  │   ├── src/
  │   │   ├── config/                       # Environment config and database connector (with self-contained MongoDB engine fallback)
  │   │   ├── controllers/                  # Auth, University, Feature, Release, Bug, Sanity, Lead, Calendar, Dashboard, Report, Audit, Search, User, Attachment controllers
  │   │   ├── middleware/                   # JWT Auth, RBAC Authorization, Upload, Rate Limiting, Error Handling
  │   │   ├── models/                       # User, University, Feature, Release, BugTicket, SanityReport, Lead, AuditLog, Notification, Attachment
  │   │   ├── routes/                       # Express REST routes with RBAC protection
  │   │   ├── services/                     # Metrics calculation, Feature matrix service, Audit logging, Excel report exports
  │   │   ├── seed/                         # Rich realistic enterprise database seed script
  │   │   ├── utils/                        # JWT helpers, standard API response formatters
  │   │   ├── app.ts                        # Express app configuration
  │   │   └── server.ts                     # HTTP Server entry point
  │   ├── tests/                            # Backend API, RBAC, and Critical E2E workflow tests
  │   ├── package.json
  │   └── tsconfig.json
  │
  └── package.json                          # Monorepo root scripts
```

---

## 🗄️ MongoDB Collections & Relationships

- `users`: User profiles with bcrypt-hashed passwords and RBAC (`ADMIN`, `QA_LEAD`, `QA_ENGINEER`, `VIEWER`).
- `universities`: University code, name, type (`STANDALONE`, `MULTI_TENANT`), URLs, and primary environment.
- `features`: Master feature catalog and categories (`CORE`, `ADMISSION`, `PAYMENTS`, `LEAD_MANAGEMENT`, `INTEGRATION`, `ANALYTICS`).
- `releases`: Release records linking university, feature, type, environment, release date/time, status (`LIVE`, `ROLLED_BACK`), bug tickets, sanity reports, and leads.
- `bugTickets`: Jira bug tickets with ticket ID (e.g. `UPG-2345`), priority, status, and direct Jira links.
- `sanityReports`: QA sanity reports with test metrics (Total, Passed, Failed, Blocked), tester name, notes, and file attachments.
- `leads`: Test lead IDs (e.g. `LID-90876`) with integration checks for LeadSquared (LSQ), Opportunity, and ERP sync.
- `auditLogs`: Audit history logs tracking every release creation, rollback, bug assignment, report upload, and session event.
- `notifications`: In-app notification alerts with read receipts.
- `attachments`: File metadata storage (PDF, XLSX, CSV, Images, Screenshots).

---

## 🔐 User Roles & Demo Credentials

| Name | Email | Password | Role | Permissions |
|---|---|---|---|---|
| **Shoaib Ahmed** | `shoaib@releasetrack.com` | `Password123!` | `QA_ENGINEER` | Create releases, attach bugs, add test leads, upload sanity reports |
| **Priya Sharma** | `priya@releasetrack.com` | `Password123!` | `QA_LEAD` | QA Engineer permissions + approve & review releases |
| **DevOps Admin** | `admin@releasetrack.com` | `Password123!` | `ADMIN` | Full administrative control (manage users, delete releases, manage universities) |
| **Alex Mercer** | `alex@releasetrack.com` | `Password123!` | `VIEWER` | Read-only inspection access |

---

## 🚀 Quick Start Instructions

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Start Backend and Frontend Concurrently
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`

### 3. Re-seed Database
```bash
npm run seed
```

### 4. Run Test Suites
```bash
# Run server API tests
cd server && npm run test

# Run client component tests
cd client && npm run test
```

### 5. Production Build
```bash
npm run build
```

---

## 🛡️ Key Features & Validation Checklist

- [x] **Secure JWT Authentication & Sessions**
- [x] **Role-Based Access Control (RBAC)** enforced on backend and frontend
- [x] **Real-Time Dynamic KPIs** computed directly from MongoDB (never hardcoded)
- [x] **Feature × University Live Matrix** calculated from active production releases
- [x] **Rollback Dynamic Update** (rolling back a release immediately removes its LIVE matrix status)
- [x] **Interactive Release Calendar** with category dots and date inspection drawer
- [x] **Jira Bug Linking & Tracking** (e.g. `UPG-2345`)
- [x] **QA Sanity Reports & Evidence Upload** with test counters
- [x] **Test Lead Verification** with LSQ, Opportunity, and ERP sync status
- [x] **Global Omnibar Search (`⌘ K`)** with debounced multi-entity results
- [x] **Excel (.xlsx) and CSV Report Exports**
- [x] **Dark / Light Theme Switcher** with localStorage persistence
- [x] **Tamper-Evident Audit Logs**
- [x] **Admin Approval Workflow for Password Resets**
- [x] **Render & Cloud-Ready Deployment Configuration**
