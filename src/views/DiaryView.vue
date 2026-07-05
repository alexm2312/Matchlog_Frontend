<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import MatchStub from '@/components/MatchStub.vue'
import StarRating from '@/components/StarRating.vue'
import { visitsApi, footballApi } from '@/services/api'
import type { MatchEntry } from '@/types/match'

const { isAuthenticated, isLoading, loginWithRedirect, user } = useAuth0()

const visits = ref<MatchEntry[]>([])
const loadError = ref('')
const isFetching = ref(false)
const showForm = ref(false)
const isSubmitting = ref(false)
const editingId = ref<number | null>(null)

// --- API-Spielsuche ---
interface ApiMatch {
  id: number
  homeTeam: { name: string }
  awayTeam: { name: string }
  league: { name: string }
  country: { name: string }
  date: string
  state: { description: string; score?: { current?: string } }
}

const searchDate = ref('')
const searchHomeTeam = ref('')
const apiMatches = ref<ApiMatch[]>([])
const isSearching = ref(false)
const searchError = ref('')
const selectedMatch = ref<ApiMatch | null>(null)
const matchFilter = ref('')
const isLoadingDetails = ref(false)
const showDropdown = ref(false)

const canSearch = computed(() =>
  searchDate.value.trim() !== '' || searchHomeTeam.value.trim() !== '',
)

const filteredApiMatches = computed(() => {
  const q = matchFilter.value.trim().toLowerCase()
  if (!q) return apiMatches.value
  return apiMatches.value.filter(
    (m) =>
      m.homeTeam.name.toLowerCase().includes(q) ||
      m.awayTeam.name.toLowerCase().includes(q) ||
      m.league.name.toLowerCase().includes(q),
  )
})

const matchLabel = (m: ApiMatch) => {
  const dateStr = m.date ? new Date(m.date).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' }) : ''
  return `${m.homeTeam.name} vs ${m.awayTeam.name}${dateStr ? ' · ' + dateStr : ''} · ${m.league.name}`
}

const searchMatches = async () => {
  if (!canSearch.value) return
  isSearching.value = true
  searchError.value = ''
  apiMatches.value = []
  selectedMatch.value = null
  matchFilter.value = ''
  showDropdown.value = false

  try {
    const params: { date?: string; homeTeamName?: string } = {}
    if (searchDate.value.trim()) params.date = searchDate.value.trim()
    if (searchHomeTeam.value.trim()) params.homeTeamName = searchHomeTeam.value.trim()

    const { data } = await footballApi.getMatches(params)
    apiMatches.value = data?.data ?? []
    showDropdown.value = apiMatches.value.length > 0

    if (apiMatches.value.length === 0) {
      searchError.value = 'Keine Spiele gefunden. Anderen Teamnamen oder anderes Datum versuchen.'
    }
  } catch {
    searchError.value = 'Suche fehlgeschlagen – API-Key konfiguriert?'
  } finally {
    isSearching.value = false
  }
}

const selectMatch = async (match: ApiMatch) => {
  selectedMatch.value = match
  showDropdown.value = false

  // Datum aus API-Match ableiten wenn kein Datum eingetragen
  const matchDate = match.date ? match.date.slice(0, 10) : searchDate.value

  form.value.homeTeam = match.homeTeam.name
  form.value.awayTeam = match.awayTeam.name
  form.value.date = matchDate
  form.value.country = match.country.name

  if (match.state?.score?.current) {
    form.value.score = match.state.score.current.replace(' - ', ':')
  }

  isLoadingDetails.value = true
  try {
    const { data } = await footballApi.getMatchById(match.id)
    const detail = Array.isArray(data) ? data[0] : data

    if (detail?.venue) {
      form.value.stadium = detail.venue.name ?? ''
      form.value.city = detail.venue.city ?? ''
      form.value.country = detail.venue.country ?? match.country.name
    }
    if (detail?.forecast) {
      const status = detail.forecast.status ?? ''
      const temp = detail.forecast.temperature ?? ''
      form.value.weather = [status, temp].filter(Boolean).join(', ')
    }
    if (detail?.state?.score?.current) {
      form.value.score = detail.state.score.current.replace(' - ', ':')
    }
  } catch {
    // Details nicht verfügbar – Felder bleiben manuell editierbar
  } finally {
    isLoadingDetails.value = false
  }
}

const clearSearch = () => {
  selectedMatch.value = null
  apiMatches.value = []
  matchFilter.value = ''
  showDropdown.value = false
}

// --- Formular ---
const stadiumCount = computed(() => new Set(visits.value.map((m) => m.stadium)).size)

