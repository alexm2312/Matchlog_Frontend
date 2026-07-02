<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MatchEntry } from '@/types/match'
import { averageRating } from '@/types/match'
import StarRating from './StarRating.vue'

const props = defineProps<{
  match: MatchEntry
  showVisibility?: boolean
  editable?: boolean
}>()

const emit = defineEmits<{
  edit: [match: MatchEntry]
  delete: [match: MatchEntry]
}>()

const confirmDelete = ref(false)

const formattedDate = computed(() =>
  new Date(props.match.date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }),
)

const avg = computed(() => averageRating(props.match.ratings))

const ratingRows: { label: string; key: keyof MatchEntry['ratings'] }[] = [
  { label: 'Atmosphäre', key: 'atmosphere' },
  { label: 'Ambiente', key: 'ambience' },
  { label: 'Essen', key: 'food' },
  { label: 'Anreise', key: 'travel' },
  { label: 'Fankultur', key: 'fanculture' },
  { label: 'Sicherheit', key: 'security' },
]
</script>

<template>
  <article class="stub">
    <div class="stub__main">
      <div class="stub__route">
        <span class="stub__team">{{ match.homeTeam }}</span>
        <span class="stub__vs">vs</span>
        <span class="stub__team">{{ match.awayTeam }}</span>
      </div>

      <p class="stub__place">{{ match.stadium }} · {{ match.city }}, {{ match.country }}</p>

      <div class="stub__meta">
        <span>{{ formattedDate }}</span>
        <span class="stub__dot">·</span>
        <span>{{ match.score }}</span>
        <span class="stub__dot">·</span>
        <span>{{ match.attendance.toLocaleString('de-DE') }} Zuschauer</span>
      </div>

      <p v-if="match.note" class="stub__note">{{ match.note }}</p>
      <p v-if="match.reporterName" class="stub__reporter">— {{ match.reporterName }}</p>
    </div>

    <div class="stub__perforation" aria-hidden="true">
      <span class="stub__notch stub__notch--left"></span>
      <span class="stub__dashes"></span>
      <span class="stub__notch stub__notch--right"></span>
    </div>

    <div class="stub__footer">
      <div class="stub__ratings">
        <div v-for="row in ratingRows" :key="row.key" class="stub__rating">
          <span class="stub__rating-label">{{ row.label }}</span>
          <StarRating
            :model-value="match.ratings[row.key]"
            :label="row.label"
            :size="16"
            readonly
          />
        </div>
      </div>
      <div class="stub__avg">
        <span class="stub__avg-value">{{ avg.toFixed(1) }}</span>
        <span class="stub__avg-label">⌀ Bewertung</span>
      </div>
    </div>

    <span v-if="showVisibility" class="stub__tag" :class="`stub__tag--${match.visibility.toLowerCase()}`">
      {{ match.visibility === 'PUBLIC' ? 'Öffentlich' : 'Privat' }}
    </span>

    <div v-if="editable" class="stub__actions">
      <button class="stub__action-btn" @click="emit('edit', match)">
        ✏️ Bearbeiten
      </button>

      <template v-if="!confirmDelete">
        <button class="stub__action-btn stub__action-btn--danger" @click="confirmDelete = true">
          🗑 Löschen
        </button>
      </template>
      <template v-else>
        <span class="stub__confirm-text">Wirklich löschen?</span>
        <button class="stub__action-btn stub__action-btn--danger" @click="emit('delete', match); confirmDelete = false">
          Ja, löschen
        </button>
        <button class="stub__action-btn" @click="confirmDelete = false">
          Abbrechen
        </button>
      </template>
    </div>
  </article>
</template>

<style scoped>
.stub {
  position: relative;
  background: var(--c-paper);
  color: var(--c-ink);
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: 0 12px 24px -12px rgba(0, 0, 0, 0.5);
}

.stub__main {
  padding: 22px 22px 18px;
}

.stub__route {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-family: var(--f-display);
  font-size: 1.15rem;
  text-transform: uppercase;
  color: var(--c-ink);
  flex-wrap: wrap;
}

.stub__vs {
  font-family: var(--f-mono);
  font-size: 0.7rem;
  color: var(--c-pitch);
  letter-spacing: 0.1em;
}

.stub__place {
  margin-top: 4px;
  font-size: 0.85rem;
  color: #5c5746;
}

.stub__meta {
  margin-top: 10px;
  font-family: var(--f-mono);
  font-size: 0.78rem;
  color: var(--c-ink);
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stub__dot {
  color: var(--c-pitch);
}

.stub__note {
  margin-top: 12px;
  font-size: 0.92rem;
  line-height: 1.5;
  color: #3a372c;
}

.stub__reporter {
  margin-top: 8px;
  font-family: var(--f-mono);
  font-size: 0.75rem;
  color: var(--c-pitch);
}

/* Perforation */
.stub__perforation {
  position: relative;
  display: flex;
  align-items: center;
  height: 0;
}

.stub__notch {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--c-night);
  top: -10px;
}

.stub__notch--left {
  left: -10px;
}

.stub__notch--right {
  right: -10px;
}

.stub__dashes {
  width: 100%;
  border-top: 2px dashed var(--c-paper-soft);
}

/* Footer / Bewertungs-Barcode */
.stub__footer {
  padding: 16px 22px 20px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  background: var(--c-paper-soft);
}

.stub__ratings {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 18px;
  flex: 1;
}

.stub__rating {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.stub__rating-label {
  font-size: 0.7rem;
  color: #5c5746;
  white-space: nowrap;
}

.stub__rating-bar {
  display: flex;
  gap: 3px;
}

.stub__rating-pip {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(30, 33, 24, 0.18);
}

.stub__rating-pip.is-filled {
  background: var(--c-pitch);
}

.stub__avg {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-left: 1px dashed rgba(30, 33, 24, 0.2);
  padding-left: 16px;
  min-width: 70px;
}

.stub__avg-value {
  font-family: var(--f-mono);
  font-size: 1.4rem;
  color: var(--c-ink);
}

.stub__avg-label {
  font-family: var(--f-mono);
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #5c5746;
}

.stub__tag {
  position: absolute;
  top: 14px;
  right: 14px;
  font-family: var(--f-mono);
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: 999px;
}

.stub__tag--public {
  background: rgba(79, 122, 92, 0.18);
  color: var(--c-pitch);
}

.stub__tag--private {
  background: rgba(193, 84, 60, 0.15);
  color: var(--c-danger);
}

.stub__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-top: 1px dashed rgba(30, 33, 24, 0.15);
  background: var(--c-paper-soft);
  flex-wrap: wrap;
}

.stub__action-btn {
  font-family: var(--f-mono);
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: transparent;
  color: #5c5746;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(30, 33, 24, 0.2);
  transition: background-color 0.12s ease, color 0.12s ease, border-color 0.12s ease;
}

.stub__action-btn:hover {
  background: rgba(30, 33, 24, 0.08);
  color: var(--c-ink);
  border-color: rgba(30, 33, 24, 0.4);
}

.stub__action-btn--danger:hover {
  background: rgba(193, 84, 60, 0.12);
  color: var(--c-danger);
  border-color: var(--c-danger);
}

.stub__confirm-text {
  font-family: var(--f-mono);
  font-size: 0.72rem;
  color: var(--c-danger);
  margin-right: 4px;
}
</style>
