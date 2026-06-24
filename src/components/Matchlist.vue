<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const matches = ref<{ title: string; location: string; ticketprice: number }[]>([])

const newMatch = ref({
  title: '',
  location: '',
  ticketprice: 0,
  visibility: 'PUBLIC'
})

const loadMatches = async () => {
  const response = await axios.get('https://matchlog-backend-12iq.onrender.com/api/matches')
  matches.value = response.data
}

const addMatch = async () => {
  // POST Route 
  await axios.post('https://matchlog-backend-12iq.onrender.com/api/matches', newMatch.value)
  newMatch.value = { title: '', location: '', ticketprice: 0, visibility: 'PUBLIC' }
  await loadMatches()
}

onMounted(loadMatches)
</script>

<template>
  <img src="@/assets/meinbild.jpg" alt="Logo">
  <div>
    <h2>Spiele</h2>
    <p>Hier findest du eine Liste aller Spiele, die in unserer Datenbank gespeichert sind. Klicke auf ein Spiel, um weitere Details zu erfahren.</p>
    <br>

    <div v-for="match in matches" :key="match.title">
      <h3>{{ match.title }}</h3>
      <p>Standort: {{ match.location }}</p>
      <p>Preis: {{ match.ticketprice }} €</p>
      <hr />
    </div>

    <h2>Neues Spiel hinzufügen</h2>
    <input v-model="newMatch.title" placeholder="Spielname" /><br>
    <input v-model="newMatch.location" placeholder="Stadion" /><br>
    <input v-model="newMatch.ticketprice" type="number" placeholder="Preis" /><br>

    <select v-model="newMatch.visibility">
      <option value="PUBLIC">Public</option>
      <option value="PRIVATE">Private</option>
    </select>
    <br>

    <button @click="addMatch">Hinzufügen</button>
  </div>
</template>