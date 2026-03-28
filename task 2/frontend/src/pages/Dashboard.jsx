import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import LeadModal from '../components/LeadModal'
import { leadsApi } from '../api/leads'

const STATUS_CARDS = [
  { key: 'total',     label: 'Total Leads',  icon: '📊', color: '#7c6bff' },
  { key: 'new',       label: 'New',          icon: '🆕', color: '#7c6bff' },
  { key: 'contacted', label: 'Contacted',    icon: '📞', color: '#00d4ff' },
  { key: 'qualified', label: 'Qualified',    icon: '✅', color: '#f59e0b' },
  { key: 'converted', label: 'Converted',    icon: '🏆', color: '#10b981' },
  { key: 'lost',      label: 'Lost',         icon: '❌', color: '#ef4444' },
]

const FUNNEL = [
  { key: 'new',       label: 'New',       color: '#7c6bff' },
  { key: 'contacted', label: 'Contact.',  color: '#00d4ff' },
  { key: 'qualified', label: 'Qualif.',   color: '#f59e0b' },
  { key: 'converted', label: 'Convert.',  color: '#10b981' },
]

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const statusCls = (s) => `status-badge status-${s.toLowerCase()}`

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentLeads, setRecentLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const navigate = useNavigate()

  const load = async () => {
    try {
      const [s, lr] = await Promise.all([
        leadsApi.getStats(),
        leadsApi.getLeads({ limit: 5, sort: 'createdAt', order: 'desc' }),
      ])
      setStats(s)
      setRecentLeads(lr.leads || [])
    } catch (err) {
      console.error('Dashboard load error', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const maxFunnel = stats ? Math.max(stats.new, stats.contacted, stats.qualified, stats.converted, 1) : 1

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-wrapper fade-in">
          {/* Header */}
          <header className="page-header">
            <div>
              <h1 className="page-title">Dashboard</h1>
              <p className="page-subtitle">Welcome back! Here's what's happening with your leads.</p>
            </div>
            <button
              id="btn-new-lead-dashboard"
              className="btn btn-primary"
              onClick={() => setModal({ mode: 'create' })}
            >
              ＋ Add Lead
            </button>
          </header>

          {/* Stats */}
          <div className="stats-grid">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="stat-card" style={{ animation: 'pulse 1.5s infinite' }}>
                    <div style={{ height: 40, width: 40, background: 'var(--glass)', borderRadius: 10, marginBottom: 12 }} />
                    <div style={{ height: 30, width: '50%', background: 'var(--glass)', borderRadius: 4, marginBottom: 8 }} />
                    <div style={{ height: 12, width: '70%', background: 'var(--glass)', borderRadius: 4 }} />
                  </div>
                ))
              : STATUS_CARDS.map(({ key, label, icon, color }) => (
                  <div key={key} className="stat-card" style={{ '--stat-color': color }}>
                    <div className="stat-icon">{icon}</div>
                    <div className="stat-value">{stats?.[key] ?? 0}</div>
                    <div className="stat-label">{label}</div>
                  </div>
                ))}
          </div>

          {/* Dashboard grid */}
          <div className="dashboard-grid">
            {/* Funnel chart */}
            <div className="chart-placeholder">
              <div className="chart-title">
                <span>Lead Funnel</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>Conversion pipeline</span>
              </div>
              <div className="funnel-bars">
                {FUNNEL.map(({ key, label, color }) => {
                  const val = stats?.[key] ?? 0
                  const pct = Math.max(8, (val / maxFunnel) * 100)
                  return (
                    <div key={key} className="funnel-bar-wrap">
                      <div className="funnel-bar-val" style={{ color }}>{val}</div>
                      <div className="funnel-bar" style={{ height: `${pct}%`, background: color, opacity: 0.8 }} />
                      <div className="funnel-bar-label">{label}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Quick stats donut-style */}
            <div className="chart-placeholder">
              <div className="chart-title">
                <span>Pipeline Health</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Conversion Rate', value: stats?.total ? `${((stats.converted / stats.total) * 100).toFixed(0)}%` : '0%', color: '#10b981' },
                  { label: 'Active Leads', value: stats ? stats.new + stats.contacted + stats.qualified : 0, color: '#7c6bff' },
                  { label: 'Lost Leads', value: stats?.lost ?? 0, color: '#ef4444' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--glass-border)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Leads */}
            <div className="glass-card recent-leads-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--glass-border)' }}>
                <h2 style={{ fontSize: 15, fontWeight: 700 }}>Recent Leads</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leads')}>View All →</button>
              </div>

              {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div className="spinner" style={{ margin: '0 auto', color: 'var(--primary)' }} />
                </div>
              ) : recentLeads.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📋</div>
                  <div className="empty-state-title">No leads yet</div>
                  <div className="empty-state-desc">Add your first lead to get started.</div>
                </div>
              ) : (
                <div className="table-wrapper" style={{ borderRadius: 0, border: 'none' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Company</th>
                        <th>Source</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentLeads.map((lead) => (
                        <tr key={lead._id}>
                          <td>
                            <div className="td-name">{lead.name}</div>
                            <div className="td-email">{lead.email}</div>
                          </td>
                          <td><span className="source-badge">{lead.company || '—'}</span></td>
                          <td><span className="source-badge">{lead.source}</span></td>
                          <td><span className={statusCls(lead.status)}>{lead.status}</span></td>
                          <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatDate(lead.createdAt)}</td>
                          <td>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setModal({ mode: 'view', lead })}
                            >View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {modal && (
        <LeadModal
          mode={modal.mode}
          lead={modal.lead}
          onClose={() => setModal(null)}
          onSave={() => load()}
        />
      )}
    </div>
  )
}

export default Dashboard
