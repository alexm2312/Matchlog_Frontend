<script setup lang="ts">
defineProps<{
  matches: { title: string; location: string; ticketprice: number }[]
}>()
</script>

<template>
  <div>
    <h1>Spiele</h1>
    <div v-for="match in matches" :key="match.title">
      <h3>{{ match.title }}</h3>
      <p>Standort: {{ match.location }}</p>
      <p>Preis: {{ match.ticketprice }} €</p>
      <hr>
    </div>
  </div>
</template>