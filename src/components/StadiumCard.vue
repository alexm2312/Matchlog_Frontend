<script setup lang="ts">
defineProps<{
  summary: {
    stadium: string
    city: string
    country: string
    visitCount: number
    averageRating: number
  }
}>()
</script>

<template>
  <button class="stadium-card" type="button">
    <div class="stadium-card__main">
      <h3 class="stadium-card__name">{{ summary.stadium }}</h3>
      <p class="stadium-card__place">{{ summary.city }}, {{ summary.country }}</p>
    </div>
    <div class="stadium-card__stats">
      <span class="stadium-card__avg">{{ summary.averageRating.toFixed(1) }}</span>
      <span class="stadium-card__count">
        {{ summary.visitCount }} {{ summary.visitCount === 1 ? 'Bewertung' : 'Bewertungen' }}
      </span>
    </div>
  </button>
</template>

<style scoped>
.stadium-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  width: 100%;
  background: var(--c-paper);
  color: var(--c-ink);
  border-radius: var(--radius-card);
  padding: 22px;
  text-align: left;
  border: 1px solid transparent;
  box-shadow: 0 12px 24px -12px rgba(0, 0, 0, 0.5);
  transition: transform 0.15s ease, border-color 0.15s ease;
  font-family: var(--f-body);
  cursor: pointer;
}

.stadium-card:hover {
  transform: translateY(-3px);
  border-color: var(--c-floodlight);
}

.stadium-card__name {
  font-family: var(--f-display);
  font-size: 1.1rem;
  color: var(--c-ink);
  text-transform: uppercase;
}

.stadium-card__place {
  margin-top: 4px;
  font-size: 0.85rem;
  color: #5c5746;
}

.stadium-card__stats {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  border-left: 1px dashed rgba(30, 33, 24, 0.2);
  padding-left: 16px;
  min-width: 100px;
}

.stadium-card__avg {
  font-family: var(--f-mono);
  font-size: 1.6rem;
  color: var(--c-pitch);
}

.stadium-card__count {
  font-family: var(--f-mono);
  font-size: 0.65rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #5c5746;
  white-space: nowrap;
  margin-top: 2px;
}
</style>
