import { useEffect, useState, useCallback } from 'react'
import Sidebar from '../components/Sidebar'
import LeadModal from '../components/LeadModal'
import { leadsApi } from '../api/leads'

const FILTERS = ['All', 'New', 'Contacted', 'Qualified', 'Converted', 'Lost']

const statusCls = (s) => `status-badge status-${s.toLowerCase()}`
const filterActiveCls = (f, active) => {
  if (f !== active) return 'filter-pill'
  if (f === 'All') return 'filter-pill active'
  return `filter-pill active-${f.toLowerCase()}`
}

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const Leads = () => {
  const [leads, setLeads] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [modal, setModal] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [toast, setToast] = useState(null)
  const LIMIT = 12

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadLeads = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: LIMIT, status: statusFilter }
      if (search.trim()) params.search = search.trim()
      const data = await leadsApi.getLeads(params)
      setLeads(data.leads || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error('Load leads error', err)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, search])

  useEffect(() => { loadLeads() }, [loadLeads])

  // Reset to page 1 on filter/search change
  useEffect(() => { setPage(1) }, [statusFilter, search])

  const handleDelete = async (lead) => {
    if (!window.confirm(`Delete lead "${lead.name}"? This cannot be undone.`)) return
    setDeleting(lead._id)
    try {
      await leadsApi.deleteLead(lead._id)
      showToast(`"${lead.name}" deleted successfully.`)
      loadLeads()
    } catch {
      showToast('Failed to delete lead.', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const handleModalSave = (saved) => {
    showToast(modal?.mode === 'create' ? 'Lead created!' : 'Lead updated!')
    loadLeads()
  }

  // Debounce search
  const [searchInput, setSearchInput] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350)
    return () => clearTimeout(t)
  }, [searchInput])

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-wrapper fade-in">
          {/* Header */}
          <header className="page-header">
            <div>
              <h1 className="page-title">Leads</h1>
              <p className="page-subtitle">
                {total > 0 ? `${total} lead${total !== 1 ? 's' : ''} found` : 'Manage your client leads'}
              </p>
            </div>
            <button
              id="btn-new-lead"
              className="btn btn-primary"
              onClick={() => setModal({ mode: 'create' })}
            >
              ＋ New Lead
            </button>
          </header>

          {/* Toast */}
          {toast && (
            <div className={`alert ${toast.type === 'error' ? 'alert-error' : 'alert-success'}`}
              style={{ marginBottom: 16 }}>
              {toast.type === 'error' ? '⚠️' : '✅'} {toast.msg}
            </div>
          )}

          {/* Search + Filter */}
          <div className="search-filter-bar">
            <div className="search-input-wrap">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                id="leads-search"
                className="search-input"
                placeholder="Search by name, email, or company…"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </div>
            <div className="filter-pills">
              {FILTERS.map(f => (
                <button
                  key={f}
                  id={`filter-${f.toLowerCase()}`}
                  className={filterActiveCls(f, statusFilter)}
                  onClick={() => setStatusFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 12px', width: 32, height: 32, borderWidth: 3, color: 'var(--primary)' }} />
              Loading leads…
            </div>
          ) : leads.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <div className="empty-state-title">No leads found</div>
              <div className="empty-state-desc">
                {search || statusFilter !== 'All'
                  ? 'Try adjusting your search or filter.'
                  : 'Click "New Lead" to add your first lead.'}
              </div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table id="leads-table">
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>Company</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead._id} id={`lead-row-${lead._id}`}>
                      <td>
                        <div className="td-name">{lead.name}</div>
                        <div className="td-email">{lead.email}</div>
                        {lead.phone && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{lead.phone}</div>
                        )}
                      </td>
                      <td>
                        {lead.company
                          ? <span className="source-badge">{lead.company}</span>
                          : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td><span className="source-badge">{lead.source}</span></td>
                      <td>
                        <select
                          className="form-select"
                          value={lead.status}
                          style={{ width: 'auto', fontSize: 12, padding: '4px 28px 4px 10px' }}
                          onChange={async (e) => {
                            const newStatus = e.target.value
                            try {
                              await leadsApi.updateLead(lead._id, { status: newStatus })
                              setLeads(prev => prev.map(l => l._id === lead._id ? { ...l, status: newStatus } : l))
                              showToast(`Status updated to ${newStatus}`)
                            } catch {
                              showToast('Failed to update status.', 'error')
                            }
                          }}
                        >
                          {['New', 'Contacted', 'Qualified', 'Converted', 'Lost'].map(s => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span style={{ fontSize: 13, color: lead.notes?.length ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {lead.notes?.length || 0} note{lead.notes?.length !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                        {formatDate(lead.createdAt)}
                      </td>
                      <td>
                        <div className="td-actions">
                          <button
                            id={`btn-view-${lead._id}`}
                            className="btn btn-ghost btn-sm"
                            title="View details"
                            onClick={() => setModal({ mode: 'view', lead })}
                          >👁</button>
                          <button
                            id={`btn-edit-${lead._id}`}
                            className="btn btn-ghost btn-sm"
                            title="Edit lead"
                            onClick={() => setModal({ mode: 'edit', lead })}
                          >✏️</button>
                          <button
                            id={`btn-delete-${lead._id}`}
                            className="btn btn-danger btn-sm"
                            title="Delete lead"
                            disabled={deleting === lead._id}
                            onClick={() => handleDelete(lead)}
                          >
                            {deleting === lead._id ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> : '🗑'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <span>
                Showing {Math.min((page - 1) * LIMIT + 1, total)}–{Math.min(page * LIMIT, total)} of {total}
              </span>
              <div className="pagination-btns">
                <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
                <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => Math.abs(p - page) <= 2)
                  .map(p => (
                    <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                  ))}
                <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
                <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {modal && (
        <LeadModal
          mode={modal.mode}
          lead={modal.lead}
          onClose={() => setModal(null)}
          onSave={handleModalSave}
        />
      )}
    </div>
  )
}

export default Leads
