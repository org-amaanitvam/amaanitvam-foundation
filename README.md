<div align="center">
  <h1>🌿 Amaanitvam Platform</h1>
  <p><strong>The official digital ecosystem for the Amaanitvam Foundation</strong></p>
  <p>Empowering Communities Through Technology & Education.</p>
</div>

---

## 📖 About The Project

**Amaanitvam Platform** is a scalable, monorepo-based digital ecosystem designed to manage the foundation's operations. It unifies the public presence, internal team coordination, and administrative management into a single, cohesive architecture.

This platform powers:
- The public NGO website
- The core administrative portal
- The internal team & intern dashboard
- A centralized backend API with 18 distinct domain modules

---

## 🏗️ Architecture & Structure

The platform uses a **Monorepo Architecture** for seamless dependency management and code sharing across applications.

```text
amaanitvam-platform/
├── apps/                  # Frontend Applications
│   ├── admin-portal/      # React: Management portal for administrators
│   ├── dashboard/         # React: Portal for coordinators and team members
│   └── website/           # React/HTML: Public-facing NGO website
├── server/                # Backend Application
│   └── src/
│       ├── config/        # Environment and 3rd-party configs
│       ├── middleware/    # Auth, Validation, Uploads, Rate Limiting
│       ├── modules/       # 18 Domain-driven API modules
│       ├── services/      # Shared services (Email, Storage)
│       └── shared/        # Constants, Errors, Logging utilities
├── packages/              # Shared Monorepo Packages
│   ├── shared-config/     
│   ├── shared-utils/      
│   └── ui/                
└── docs/                  # Platform Documentation
```

---

## 🚀 The Applications

### 🌐 Public Website (`apps/website`)
The face of the foundation. Features include:
* Programs & Impact Gallery
* Volunteer & Internship Applications
* Certificate Verification
* Digital Library & Courses
* Secure Online Donations

### 🛠️ Admin Portal (`apps/admin-portal`)
Secure management system for administrators. Features include:
* Candidate & Member Management
* Content Management System (CMS)
* Gallery & Certificate Issuance
* Donation Tracking & Reports

### 👥 Team Dashboard (`apps/dashboard`)
Internal portal for team members and interns. Features include:
* Task & Project Tracking
* Meetings & Announcements
* Attendance & Department Management

---

## ⚙️ Backend Modules (`server/`)

The API is built using **Node.js/Express** following a strictly modular pattern (`Model → Controller → Service → Routes → Repository`).

| Core Modules | Management Modules | Content Modules | External Modules |
| :--- | :--- | :--- | :--- |
| `auth` | `departments` | `cms` | `donations` |
| `users` | `tasks` | `gallery` | `volunteers` |
| `members` | `meetings` | `certificates` | `internships` |
| `candidates` | `projects` | `courses` | `reports` |
| `notifications` | `announcements` | `digital-library` | |

---

## 💻 Tech Stack

- **Frontend:** React, Vite, HTML5, CSS3
- **Backend:** Node.js, Express.js, Joi (Validation), Winston (Logging)
- **Database:** MongoDB / Mongoose
- **Authentication:** Firebase Authentication (RBAC)
- **Cloud Storage:** Cloudinary
- **Payments:** Razorpay

---

## 🏁 Getting Started

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **npm** installed.

### 2. Installation
Clone the repository and install dependencies from the root directory:
```bash
git clone https://github.com/org-amaanitvam/amaanitvam-foundation.git
cd amaanitvam-foundation
npm install
```

### 3. Environment Variables
Copy the example environment files and fill in your credentials.
```bash
# Server configuration
cp server/.env.example server/.env

# App configurations
cp apps/website/.env.example apps/website/.env
cp apps/admin-portal/.env.example apps/admin-portal/.env
cp apps/dashboard/.env.example apps/dashboard/.env
```

### 4. Running the Development Servers
Take advantage of the NPM Workspaces to run applications individually or concurrently:

```bash
# Start the Backend API
npm run dev:server

# Start the Public Website
npm run dev:website

# Start the Admin Portal
npm run dev:admin

# Start the Team Dashboard
npm run dev:dashboard
```

---

## 🔒 Security & Roles

Security is paramount. The platform enforces:
- JWT Verification via Firebase Admin
- Granular Role-Based Access Control (RBAC)
- Payload Validation via Joi
- API Rate Limiting

**System Roles:**
`super_admin`, `admin`, `coordinator`, `faculty`, `team_member`, `intern`, `content_editor`, `viewer`.

---

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---
<div align="center">
  <p>Made with ❤️ by the Amaanitvam Team</p>
</div>