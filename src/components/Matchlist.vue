<script setup lang="ts">
defineProps<{
  matches: {
    title: string
    location: string
    ticketprice: number
  }[]
}>()
</script>

<template>
  <img src="@/assets/meinbild.jpg" alt="Logo">
  <div>
    <h2>Spiele</h2>
    <p>Hier findest du eine Liste aller Spiele, die in unserer Datenbank gespeichert sind. Klicke auf ein Spiel, um weitere Details zu erfahren.
    </p>
    <br>

    <div v-for="match in matches" :key="match.title">
      <h3>{{ match.title }}</h3>
      <p>Standort: {{ match.location }}</p>
      <p>Preis: {{ match.ticketprice }} €</p>
      <hr />
    </div>
  </div>
</template>