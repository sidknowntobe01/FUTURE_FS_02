import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Sidebar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">🎯</div>
        <div>
          <div className="logo-title">LeadCRM</div>
          <div className="logo-subtitle">Admin Panel</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main</div>

        <NavLink
          to="/"
          end
          id="nav-dashboard"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          Dashboard
        </NavLink>

        <NavLink
          to="/leads"
          id="nav-leads"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Leads
          <LeadCount />
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'A'}</div>
          <div style={{ minWidth: 0 }}>
            <div className="user-name">{user?.name || 'Admin'}</div>
            <div className="user-email">{user?.email || ''}</div>
          </div>
        </div>
        <button id="btn-logout" className="logout-btn" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </aside>
  )
}

// Small live counter badge
import { useEffect, useState } from 'react'
import { leadsApi } from '../api/leads'
const LeadCount = () => {
  const [count, setCount] = useState(null)
  useEffect(() => {
    leadsApi.getStats().then(d => setCount(d.total)).catch(() => {})
  }, [])
  if (!count) return null
  return (
    <span style={{
      marginLeft: 'auto',
      fontSize: 11,
      fontWeight: 700,
      background: 'rgba(124,107,255,0.15)',
      color: '#a394ff',
      padding: '2px 7px',
      borderRadius: 10,
      border: '1px solid rgba(124,107,255,0.25)',
    }}>{count}</span>
  )
}

export default Sidebar
