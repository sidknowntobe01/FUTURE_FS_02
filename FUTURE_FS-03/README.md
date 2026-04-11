# Ydv Core Fitness  — Gym Management Website

A full-stack professional gym website with an owner dashboard for managing members, tracking joinings, and monitoring business growth.

---

## Features

### Public Website
- Beautiful warm-themed landing page
- Services, classes, pricing, testimonials, contact form
- Online membership registration (multi-step form)
- Fully responsive (mobile, tablet, desktop)

### Owner Dashboard
| Feature | Description |
|---|---|
| 📊 Overview | Stats, revenue, charts |
| 👥 All Members | Full member list with search & filter |
| 🆕 New Joinings | This month's new members |
| ✅ Active Members | Currently active memberships |
| ⏳ Expired | Lapsed memberships needing renewal |
| 🚪 Left the Gym | Members who have churned |
| ➕ Add/Edit/Delete | Full CRUD on every member |

---

## Quick Start

### 1. Prerequisites
- Node.js >= 18
- MongoDB running locally (or MongoDB Atlas URI)

### 2. Install Backend
```bash
cd backend
npm install
```

### 3. Configure .env
Edit `backend/.env` with your MongoDB URI and credentials.

### 4. Seed the Database (creates admin + demo members)
```bash
cd backend
npm run seed
```

### 5. Start the Backend Server
```bash
cd backend
npm run dev
```

### 6. Open the Frontend
Open `frontend/index.html` in Live Server (VS Code) or any static file server.

Or use the VS Code Live Server extension pointing to the `frontend/` folder.

---


```
> Change these in `backend/.env` before going live!

---

## Project Structure
```
task 3/
├── frontend/
│   ├── index.html          ← Public landing page
│   ├── join.html           ← Membership registration
│   ├── css/
│   │   ├── main.css        ← Public website styles (warm theme)
│   │   └── dashboard.css   ← Admin dashboard styles
│   ├── js/
│   │   ├── main.js         ← Landing page JS
│   │   ├── join.js         ← Registration form JS
│   │   └── dashboard.js    ← Full dashboard JS (charts, CRUD)
│   └── admin/
│       ├── login.html      ← Owner login page
│       └── dashboard.html  ← Owner management dashboard
│
├── backend/
│   ├── server.js           ← Express server entry point
│   ├── .env                ← Environment variables (secrets)
│   ├── models/
│   │   ├── Member.js       ← Member schema (Mongoose)
│   │   └── Admin.js        ← Admin schema (Mongoose)
│   ├── routes/
│   │   ├── auth.js         ← Login / seed routes
│   │   ├── members.js      ← Member CRUD + public register
│   │   └── stats.js        ← Aggregated dashboard stats
│   ├── middleware/
│   │   └── auth.js         ← JWT protect middleware
│   ├── seed.js             ← Database seeder
│   └── package.json
│
└── README.md
```

---

## Design System
- **Theme**: Light and Warm
- **Primary**: `#F97316` (Vibrant Orange)
- **Secondary**: `#FBBF24` (Amber)
- **Background**: `#FFFBF5` (Warm White)
- **Font**: Outfit (headings) + Inter (body)

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Admin login | No |
| POST | `/api/auth/seed` | Create default admin | No |
| GET | `/api/members` | List all members | ✅ |
| POST | `/api/members` | Add member | ✅ |
| GET | `/api/members/:id` | Get one member | ✅ |
| PUT | `/api/members/:id` | Update member | ✅ |
| DELETE | `/api/members/:id` | Delete member | ✅ |
| PATCH | `/api/members/:id/status` | Update status | ✅ |
| POST | `/api/members/public/register` | Public registration | No |
| GET | `/api/stats` | Dashboard stats | ✅ |

---

## Business Pitch

> **"Ydv Core Fitness isn't just a gym — it's a brand."**

This website solves 3 key business problems:
1. **Visibility** — A stunning online presence attracts new walk-ins 24/7
2. **Operations** — The owner dashboard replaces paper registers with real-time member management
3. **Retention** — Expired member tracking lets you follow up and win back customers



---

Made by Siddharth yadav 
