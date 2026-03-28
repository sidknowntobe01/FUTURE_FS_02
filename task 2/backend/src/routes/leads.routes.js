const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');
const {
  getStats,
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  addNote,
  deleteNote,
} = require('../controllers/leads.controller');

// All routes are protected with JWT
router.use(protect);

// Stats — MUST be before /:id to avoid conflict
router.get('/stats', getStats);

// CRUD
router.get('/', getLeads);
router.post('/', createLead);
router.get('/:id', getLeadById);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

// Notes
router.post('/:id/notes', addNote);
router.delete('/:id/notes/:noteId', deleteNote);

module.exports = router;
