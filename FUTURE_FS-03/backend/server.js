/**
 * Ydv Core Fitness — Backend Server
 * Uses MongoDB (Atlas) via Mongoose
 */

const express  = require('express');
const cors     = require('cors');
const dotenv   = require('dotenv');
const mongoose = require('mongoose');
const path     = require('path');

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// ── Serve Frontend Static Files ──────────────────
const FRONTEND = path.join(__dirname, '..', 'frontend');
app.use(express.static(FRONTEND));

// ── Routes ───────────────────────────────────────
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/members', require('./routes/members'));
app.use('/api/stats',   require('./routes/stats'));

// ── Health Check ─────────────────────────────────
app.get('/api', (req, res) =>
  res.json({ message: '🌅 Ydv Core Fitness API is running!', status: 'OK', storage: 'MongoDB Atlas' })
);

// ── Connect to MongoDB & Start Server ────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log('\n🌅 Ydv Core Fitness Backend');
      console.log(`🚀 Server  →  http://localhost:${PORT}`);
      console.log(`📦 Storage →  MongoDB Atlas`);
      console.log(`📧 Admin   →  ${process.env.ADMIN_EMAIL}`);
      console.log(`🔑 Password→  ${process.env.ADMIN_PASSWORD}`);
      console.log('\n✅ Ready!\n');
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
