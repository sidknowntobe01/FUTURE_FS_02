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

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) running locally (`mongod`) **or** a MongoDB Atlas URI

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd "task 2"
```

### 2. Setup Backend
```bash
cd backend
npm install
# Edit .env if needed (MONGO_URI, JWT_SECRET, etc.)
npm run seed     # Seed DB with admin + sample leads
npm run dev      # Starts at http://localhost:5000
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
# Edit .env if needed (VITE_API_URL)
npm run dev      # Starts at http://localhost:5173
```

### 4. Login
Open http://localhost:5173 and log in with:
- **Email:** `admin@leadcrm.com`
- **Password:** `Admin@123`

## 🔐 Environment Variables

### `backend/.env`
| Variable | Description | Default |
|---|---|---|
| `PORT` | API server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/lead-crm` |
| `JWT_SECRET` | Secret key for JWT signing | *(change this!)* |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:5173` |
| `ADMIN_EMAIL` | Default admin email (seed) | `admin@leadcrm.com` |
| `ADMIN_PASSWORD` | Default admin password (seed) | `Admin@123` |

### `frontend/.env`
| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Admin login |
| `GET` | `/api/auth/me` | Get current user |
| `GET` | `/api/leads/stats` | Dashboard stats |
| `GET` | `/api/leads` | List leads (+ search/filter/page) |
| `POST` | `/api/leads` | Create lead |
| `GET` | `/api/leads/:id` | Get single lead |
| `PUT` | `/api/leads/:id` | Update lead |
| `DELETE` | `/api/leads/:id` | Delete lead |
| `POST` | `/api/leads/:id/notes` | Add note |
| `DELETE` | `/api/leads/:id/notes/:noteId` | Delete note |

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6, Axios |
| Styling | Vanilla CSS (dark glassmorphism) |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose |
| Auth | JWT (jsonwebtoken, bcryptjs) |

## 🔒 Security Notes

- Passwords hashed with bcrypt (12 rounds)
- All lead routes protected by JWT middleware
- `.env` is gitignored — never commit secrets
- Change `JWT_SECRET` before deploying to production

## 📝 License

MIT
