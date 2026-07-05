<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  modelValue: number
  label: string
  readonly?: boolean
  size?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const hoverValue = ref<number | null>(null)
const displayValue = computed(() => hoverValue.value ?? props.modelValue)

// Eindeutige ID, damit mehrere Instanzen auf einer Seite keine clipPath-Konflikte haben
const uid = Math.random().toString(36).slice(2, 8)

const starSize = computed(() => props.size ?? 28)

type Fill = 'empty' | 'half' | 'full'

function getFill(starIndex: number): Fill {
  const v = displayValue.value
  if (v >= starIndex) return 'full'
  if (v >= starIndex - 0.5) return 'half'
  return 'empty'
}

function onMouseMove(event: MouseEvent, starIndex: number) {
  if (props.readonly) return
  const el = event.currentTarget as HTMLElement
  const x = event.clientX - el.getBoundingClientRect().left
  hoverValue.value = x < el.getBoundingClientRect().width / 2 ? starIndex - 0.5 : starIndex
}

function onClick(event: MouseEvent, starIndex: number) {
  if (props.readonly) return
  const el = event.currentTarget as HTMLElement
  const x = event.clientX - el.getBoundingClientRect().left
  const val = x < el.getBoundingClientRect().width / 2 ? starIndex - 0.5 : starIndex
  emit('update:modelValue', val)
}

function onInput(event: Event) {
  const raw = parseFloat((event.target as HTMLInputElement).value)
  if (!isNaN(raw)) {
    const rounded = Math.round(raw * 2) / 2
    emit('update:modelValue', Math.min(5, Math.max(1, rounded)))
  }
}

// SVG-Pfad für einen 5-zackigen Stern (24×24 viewBox)
const STAR_PATH =
  'M12 2.5l2.63 5.33 5.87.85-4.25 4.14 1 5.85L12 15.77l-5.25 2.9 1-5.85L3.5 8.68l5.87-.85L12 2.5z'
</script>

<template>
  <div class="star-rating" :class="{ 'star-rating--readonly': readonly }">
    <div class="star-rating__stars">
      <span
        v-for="i in 5"
        :key="i"
        class="star-rating__star"
        :style="{ width: starSize + 'px', height: starSize + 'px' }"
        @mousemove="onMouseMove($event, i)"
        @mouseleave="hoverValue = null"
        @click="onClick($event, i)"
      >
        <svg
          :viewBox="`0 0 24 24`"
          :width="starSize"
          :height="starSize"
          xmlns="http://www.w3.org/2000/svg"
          overflow="visible"
        >
          <defs>
            <clipPath :id="`half-${uid}-${i}`">
              <rect x="0" y="0" width="12" height="24" />
            </clipPath>
          </defs>

          <!-- Leerer Stern (Hintergrund) -->
          <path
            :d="STAR_PATH"
            fill="rgba(243,238,227,0.12)"
            stroke="rgba(243,238,227,0.25)"
            stroke-width="0.5"
          />

          <!-- Gefüllter Stern, halb oder voll geclippt -->
          <path
            v-if="getFill(i) !== 'empty'"
            :d="STAR_PATH"
            fill="var(--c-floodlight)"
            :clip-path="getFill(i) === 'half' ? `url(#half-${uid}-${i})` : undefined"
          />
        </svg>
      </span>
    </div>

    <div v-if="!readonly" class="star-rating__input-wrap">
      <input
        type="number"
        class="star-rating__input"
        :value="props.modelValue"
        min="1"
        max="5"
        step="0.5"
        @change="onInput"
      />
      <span class="star-rating__max">/ 5</span>
    </div>

    <span v-else class="star-rating__value">{{ props.modelValue.toFixed(1) }}</span>
  </div>
</template>

<style scoped>
.star-rating {
  display: flex;
  align-items: center;
  gap: 10px;
}

.star-rating__stars {
  display: flex;
  gap: 2px;
}

.star-rating__star {
  display: inline-flex;
  cursor: pointer;
  user-select: none;
  transition: transform 0.1s ease;
}

.star-rating__star:hover {
  transform: scale(1.15);
}

.star-rating--readonly .star-rating__star {
  cursor: default;
}

.star-rating--readonly .star-rating__star:hover {
  transform: none;
}

.star-rating__input-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
}

.star-rating__input {
  width: 50px;
  background: var(--c-night);
  border: 1px solid var(--c-stub-line);
  border-radius: 4px;
  padding: 4px 6px;
  color: var(--c-paper);
  font-family: var(--f-mono);
  font-size: 0.85rem;
  text-align: center;
}

.star-rating__max {
  font-family: var(--f-mono);
  font-size: 0.75rem;
  color: var(--c-chalk-dim);
}

.star-rating__value {
  font-family: var(--f-mono);
  font-size: 0.82rem;
  color: var(--c-chalk-dim);
}
</style>
