# Lead CRM 🎯

A full-stack **Client Lead Management System** built with React, Node.js/Express, and MongoDB.

## ✨ Features

- **Secure Admin Login** — JWT-based authentication
- **Dashboard** — Stats cards, funnel chart, pipeline health, recent leads
- **Lead Management** — Create, view, edit, delete leads
- **Status Tracking** — New → Contacted → Qualified → Converted / Lost
- **Notes & Follow-ups** — Per-lead timestamped notes
- **Search & Filter** — Live search by name/email/company + status filter pills
- **Pagination** — Handles large lead lists efficiently

## 🏗 Project Structure

```
task 2/
├── backend/        # Node.js + Express + MongoDB API
│   ├── src/
│   │   ├── config/       # DB connection
│   │   ├── controllers/  # Business logic
│   │   ├── middleware/   # JWT auth
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API routes
│   │   └── seed.js       # Database seeder
│   ├── .env
│   ├── .env.example
│   └── server.js
│
└── frontend/       # React + Vite
    ├── src/
    │   ├── api/          # Axios API helpers
    │   ├── components/   # Sidebar, LeadModal, ProtectedRoute
    │   ├── context/      # AuthContext (JWT)
    │   └── pages/        # Login, Dashboard, Leads
    ├── .env
    └── .env.example
```


- All lead routes protected by JWT middleware
- `.env` is gitignored — never commit secrets
- Chan
