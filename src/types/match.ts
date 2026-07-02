export interface Ratings {
  atmosphere: number // Atmosphäre
  ambience: number // Ambiente & Stadionqualität
  food: number // Essen & Getränke
  travel: number // Anreise & Erreichbarkeit
  fanculture: number // Fankultur
  security: number // Polizei & Sicherheit
}

export type Visibility = 'PUBLIC' | 'PRIVATE'

export interface MatchEntry {
  id: number
  homeTeam: string
  awayTeam: string
  stadium: string
  city: string
  country: string
  date: string // ISO date
  score: string
  attendance: number
  weather: string
  ratings: Ratings
  note: string
  visibility: Visibility
  reporterName?: string // nur relevant in Public
  userId?: string
}

export function averageRating(r: Ratings): number {
  const values = Object.values(r)
  return values.reduce((sum, v) => sum + v, 0) / values.length
}