const emptyForm = () => ({
  homeTeam: '',
  awayTeam: '',
  stadium: '',
  city: '',
  country: '',
  date: '',
  score: '',
  attendance: 0,
  weather: '',
  note: '',
  visibility: 'PRIVATE' as 'PRIVATE' | 'PUBLIC',
  ratings: { atmosphere: 3, ambience: 3, food: 3, travel: 3, fanculture: 3, security: 3 },
})

const form = ref(emptyForm())

const ratingFields: { key: keyof typeof form.value.ratings; label: string }[] = [
  { key: 'atmosphere', label: 'Atmosphäre' },
  { key: 'ambience', label: 'Ambiente' },
  { key: 'food', label: 'Essen & Getränke' },
  { key: 'travel', label: 'Anreise' },
  { key: 'fanculture', label: 'Fankultur' },
  { key: 'security', label: 'Sicherheit' },
]

const loadVisits = async () => {
  if (!user.value?.email) return
  isFetching.value = true
  loadError.value = ''
  try {
    const { data } = await visitsApi.getMine(user.value.email)
    visits.value = data
  } catch {
    loadError.value = 'Diary konnte nicht geladen werden. Läuft das Backend?'
  } finally {
    isFetching.value = false
  }
}

const handleEdit = (match: MatchEntry) => {
  editingId.value = match.id
  form.value = {
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
    stadium: match.stadium,
    city: match.city,
    country: match.country,
    date: match.date,
    score: match.score ?? '',
    attendance: match.attendance ?? 0,
    weather: match.weather ?? '',
    note: match.note ?? '',
    visibility: match.visibility,
    ratings: { ...match.ratings },
  }
  searchDate.value = match.date
  selectedMatch.value = null
  matchFilter.value = ''
  apiMatches.value = []
  showForm.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleDelete = async (match: MatchEntry) => {
  if (!user.value?.email) return
  try {
    await visitsApi.remove(match.id, user.value.email)
    await loadVisits()
  } catch {
    loadError.value = 'Eintrag konnte nicht gelöscht werden.'
  }
}

const submitForm = async () => {
  if (!user.value?.email) return
  isSubmitting.value = true
  try {
    const payload = {
      ...form.value,
      attendance: Number(form.value.attendance),
      userId: user.value.email,
      reporterName: user.value.nickname ?? user.value.name,
    }
    if (editingId.value !== null) {
      await visitsApi.update(editingId.value, user.value.email, payload)
    } else {
      await visitsApi.create(payload)
    }
    form.value = emptyForm()
    editingId.value = null
    selectedMatch.value = null
    matchFilter.value = ''
    searchDate.value = ''
    searchHomeTeam.value = ''
    apiMatches.value = []
    showForm.value = false
    await loadVisits()
  } catch {
    loadError.value = editingId.value
      ? 'Eintrag konnte nicht aktualisiert werden.'
      : 'Eintrag konnte nicht gespeichert werden.'
  } finally {
    isSubmitting.value = false
  }
}

const cancelForm = () => {
  showForm.value = false
  editingId.value = null
  form.value = emptyForm()
  clearSearch()
  searchDate.value = ''
  searchHomeTeam.value = ''
}

watch(isAuthenticated, (val) => { if (val) loadVisits() })
onMounted(() => { if (isAuthenticated.value) loadVisits() })
</script>

<template>
  <main class="diary container">
    <header class="diary__header">
      <div>
        <p class="eyebrow">Privater Bereich</p>
        <h1>Dein Diary</h1>
      </div>
      <dl v-if="isAuthenticated" class="diary__stats">
        <div><dt>Besuche</dt><dd>{{ visits.length }}</dd></div>
        <div><dt>Stadien</dt><dd>{{ stadiumCount }}</dd></div>
      </dl>
    </header>

    <p v-if="isLoading">Lädt …</p>

    <div v-else-if="!isAuthenticated" class="diary__locked">
      <p>Melde dich an, um dein persönliches Matchday-Tagebuch zu sehen.</p>
      <button class="btn btn-primary" @click="loginWithRedirect()">Login</button>
    </div>

    <template v-else>
      <div class="diary__actions">
        <button class="btn btn-primary" @click="showForm ? cancelForm() : (showForm = true)">
          {{ showForm ? 'Abbrechen' : '+ Neuer Eintrag' }}
        </button>      </div>

      <form v-if="showForm" class="diary__form" @submit.prevent="submitForm">

        <p class="diary__form-label" style="font-size: 0.9rem;">
          {{ editingId !== null ? 'Eintrag bearbeiten' : 'Neuer Eintrag' }}
        </p>

        <!-- Spielsuche -->
        <div class="diary__form-section">
          <p class="diary__form-label">Spiel suchen</p>
          <p class="diary__form-hint">Datum, Heimteam oder beides angeben – mindestens ein Feld.</p>

          <div class="diary__search-grid">
            <label>
              Datum
              <input v-model="searchDate" type="date" />
            </label>
            <label>
              Heimteam
              <input
                v-model="searchHomeTeam"
                type="text"
                placeholder="z. B. Bayern München"
              />
            </label>
            <button
              type="button"
              class="btn btn-ghost diary__search-btn"
              :disabled="!canSearch || isSearching"
              @click="searchMatches"
            >
              {{ isSearching ? 'Suche …' : 'Suchen' }}
            </button>
          </div>

          <!-- Ergebnis-Dropdown -->
          <div v-if="showDropdown || selectedMatch" class="diary__match-picker">
            <div v-if="selectedMatch && !showDropdown" class="diary__selected-match">
              <span class="diary__match-teams">
                {{ selectedMatch.homeTeam.name }} vs {{ selectedMatch.awayTeam.name }}
              </span>
              <span class="diary__match-league">
                {{ selectedMatch.league.name }} · {{ selectedMatch.country.name }}
              </span>
              <button type="button" class="diary__change-match" @click="clearSearch">
                anderes Spiel wählen ✕
              </button>
            </div>

            <template v-if="showDropdown">
              <input
                v-model="matchFilter"
                class="diary__match-search"
                placeholder="Ergebnisse filtern …"
                autofocus
              />
              <ul class="diary__match-list">
                <li
                  v-for="m in filteredApiMatches"
                  :key="m.id"
                  class="diary__match-option"
                  @click="selectMatch(m)"
                >
                  <span class="diary__match-teams">{{ m.homeTeam.name }} vs {{ m.awayTeam.name }}</span>
                  <span class="diary__match-league">{{ m.league.name }} · {{ m.country.name }} · {{ m.date ? new Date(m.date).toLocaleDateString('de-DE', {day:'2-digit', month:'short', year:'numeric'}) : '' }}</span>
                </li>
                <li v-if="filteredApiMatches.length === 0" class="diary__match-empty">
                  Kein Treffer für „{{ matchFilter }}"
                </li>
              </ul>
            </template>

            <p v-if="isLoadingDetails" class="diary__search-hint">Lade Stadion & Wetterdaten …</p>
          </div>

          <p v-if="searchError" class="diary__error">{{ searchError }}</p>
          <p class="diary__form-hint">Kein Treffer? Felder unten einfach manuell ausfüllen.</p>
        </div>

        <div class="diary__divider"></div>

        <!-- Felder -->
        <div class="diary__form-grid">
          <label>Heimteam<input v-model="form.homeTeam" required /></label>
          <label>Auswärtsteam<input v-model="form.awayTeam" required /></label>
          <label>Stadion<input v-model="form.stadium" required /></label>
          <label>Stadt<input v-model="form.city" required /></label>
          <label>Land<input v-model="form.country" required /></label>
          <label>Datum<input v-model="form.date" type="date" required /></label>
          <label>Endstand<input v-model="form.score" placeholder="2:1" /></label>
          <label>Zuschauer<input v-model.number="form.attendance" type="number" min="0" /></label>
          <label>Wetter<input v-model="form.weather" placeholder="Sonnig, 18°C" /></label>
          <label>
            Sichtbarkeit
            <select v-model="form.visibility">
              <option value="PRIVATE">Privat</option>
              <option value="PUBLIC">Öffentlich</option>
            </select>
          </label>
        </div>

        <!-- Bewertungen -->
        <div class="diary__form-ratings">
          <div v-for="field in ratingFields" :key="field.key" class="diary__rating-row">
            <span class="diary__rating-label">{{ field.label }}</span>
            <StarRating v-model="form.ratings[field.key]" :label="field.label" />
          </div>
        </div>

        <label class="diary__form-note">
          Erlebnisbericht
          <textarea v-model="form.note" rows="3" placeholder="Was hat den Tag besonders gemacht?" />
        </label>

        <button class="btn btn-primary" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Speichert …' : editingId !== null ? 'Änderungen speichern' : 'Eintrag speichern' }}
        </button>
      </form>

      <p v-if="loadError" class="diary__error">{{ loadError }}</p>
      <p v-else-if="isFetching">Lädt deine Einträge …</p>

      <div v-else-if="visits.length" class="diary__grid">
        <MatchStub
          v-for="m in visits"
          :key="m.id"
          :match="m"
          :show-visibility="true"
          editable
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
      <div v-else-if="!showForm" class="diary__empty">
        <p>Noch kein Eintrag. Dein erstes Ticket wartet auf dich.</p>
      </div>
    </template>
  </main>
</template>

<style scoped>
.diary { padding: 56px 24px 96px; }

.diary__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--c-stub-line);
}
.diary__header h1 { margin-top: 6px; font-size: 2.2rem; }
.diary__stats { display: flex; gap: 32px; }
.diary__stats dt { font-family: var(--f-mono); font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--c-chalk-dim); }
.diary__stats dd { font-family: var(--f-mono); font-size: 1.6rem; color: var(--c-floodlight-soft); }

