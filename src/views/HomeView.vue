<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Matchloglist from '@/components/Matchlist.vue'

const matches = ref([])

onMounted(async () => {
  const response = await fetch('https://matchlog-backend-12iq.onrender.com/api/matches')
  matches.value = await response.json()
})
</script>

<template>
  <main>
    <h1>Home</h1>
    <Matchloglist :matches="matches" />
  </main>
</template>