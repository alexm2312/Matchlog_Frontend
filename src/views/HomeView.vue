<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue'
import MatchStub from '@/components/MatchStub.vue'
import { publicMatches } from '@/data/mockMatches'
import heroImage from '@/assets/meinbild.jpg'

const { loginWithRedirect } = useAuth0()

const getStarted = () =>
  loginWithRedirect({
    authorizationParams: { screen_hint: 'signup' },
  })

const teaserMatches = publicMatches.slice(0, 3)
</script>

<template>
  <main class="home">
    <!-- Hero -->
    <section class="hero">
      <img :src="heroImage" alt="Stadion unter Flutlicht" class="hero__image" />
      <div class="hero__scrim"></div>
      <div class="hero__content container">
        <p class="eyebrow">Dein Matchday-Tagebuch</p>
        <h1 class="hero__title">Jeder Besuch<br />ein eigenes Ticket.</h1>
        <p class="hero__subtitle">
          Matchlog hält fest, in welchen Stadien du warst, wie es sich angefühlt hat und was du
          erlebt hast. Spieldaten, Wetter und Zuschauerzahl zieht die App automatisch –
          du bringst nur die Geschichte dazu.
        </p>
        <div class="hero__actions">
          <button class="btn btn-primary btn-lg" @click="getStarted">Get started</button>
          <RouterLink to="/public" class="hero__secondary">Bewertungen ansehen →</RouterLink>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="feature container">
      <div class="feature__text">
        <p class="eyebrow">01 — Tracken</p>
        <h2>Deine persönliche<br />Matchday-Historie</h2>
        <p>
          Endstand, Zuschauerzahl und Wetter am Spieltag holt sich Matchlog automatisch über
          eine Sport-API. Du musst nichts abschreiben, nur dabei gewesen sein.
        </p>
      </div>
      <div class="feature__visual feature__visual--stub">
        <span class="feature__stub-line">⚽ Endstand · 👥 Zuschauer · 🌤 Wetter</span>
      </div>
    </section>

    <section class="feature feature--reverse container">
      <div class="feature__text">
        <p class="eyebrow">02 — Bewerten</p>
        <h2>Sechs Kategorien,<br />ein ehrliches Bild</h2>
        <p>
          Atmosphäre, Ambiente, Essen & Getränke, Anreise, Fankultur und Sicherheit – bewerte,
          was einen Spieltag wirklich ausmacht, und halte deinen Erlebnisbericht dazu fest.
        </p>
      </div>
      <div class="feature__visual feature__visual--ratings">
        <div
          v-for="label in ['Atmosphäre', 'Ambiente', 'Essen', 'Anreise', 'Fankultur', 'Sicherheit']"
          :key="label"
          class="feature__rating-row"
        >
          <span>{{ label }}</span>
          <span class="feature__pips">
            <span v-for="n in 5" :key="n" class="feature__pip" :class="{ 'is-filled': n <= 4 }" />
          </span>
        </div>
      </div>
    </section>

    <section class="feature container">
      <div class="feature__text">
        <p class="eyebrow">03 — Teilen</p>
        <h2>Wissen, wie ein<br />Stadion wirklich ist</h2>
        <p>
          Mach deine Bewertungen öffentlich und finde ehrliche Erfahrungsberichte, bevor du
          selbst zum Auswärtsspiel reist – von Fans, die schon da waren.
        </p>
      </div>
      <div class="feature__visual feature__visual--globe">🌍</div>
    </section>

    <!-- Teaser stubs -->
    <section class="teaser">
      <div class="container">
        <p class="eyebrow">So sieht ein Eintrag aus</p>
        <h2>Aus dem Public-Feed</h2>
      </div>
      <div class="teaser__scroller container">
        <MatchStub v-for="m in teaserMatches" :key="m.id" :match="m" />
      </div>
    </section>

    <!-- Final CTA -->
    <section class="cta container">
      <h2>Bereit für dein erstes Ticket?</h2>
      <button class="btn btn-primary btn-lg" @click="getStarted">Account erstellen</button>
    </section>
  </main>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
}

/* Hero */
.hero {
  position: relative;
  min-height: 86vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(20, 23, 28, 0.55) 0%,
    rgba(20, 23, 28, 0.78) 55%,
    rgba(20, 23, 28, 0.97) 100%
  );
}

.hero__content {
  position: relative;
  max-width: 640px;
}

.hero__title {
  margin-top: 14px;
  font-size: clamp(2.4rem, 6vw, 4.2rem);
}

.hero__subtitle {
  margin-top: 20px;
  font-size: 1.05rem;
  color: var(--c-chalk);
  max-width: 520px;
}

.hero__actions {
  margin-top: 32px;
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.btn-lg {
  padding: 15px 34px;
  font-size: 0.9rem;
}

.hero__secondary {
  font-family: var(--f-mono);
  font-size: 0.85rem;
  color: var(--c-paper);
  border-bottom: 1px dashed var(--c-stub-line);
  padding-bottom: 2px;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.hero__secondary:hover {
  color: var(--c-floodlight-soft);
  border-color: var(--c-floodlight);
}

/* Features */
.feature {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  align-items: center;
  padding: 96px 24px;
}

.feature--reverse {
  direction: rtl;
}

.feature--reverse .feature__text,
.feature--reverse .feature__visual {
  direction: ltr;
}

.feature__text h2 {
  margin-top: 10px;
  font-size: 1.9rem;
}

.feature__text p:not(.eyebrow) {
  margin-top: 16px;
  color: var(--c-chalk);
  max-width: 440px;
}

.feature__visual {
  border-radius: var(--radius-card);
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature__visual--stub {
  background: var(--c-paper);
  color: var(--c-ink);
  font-family: var(--f-mono);
  font-size: 1.05rem;
  border: 1px dashed var(--c-pitch);
  padding: 24px;
  text-align: center;
}

.feature__visual--ratings {
  background: var(--c-panel-soft);
  border: 1px solid var(--c-stub-line);
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
}

.feature__rating-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--f-mono);
  font-size: 0.85rem;
  color: var(--c-paper);
}

.feature__pips {
  display: flex;
  gap: 4px;
}

.feature__pip {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(243, 238, 227, 0.18);
}

.feature__pip.is-filled {
  background: var(--c-floodlight);
}

.feature__visual--globe {
  background: var(--c-panel-soft);
  border: 1px solid var(--c-stub-line);
  font-size: 4.5rem;
}

/* Teaser */
.teaser {
  padding: 80px 0 96px;
  background: var(--c-panel);
  border-top: 1px solid var(--c-stub-line);
  border-bottom: 1px solid var(--c-stub-line);
}

.teaser h2 {
  margin-top: 6px;
  font-size: 1.7rem;
}

.teaser__scroller {
  margin-top: 36px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* CTA */
.cta {
  padding: 110px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
}

.cta h2 {
  font-size: 2rem;
}

@media (max-width: 860px) {
  .feature,
  .feature--reverse {
    grid-template-columns: 1fr;
    direction: ltr;
    padding: 64px 24px;
  }

  .teaser__scroller {
    grid-template-columns: 1fr;
  }
}
</style>