.diary__locked, .diary__empty {
  display: flex; flex-direction: column; align-items: center; gap: 18px;
  padding: 80px 24px; text-align: center;
  border: 1px dashed var(--c-stub-line); border-radius: var(--radius-card);
  color: var(--c-chalk);
}
.diary__actions { margin-bottom: 24px; }

.diary__form {
  background: var(--c-panel-soft);
  border: 1px solid var(--c-stub-line);
  border-radius: var(--radius-card);
  padding: 24px; margin-bottom: 32px;
  display: flex; flex-direction: column; gap: 20px;
}

.diary__form-section { display: flex; flex-direction: column; gap: 10px; }

.diary__form-label {
  font-family: var(--f-mono); font-size: 0.72rem;
  letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--c-floodlight-soft);
}

.diary__form-hint {
  font-family: var(--f-mono); font-size: 0.72rem; color: var(--c-chalk-dim);
}

.diary__search-grid {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 12px;
  align-items: end;
}

.diary__search-grid label {
  display: flex; flex-direction: column; gap: 6px;
  font-family: var(--f-mono); font-size: 0.72rem;
  letter-spacing: 0.04em; text-transform: uppercase;
  color: var(--c-chalk-dim);
}

.diary__search-grid input {
  background: var(--c-night); border: 1px solid var(--c-stub-line);
  border-radius: 4px; padding: 8px 10px; color: var(--c-paper);
  font-family: var(--f-body); font-size: 0.92rem;
}

