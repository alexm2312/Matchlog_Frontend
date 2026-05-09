<script setup lang="ts">
const examples = [
  { id: 1, name: 'Matchlog', type: 'Frontend-Projekt' },
  { id: 2, name: 'Vue Router', type: 'Routing' },
  { id: 3, name: 'Komponente', type: 'Wiederverwendbarer Baustein' }
]
</script>

<template>
  <section>
    <h2>Beispiel-Entitäten</h2>

    <ul>
      <li v-for="example in examples" :key="example.id">
        {{ example.name }} – {{ example.type }}
      </li>
    </ul>
  </section>
</template>