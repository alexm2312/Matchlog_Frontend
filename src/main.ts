import './assets/main.css'

import { createApp } from 'vue'
import { createAuth0 } from '@auth0/auth0-vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

console.log(import.meta.env.VITE_AUTH0_DOMAIN)
console.log(import.meta.env.VITE_AUTH0_CLIENT_ID)


app.use(
  createAuth0({
     domain: 'dev-gsn68j8j4nav33ps.us.auth0.com',
     clientId: 'Q9v5cf3XrHIfH11FLv5CFjsR0tkMZj4r',
    authorizationParams: {
      redirect_uri: window.location.origin
    }
  })
)

app.use(router)

app.mount('#app')