.diary__search-btn { align-self: end; white-space: nowrap; }
.diary__search-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.diary__match-picker { display: flex; flex-direction: column; gap: 6px; position: relative; }

.diary__selected-match {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  padding: 10px 12px;
  background: rgba(226, 163, 61, 0.08);
  border: 1px solid var(--c-floodlight);
  border-radius: 4px;
}

.diary__match-teams {
  font-family: var(--f-display); font-size: 0.9rem;
  text-transform: uppercase; color: var(--c-paper);
}

.diary__match-league {
  font-family: var(--f-mono); font-size: 0.7rem; color: var(--c-chalk-dim);
}

.diary__change-match {
  background: transparent; color: var(--c-chalk-dim);
  font-family: var(--f-mono); font-size: 0.7rem;
  text-transform: none; letter-spacing: normal;
  margin-left: auto; padding: 0;
  transition: color 0.12s ease;
}
.diary__change-match:hover { color: var(--c-danger); }

.diary__match-search {
  background: var(--c-night); border: 1px solid var(--c-floodlight);
  border-radius: 4px; padding: 9px 12px;
  color: var(--c-paper); font-family: var(--f-body); font-size: 0.92rem;
  width: 100%;
}

.diary__match-list {
  list-style: none;
  background: var(--c-panel);
  border: 1px solid var(--c-floodlight);
  border-radius: 4px;
  max-height: 280px; overflow-y: auto;
  padding: 4px;
}

.diary__match-option {
  display: flex; flex-direction: column;
  padding: 10px 12px; border-radius: 3px;
  cursor: pointer; gap: 2px;
  transition: background-color 0.12s ease;
}
.diary__match-option:hover { background: rgba(226, 163, 61, 0.12); }

.diary__match-empty {
  padding: 12px; font-family: var(--f-mono);
  font-size: 0.78rem; color: var(--c-chalk-dim);
  text-align: center;
}

.diary__search-hint { font-family: var(--f-mono); font-size: 0.75rem; color: var(--c-chalk-dim); }

.diary__divider { height: 1px; background: var(--c-stub-line); }

.diary__form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
}

.diary__form label {
  display: flex; flex-direction: column; gap: 6px;
  font-family: var(--f-mono); font-size: 0.72rem;
  letter-spacing: 0.04em; text-transform: uppercase; color: var(--c-chalk-dim);
}

.diary__form input,
.diary__form select,
.diary__form textarea {
  font-family: var(--f-body); font-size: 0.92rem;
  text-transform: none; letter-spacing: normal;
  background: var(--c-night); border: 1px solid var(--c-stub-line);
  border-radius: 4px; padding: 8px 10px; color: var(--c-paper);
}

.diary__form-ratings {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.diary__rating-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.diary__rating-label {
  font-family: var(--f-mono);
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--c-chalk-dim);
  min-width: 120px;
}

.diary__error { color: #e08469; font-family: var(--f-mono); font-size: 0.82rem; }

.diary__grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;
}

@media (max-width: 640px) {
  .diary__search-grid { grid-template-columns: 1fr; }
}
</style>
