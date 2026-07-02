# Amaanitvam Platform

The official repository for the **Amaanitvam Foundation** platform, consisting of the NGO website, admin portal, dashboard, and backend services.

---

## 📁 Project Structure

```text
amaanitvam-platform/
│
├── backend/                 # Express.js Backend API
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── Website/             # Public NGO Website
│   │   ├── assets/
│   │   │   ├── css/
│   │   │   ├── js/
│   │   │   └── images/
│   │   ├── index.html
│   │   └── ...
│   │
│   └── Portals/
│       ├── admin-portal/    # React/Vite Admin Portal
│       └── dashboard/       # Dashboard Components
│
├── .gitignore
└── README.md
```

---

## 🚀 Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* React (Admin Portal)
* Vite

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Firebase Authentication
* Razorpay Integration
* Nodemailer

---

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd amaanitvam-platform
```

---

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

### 3. Admin Portal

```bash
cd frontend/Portals/admin-portal
npm install
npm run dev
```

Admin Portal runs on:

```
http://localhost:5173
```

---

### 4. Website

Open

```
frontend/Website/index.html
```

or serve it using Live Server.

---

## 🌐 Features

* NGO Website
* Admin Portal
* Team Dashboard
* Candidate Management
* Volunteer Management
* Internship Management
* Donation System
* Gallery Management
* Contact Forms
* Authentication
* Role-Based Authorization
* Reports & Analytics

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend` directory and configure:

* MongoDB URI
* SMTP Credentials
* Firebase Keys
* JWT Secret
* Razorpay Keys

---

## 📄 License

This project is developed for **Amaanitvam Foundation**.

All rights reserved.
