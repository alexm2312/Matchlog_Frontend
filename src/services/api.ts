import axios from 'axios'

// Lokal überschreibbar über VITE_API_BASE_URL in .env.local,
// Fallback ist das produktive Backend auf Render.
const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'https://matchlog-backend-12iq.onrender.com'

export const api = axios.create({ baseURL })

export interface RatingsPayload {
  atmosphere: number
  ambience: number
  food: number
  travel: number
  fanculture: number
  security: number
}

export interface VisitPayload {
  homeTeam: string
  awayTeam: string
  stadium: string
  city: string
  country: string
  date: string
  score: string
  attendance: number
  weather: string
  ratings: RatingsPayload
  note: string
  visibility: 'PUBLIC' | 'PRIVATE'
  userId: string
  reporterName?: string
}

export const visitsApi = {
  getMine:  (userId: string) => api.get('/api/visits/me', { params: { userId } }),
  getPublic: () => api.get('/api/visits/public'),
  create:   (visit: VisitPayload) => api.post('/api/visits', visit),
  update:   (id: number, userId: string, visit: VisitPayload) =>
    api.put(`/api/visits/${id}`, visit, { params: { userId } }),
  remove:   (id: number, userId: string) =>
    api.delete(`/api/visits/${id}`, { params: { userId } }),
}

export const footballApi = {
  getMatches: (params: { date?: string; homeTeamName?: string }) =>
    api.get('/api/football/matches', { params }),
  getMatchById: (id: string | number) => api.get(`/api/football/matches/${id}`),
}
