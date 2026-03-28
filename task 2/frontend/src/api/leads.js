import api from './axios'

export const leadsApi = {
  getStats: async () => {
    const { data } = await api.get('/leads/stats')
    return data
  },
  getLeads: async (params = {}) => {
    const { data } = await api.get('/leads', { params })
    return data
  },
  getLeadById: async (id) => {
    const { data } = await api.get(`/leads/${id}`)
    return data
  },
  createLead: async (lead) => {
    const { data } = await api.post('/leads', lead)
    return data
  },
  updateLead: async (id, lead) => {
    const { data } = await api.put(`/leads/${id}`, lead)
    return data
  },
  deleteLead: async (id) => {
    const { data } = await api.delete(`/leads/${id}`)
    return data
  },
  addNote: async (id, text) => {
    const { data } = await api.post(`/leads/${id}/notes`, { text })
    return data
  },
  deleteNote: async (id, noteId) => {
    const { data } = await api.delete(`/leads/${id}/notes/${noteId}`)
    return data
  },
}
