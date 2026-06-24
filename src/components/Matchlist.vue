<script setup lang="ts">
import { ref, watch } from 'vue'
import axios from 'axios'
import { useAuth0 } from '@auth0/auth0-vue'

const { user } = useAuth0()

const matches = ref<{ title: string; location: string; ticketprice: number }[]>([])

const newMatch = ref({
  title: '',
  location: '',
  ticketprice: 0,
  visibility: 'PUBLIC'
})

const loadMatches = async () => {
  const response = await axios.get(
    'https://matchlog-backend-12iq.onrender.com/api/matches',
    {
      params: {
        owner: user.value?.email
      }
    }
  )

  matches.value = response.data
}

const addMatch = async () => {
  await axios.post(
    'https://matchlog-backend-12iq.onrender.com/api/matches',
    {
      ...newMatch.value,
      owner: user.value?.email
    }
  )

  newMatch.value = {
    title: '',
    location: '',
    ticketprice: 0,
    visibility: 'PUBLIC'
  }

  await loadMatches()
}

watch(
  () => user.value?.email,
  () => {
    loadMatches()
  },
  { immediate: true }
)
</script>

<template>
  <img src="@/assets/meinbild.jpg" alt="Logo">

  <div>
    <h2>Spiele</h2>

    <p>
      Hier findest du eine Liste aller Spiele, die in unserer Datenbank gespeichert
      sind. Klicke auf ein Spiel, um weitere Details zu erfahren.
    </p>

    <br>

    <div v-for="match in matches" :key="match.title">
      <h3>{{ match.title }}</h3>
      <p>Standort: {{ match.location }}</p>
      <p>Preis: {{ match.ticketprice }} €</p>
      <hr />
    </div>

    <h2>Neues Spiel hinzufügen</h2>

    <input v-model="newMatch.title" placeholder="Spielname" />
    <br>

    <input v-model="newMatch.location" placeholder="Stadion" />
    <br>

    <input
      v-model="newMatch.ticketprice"
      type="number"
      placeholder="Preis"
    />
    <br>

    <select v-model="newMatch.visibility">
      <option value="PUBLIC">Public</option>
      <option value="PRIVATE">Private</option>
    </select>

    <br>

    <button @click="addMatch">
      Hinzufügen
    </button>
  </div>
</template>