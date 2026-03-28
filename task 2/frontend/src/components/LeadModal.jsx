import { useState, useEffect } from 'react'
import { leadsApi } from '../api/leads'

const SOURCES = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email', 'Other']
const STATUSES = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost']

const statusColor = {
  New: 'new', Contacted: 'contacted', Qualified: 'qualified',
  Converted: 'converted', Lost: 'lost',
}

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const formatTime = (d) =>
  new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

// ─── Main Modal ──────────────────────────────────────────────
const LeadModal = ({ mode = 'create', lead, onClose, onSave }) => {
  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  const [tab, setTab] = useState('details')
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', source: 'Website', status: 'New', assignedTo: '',
    ...lead,
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [currentLead, setCurrentLead] = useState(lead || null)

  // Reload lead data when viewing to get latest notes
  useEffect(() => {
    if (lead?._id && mode === 'view') {
      leadsApi.getLeadById(lead._id).then(setCurrentLead).catch(() => {})
    }
  }, [lead?._id, mode])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      let saved
      if (isEdit && lead?._id) {
        saved = await leadsApi.updateLead(lead._id, form)
      } else {
        saved = await leadsApi.createLead(form)
      }
      onSave(saved)
      onClose()
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to save. Try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleAddNote = async () => {
    if (!noteText.trim() || !currentLead?._id) return
    setAddingNote(true)
    try {
      const updated = await leadsApi.addNote(currentLead._id, noteText.trim())
      setCurrentLead(updated)
      setNoteText('')
    } catch {
      // silent
    } finally {
      setAddingNote(false)
    }
  }

  const handleDeleteNote = async (noteId) => {
    if (!currentLead?._id) return
    try {
      const updated = await leadsApi.deleteNote(currentLead._id, noteId)
      setCurrentLead(updated)
    } catch {}
  }

  const handleStatusChange = async (newStatus) => {
    if (!currentLead?._id) return
    try {
      const updated = await leadsApi.updateLead(currentLead._id, { status: newStatus })
      setCurrentLead(updated)
      onSave(updated)
    } catch {}
  }

  // View mode content
  const renderView = () => (
    <>
      {/* Tabs */}
      <div className="modal-tabs">
        <button className={`modal-tab ${tab === 'details' ? 'active' : ''}`} onClick={() => setTab('details')}>Details</button>
        <button className={`modal-tab ${tab === 'notes' ? 'active' : ''}`} onClick={() => setTab('notes')}>
          Notes {currentLead?.notes?.length > 0 && `(${currentLead.notes.length})`}
        </button>
      </div>

      {tab === 'details' && (
        <div className="modal-body">
          {/* Status selector */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Status</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`filter-pill ${currentLead?.status === s ? `active-${s.toLowerCase()}` : ''}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--glass-border)' }} />

          {/* Fields grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px' }}>
            <ViewField label="Name" value={currentLead?.name} />
            <ViewField label="Email" value={currentLead?.email} />
            <ViewField label="Phone" value={currentLead?.phone || '—'} />
            <ViewField label="Company" value={currentLead?.company || '—'} />
            <ViewField label="Source" value={<span className="source-badge">{currentLead?.source}</span>} />
            <ViewField label="Assigned To" value={currentLead?.assignedTo || '—'} />
            <ViewField label="Created" value={currentLead?.createdAt ? formatDate(currentLead.createdAt) : '—'} />
            <ViewField label="Updated" value={currentLead?.updatedAt ? formatDate(currentLead.updatedAt) : '—'} />
          </div>
        </div>
      )}

      {tab === 'notes' && (
        <div className="modal-body">
          {/* Notes list */}
          {(currentLead?.notes?.length || 0) === 0 ? (
            <div className="notes-empty">
              <div style={{ fontSize: 32, marginBottom: 8 }}>📝</div>
              No notes yet. Add your first one below.
            </div>
          ) : (
            <div className="notes-list">
              {[...(currentLead?.notes || [])].reverse().map((n) => (
                <div key={n._id} className="note-item">
                  <div className="note-text">{n.text}</div>
                  <div className="note-meta">
                    <span className="note-date">{formatTime(n.createdAt)}</span>
                    <button
                      onClick={() => handleDeleteNote(n._id)}
                      className="btn btn-xs btn-danger"
                    >Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add note */}
          <div className="notes-add-form">
            <textarea
              id="note-input"
              placeholder="Add a follow-up note…"
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAddNote() }}
            />
            <button
              id="btn-add-note"
              className="btn btn-primary"
              onClick={handleAddNote}
              disabled={addingNote || !noteText.trim()}
              style={{ alignSelf: 'flex-end' }}
            >
              {addingNote ? <span className="spinner" /> : 'Add'}
            </button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Ctrl+Enter to submit</div>
        </div>
      )}

      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={onClose}>Close</button>
      </div>
    </>
  )

  // Create / Edit form
  const renderForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        {errors.submit && (
          <div className="alert alert-error">{errors.submit}</div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="lead-name">Full Name *</label>
            <input id="lead-name" className={`form-input ${errors.name ? 'error' : ''}`} placeholder="Alice Johnson"
              value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="lead-email">Email *</label>
            <input id="lead-email" type="email" className={`form-input ${errors.email ? 'error' : ''}`} placeholder="alice@example.com"
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="lead-phone">Phone</label>
            <input id="lead-phone" className="form-input" placeholder="+1 555-0101"
              value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="lead-company">Company</label>
            <input id="lead-company" className="form-input" placeholder="Acme Corp"
              value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="lead-source">Source</label>
            <select id="lead-source" className="form-select"
              value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}>
              {SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="lead-status">Status</label>
            <select id="lead-status" className="form-select"
              value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="lead-assigned">Assigned To</label>
          <input id="lead-assigned" className="form-input" placeholder="Team member name"
            value={form.assignedTo} onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))} />
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button id="btn-save-lead" type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <><span className="spinner" /> Saving…</> : isEdit ? 'Save Changes' : 'Add Lead'}
        </button>
      </div>
    </form>
  )

  return (
    <div className="modal-overlay" id="lead-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === 'create' ? '➕ New Lead' : mode === 'edit' ? '✏️ Edit Lead' : `👤 ${currentLead?.name || 'Lead Details'}`}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">✕</button>
        </div>
        {isView ? renderView() : renderForm()}
      </div>
    </div>
  )
}

// Small helper component
const ViewField = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{value}</div>
  </div>
)

export default LeadModal
