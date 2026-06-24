<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import MatchStub from '@/components/MatchStub.vue'
import { visitsApi } from '@/services/api'
import type { MatchEntry } from '@/types/match'

const { isAuthenticated, isLoading, loginWithRedirect, user } = useAuth0()

const visits = ref<MatchEntry[]>([])
const loadError = ref('')
const isFetching = ref(false)
const showForm = ref(false)
const isSubmitting = ref(false)

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

const submitForm = async () => {
  if (!user.value?.email) return
  isSubmitting.value = true
  try {
    await visitsApi.create({
      ...form.value,
      attendance: Number(form.value.attendance),
      userId: user.value.email,
      reporterName: user.value.nickname ?? user.value.name,
    })
    form.value = emptyForm()
    showForm.value = false
    await loadVisits()
  } catch {
    loadError.value = 'Eintrag konnte nicht gespeichert werden.'
  } finally {
    isSubmitting.value = false
  }
}

watch(isAuthenticated, (val) => {
  if (val) loadVisits()
})

onMounted(() => {
  if (isAuthenticated.value) loadVisits()
})
</script>

<template>
  <main class="diary container">
    <header class="diary__header">
      <div>
        <p class="eyebrow">Privater Bereich</p>
        <h1>Dein Diary</h1>
      </div>

      <dl v-if="isAuthenticated" class="diary__stats">
        <div>
          <dt>Besuche</dt>
          <dd>{{ visits.length }}</dd>
        </div>
        <div>
          <dt>Stadien</dt>
          <dd>{{ stadiumCount }}</dd>
        </div>
      </dl>
    </header>

    <p v-if="isLoading">Lädt …</p>

    <div v-else-if="!isAuthenticated" class="diary__locked">
      <p>Melde dich an, um dein persönliches Matchday-Tagebuch zu sehen.</p>
      <button class="btn btn-primary" @click="loginWithRedirect()">Login</button>
    </div>

    <template v-else>
      <div class="diary__actions">
        <button class="btn btn-primary" @click="showForm = !showForm">
          {{ showForm ? 'Abbrechen' : 'Neuer Eintrag' }}
        </button>
      </div>

      <form v-if="showForm" class="diary__form" @submit.prevent="submitForm">
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
          <label class="diary__form-visibility">
            Sichtbarkeit
            <select v-model="form.visibility">
              <option value="PRIVATE">Privat</option>
              <option value="PUBLIC">Öffentlich</option>
            </select>
          </label>
        </div>

        <div class="diary__form-ratings">
          <label v-for="field in ratingFields" :key="field.key">
            {{ field.label }}: {{ form.ratings[field.key] }}
            <input v-model.number="form.ratings[field.key]" type="range" min="1" max="5" />
          </label>
        </div>

        <label class="diary__form-note">
          Erlebnisbericht
          <textarea v-model="form.note" rows="3" placeholder="Was hat den Tag besonders gemacht?" />
        </label>

        <button class="btn btn-primary" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Speichert …' : 'Eintrag speichern' }}
        </button>
      </form>

      <p v-if="loadError" class="diary__error">{{ loadError }}</p>
      <p v-else-if="isFetching">Lädt deine Einträge …</p>

      <div v-else-if="visits.length" class="diary__grid">
        <MatchStub v-for="m in visits" :key="m.id" :match="m" :show-visibility="true" />
      </div>
      <div v-else class="diary__empty">
        <p>Noch kein Eintrag. Dein erstes Ticket wartet auf dich.</p>
      </div>
    </template>
  </main>
</template>

<style scoped>
.diary {
  padding: 56px 24px 96px;
}

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

.diary__header h1 {
  margin-top: 6px;
  font-size: 2.2rem;
}

.diary__stats {
  display: flex;
  gap: 32px;
}

.diary__stats dt {
  font-family: var(--f-mono);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-chalk-dim);
}

.diary__stats dd {
  font-family: var(--f-mono);
  font-size: 1.6rem;
  color: var(--c-floodlight-soft);
}

.diary__locked,
.diary__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding: 80px 24px;
  text-align: center;
  border: 1px dashed var(--c-stub-line);
  border-radius: var(--radius-card);
  color: var(--c-chalk);
}

.diary__actions {
  margin-bottom: 24px;
}

.diary__form {
  background: var(--c-panel-soft);
  border: 1px solid var(--c-stub-line);
  border-radius: var(--radius-card);
  padding: 24px;
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.diary__form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
}

.diary__form label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-family: var(--f-mono);
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--c-chalk-dim);
}

.diary__form input,
.diary__form select,
.diary__form textarea {
  font-family: var(--f-body);
  font-size: 0.92rem;
  text-transform: none;
  letter-spacing: normal;
  background: var(--c-night);
  border: 1px solid var(--c-stub-line);
  border-radius: 4px;
  padding: 8px 10px;
  color: var(--c-paper);
}

.diary__form-ratings {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
}

.diary__error {
  color: #e08469;
}

.diary__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}
</style>
