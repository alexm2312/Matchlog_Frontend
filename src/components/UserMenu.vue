<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

defineProps<{
  email?: string
}>()

const emit = defineEmits<{
  logout: []
}>()

const isOpen = ref(false)
const rootEl = ref<HTMLElement | null>(null)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const close = () => {
  isOpen.value = false
}

const onClickOutside = (event: MouseEvent) => {
  if (rootEl.value && !rootEl.value.contains(event.target as Node)) {
    close()
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div ref="rootEl" class="usermenu">
    <button
      class="usermenu__trigger"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      @click="toggle"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.6" />
        <path
          d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
        />
      </svg>
    </button>

    <Transition name="fade">
      <div v-if="isOpen" class="usermenu__panel" role="menu">
        <p v-if="email" class="usermenu__email">{{ email }}</p>
        <RouterLink to="/einstellungen" class="usermenu__item" role="menuitem" @click="close">
          Einstellungen
        </RouterLink>
        <button class="usermenu__item usermenu__item--danger" role="menuitem" @click="emit('logout'); close()">
          Abmelden
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.usermenu {
  position: relative;
}

.usermenu__trigger {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--c-panel-soft);
  color: var(--c-paper);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--c-stub-line);
  transition: border-color 0.15s ease, color 0.15s ease;
}

.usermenu__trigger:hover,
.usermenu__trigger[aria-expanded='true'] {
  border-color: var(--c-floodlight);
  color: var(--c-floodlight-soft);
}

.usermenu__panel {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 200px;
  background: var(--c-panel-soft);
  border: 1px solid var(--c-stub-line);
  border-radius: 6px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 16px 32px -12px rgba(0, 0, 0, 0.6);
  z-index: 50;
}

.usermenu__email {
  font-family: var(--f-mono);
  font-size: 0.72rem;
  color: var(--c-chalk-dim);
  padding: 6px 10px 10px;
  border-bottom: 1px dashed var(--c-stub-line);
  margin-bottom: 4px;
  word-break: break-all;
}

.usermenu__item {
  text-align: left;
  background: transparent;
  color: var(--c-paper);
  font-family: var(--f-body);
  font-size: 0.92rem;
  text-transform: none;
  letter-spacing: normal;
  padding: 9px 10px;
  border-radius: 4px;
  transition: background-color 0.15s ease;
}

.usermenu__item:hover {
  background: rgba(226, 163, 61, 0.12);
  color: var(--c-floodlight-soft);
}

.usermenu__item--danger:hover {
  background: rgba(193, 84, 60, 0.14);
  color: #e08469;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
