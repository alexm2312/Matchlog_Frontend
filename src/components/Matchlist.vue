<script setup lang="ts">
import { ref } from "vue"

const matches = ref([
  { id: 1, name: "Union Berlin gegen Bayern",      ort: "Alte Försterei",       preis: 25.00 },
  { id: 2, name: "Kaiserslautern gegen Karlsruhe", ort: "Fritz Walter Stadion", preis: 30.00 }
])
</script>

<template>
  <div>
    <h1>Spiele</h1>
    <div v-for="match in matches" :key="match.id">
      <h3>{{ match.name }}</h3>
      <p>Standort: {{ match.ort }}</p>
      <p>Preis: {{ match.preis }} €</p>
      <hr>
    </div>
  </div>
</template>