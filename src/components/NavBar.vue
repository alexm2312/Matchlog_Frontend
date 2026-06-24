<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'
import UserMenu from './UserMenu.vue'

const {
  isLoading,
  isAuthenticated,
  user,
  loginWithRedirect,
  logout: auth0Logout,
} = useAuth0()

const login = () => loginWithRedirect()

const signup = () =>
  loginWithRedirect({
    authorizationParams: {
      screen_hint: 'signup',
    },
  })

const logout = () =>
  auth0Logout({
    logoutParams: {
      returnTo: window.location.origin,
    },
  })

defineExpose({ signup })
</script>

<template>
  <header class="nav">
    <div class="nav__inner container">
      <RouterLink to="/" class="nav__brand">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            d="M3 5h18v3l-4 2v9a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-9L3 8V5Z"
            fill="none"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linejoin="round"
          />
          <path d="M9 9h6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
        </svg>
        Matchlog
      </RouterLink>

      <nav class="nav__links">
        <RouterLink to="/" class="nav__link">Home</RouterLink>
        <RouterLink to="/diary" class="nav__link">Diary</RouterLink>
        <RouterLink to="/public" class="nav__link">Public</RouterLink>
      </nav>

      <div class="nav__auth">
        <span v-if="isLoading" class="nav__loading">Lädt …</span>

        <template v-else-if="isAuthenticated && user">
          <UserMenu :email="user.email" @logout="logout" />
        </template>

        <template v-else>
          <button class="btn btn-ghost" @click="login">Login</button>
          <button class="btn btn-primary" @click="signup">Account erstellen</button>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 40;
  height: var(--nav-height);
  background: var(--c-panel);
  border-bottom: 1px solid var(--c-stub-line);
}

.nav__inner {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 36px;
}

.nav__brand {
  display: flex;
  align-items: center;
  gap: 9px;
  font-family: var(--f-display);
  font-size: 1.15rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--c-paper);
  flex-shrink: 0;
}

.nav__brand svg {
  color: var(--c-floodlight);
}

.nav__links {
  display: flex;
  gap: 26px;
  flex: 1;
}

.nav__link {
  font-family: var(--f-display);
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--c-chalk-dim);
  padding: 6px 2px;
  border-bottom: 2px solid transparent;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.nav__link:hover {
  color: var(--c-paper);
}

.nav__link.router-link-exact-active {
  color: var(--c-floodlight-soft);
  border-color: var(--c-floodlight);
}

.nav__auth {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.nav__loading {
  font-family: var(--f-mono);
  font-size: 0.78rem;
  color: var(--c-chalk-dim);
}

@media (max-width: 720px) {
  .nav__inner {
    gap: 18px;
  }

  .nav__links {
    gap: 14px;
  }

  .btn-ghost {
    display: none;
  }
}
</style>
