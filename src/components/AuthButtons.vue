<template>
  <div>
    <p v-if="isLoading">Loading...</p>

    <div v-else-if="isAuthenticated && user">
      <p>Logged in as {{ user.email }}</p>
      <button @click="logout">Logout</button>
    </div>

    <div v-else>
      <p v-if="error">Error: {{ error.message }}</p>
      <button @click="login">Login</button>
      <button @click="signup">Create Account</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'

const {
  isLoading,
  isAuthenticated,
  error,
  loginWithRedirect,
  logout: auth0Logout,
  user
} = useAuth0()

const login = () => loginWithRedirect()

const signup = () =>
  loginWithRedirect({
    authorizationParams: {
      screen_hint: 'signup'
    }
  })

const logout = () =>
  auth0Logout({
    logoutParams: {
      returnTo: window.location.origin
    }
  })
</script>