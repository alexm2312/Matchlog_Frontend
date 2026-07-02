<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MatchStub from '@/components/MatchStub.vue'
import StadiumCard from '@/components/StadiumCard.vue'
import { visitsApi } from '@/services/api'
import type { MatchEntry } from '@/types/match'
import { averageRating } from '@/types/match'

interface StadiumSummary {
  key: string
  stadium: string
  city: string
  country: string
  visitCount: number
  averageRating: number
}

const search = ref('')
const visits = ref<MatchEntry[]>([])
const isFetching = ref(true)
const loadError = ref('')
const selectedKey = ref<string | null>(null)

const stadiumKey = (m: MatchEntry) => `${m.stadium}|${m.city}|${m.country}`

const stadiums = computed<StadiumSummary[]>(() => {
  const map = new Map<string, { stadium: string; city: string; country: string; ratings: number[] }>()

  for (const v of visits.value) {
    const key = stadiumKey(v)
    if (!map.has(key)) {
      map.set(key, { stadium: v.stadium, city: v.city, country: v.country, ratings: [] })
    }
    map.get(key)!.ratings.push(averageRating(v.ratings))
  }

  return Array.from(map.entries())
    .map(([key, data]) => ({
      key,
      stadium: data.stadium,
      city: data.city,
      country: data.country,
      visitCount: data.ratings.length,
      averageRating: data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length,
    }))
    .sort((a, b) => b.averageRating - a.averageRating)
})

const filteredStadiums = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return stadiums.value
  return stadiums.value.filter(
    (s) =>
      s.stadium.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.country.toLowerCase().includes(q),
  )
})

const selectedStadium = computed(() => stadiums.value.find((s) => s.key === selectedKey.value) ?? null)

const matchesForSelected = computed(() => {
  if (!selectedKey.value) return []
  return visits.value
    .filter((v) => stadiumKey(v) === selectedKey.value)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

onMounted(async () => {
  try {
    const { data } = await visitsApi.getPublic()
    visits.value = data
  } catch {
    loadError.value = 'Public-Feed konnte nicht geladen werden. Läuft das Backend?'
  } finally {
    isFetching.value = false
  }
})
</script>

<template>
  <main class="public container">
    <header class="public__header">
      <div v-if="!selectedStadium">
        <p class="eyebrow">Aus aller Welt</p>
        <h1>Public</h1>
      </div>
      <div v-else>
        <button class="public__back" type="button" @click="selectedKey = null">← Alle Stadien</button>
        <h1>{{ selectedStadium.stadium }}</h1>
        <p class="public__subtitle">{{ selectedStadium.city }}, {{ selectedStadium.country }}</p>
      </div>

      <input
        v-if="!selectedStadium"
        v-model="search"
        type="search"
        class="public__search"
        placeholder="Stadion, Stadt oder Land suchen …"
      />
    </header>

    <p v-if="isFetching">Lädt …</p>
    <p v-else-if="loadError" class="public__error">{{ loadError }}</p>

    <template v-else-if="!selectedStadium">
      <div v-if="filteredStadiums.length" class="public__stadium-grid">
        <StadiumCard
          v-for="s in filteredStadiums"
          :key="s.key"
          :summary="s"
          @click="selectedKey = s.key"
        />
      </div>
      <div v-else-if="stadiums.length" class="public__empty">
        <p>Keine Stadien für „{{ search }}" gefunden.</p>
      </div>
      <div v-else class="public__empty">
        <p>Noch keine öffentlichen Bewertungen vorhanden.</p>
      </div>
    </template>

    <div v-else class="public__grid">
      <MatchStub v-for="m in matchesForSelected" :key="m.id" :match="m" />
    </div>
  </main>
</template>

<style scoped>
.public {
  padding: 56px 24px 96px;
}

.public__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--c-stub-line);
}

.public__header h1 {
  margin-top: 6px;
  font-size: 2.2rem;
}

.public__subtitle {
  margin-top: 6px;
  font-family: var(--f-mono);
  font-size: 0.85rem;
  color: var(--c-chalk-dim);
}

.public__back {
  background: transparent;
  color: var(--c-floodlight-soft);
  font-family: var(--f-mono);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0;
}

.public__back:hover {
  color: var(--c-floodlight);
}

.public__search {
  background: var(--c-panel-soft);
  border: 1px solid var(--c-stub-line);
  border-radius: 999px;
  padding: 10px 18px;
  color: var(--c-paper);
  font-family: var(--f-body);
  font-size: 0.9rem;
  min-width: 260px;
}

.public__search::placeholder {
  color: var(--c-chalk-dim);
}

.public__stadium-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
}

.public__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.public__error,
.public__empty {
  padding: 80px 24px;
  text-align: center;
  border: 1px dashed var(--c-stub-line);
  border-radius: var(--radius-card);
}
</style>
