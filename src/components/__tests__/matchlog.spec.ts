import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, nextTick } from 'vue'

// --- Globale Mocks (Vitest hoistet vi.mock() automatisch vor alle Imports) ----

vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: vi.fn(),
}))

vi.mock('@/services/api', () => ({
  visitsApi: {
    getPublic: vi.fn(),
    getMine: vi.fn(),
    create: vi.fn(),
  },
}))

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    create: vi.fn(() => ({ get: vi.fn(), post: vi.fn() })),
  },
}))

// Imports nach den Mock-Deklarationen
import MatchStub from '@/components/MatchStub.vue'
import UserMenu from '@/components/UserMenu.vue'
import AuthButtons from '@/components/AuthButtons.vue'
import Matchlist from '@/components/Matchlist.vue'
import PublicView from '@/views/PublicView.vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { visitsApi } from '@/services/api'
import axios from 'axios'
import type { MatchEntry } from '@/types/match'

// --- Test-Hilfsdaten ---

const mockMatch: MatchEntry = {
  id: 1,
  homeTeam: 'Hertha BSC',
  awayTeam: 'Schalke 04',
  stadium: 'Olympiastadion',
  city: 'Berlin',
  country: 'Deutschland',
  date: '2026-03-14',
  score: '2:1',
  attendance: 48211,
  weather: 'Bewölkt, 9°C',
  ratings: { atmosphere: 4, ambience: 4, food: 3, travel: 5, fanculture: 4, security: 4 },
  note: 'Tolle Stimmung!',
  visibility: 'PUBLIC',
}

// Erzeugt einen Standard-Auth0-Stub; Felder können überschrieben werden
const makeAuth0 = (overrides: Record<string, unknown> = {}) => ({
  user: ref<{ email?: string; nickname?: string; name?: string } | undefined>(undefined),
  isAuthenticated: ref(false),
  isLoading: ref(false),
  error: ref<Error | null>(null),
  loginWithRedirect: vi.fn(),
  logout: vi.fn(),
  ...overrides,
})

// Stubs für Komponenten, die einen Vue-Router voraussetzen
const routerStubs = {
  RouterLink: { template: '<a><slot /></a>' },
  Transition: { template: '<slot />' },
}

// =============================================================================
describe('Matchlog Frontend – Unit Tests', () => {
  beforeEach(() => {
    // Vor jedem Test alle Mock-Aufrufe und Zustände zurücksetzen
    vi.clearAllMocks()
    vi.mocked(useAuth0).mockReturnValue(makeAuth0() as any)
  })

  // ---------------------------------------------------------------------------
  // Test 1: Komponente mounted ohne Fehler
  // ---------------------------------------------------------------------------
  it('1. MatchStub wird ohne Fehler gemountet (wrapper.exists() === true)', () => {
    // MatchStub ist eine reine Darstellungskomponente ohne externe Abhängigkeiten
    const wrapper = mount(MatchStub, {
      props: { match: mockMatch },
    })

    expect(wrapper.exists()).toBe(true)
  })

  // ---------------------------------------------------------------------------
  // Test 2: Mock von axios.get() beim Mount – Daten werden in die Komponente geladen
  // ---------------------------------------------------------------------------
  it('2. PublicView ruft visitsApi.getPublic() beim Mount auf und lädt die Daten', async () => {
    // Der Mock gibt immer dasselbe feste Dummy-Ergebnis zurück
    vi.mocked(visitsApi.getPublic).mockResolvedValue({ data: [mockMatch] } as never)

    const wrapper = mount(PublicView, {
      global: { stubs: { ...routerStubs, MatchStub: true, StadiumCard: true } },
    })

    // Alle ausstehenden Promises abwarten (onMounted ist async)
    await flushPromises()

    // getPublic wurde beim Mount genau einmal aufgerufen
    expect(vi.mocked(visitsApi.getPublic)).toHaveBeenCalledOnce()
    // Ladeindikator ist nach dem Laden verschwunden
    expect(wrapper.text()).not.toContain('Lädt …')
  })

  // ---------------------------------------------------------------------------
  // Test 3: Mock von axios.post() bei Formularabsendung
  // ---------------------------------------------------------------------------
  it('3. Matchlist – addMatch() sendet axios.post() mit den Formulardaten', async () => {
    // Eingeloggten Benutzer simulieren
    vi.mocked(useAuth0).mockReturnValue(
      makeAuth0({
        user: ref({ email: 'alex@example.com', nickname: 'alex' }),
      }) as any,
    )
    vi.mocked(axios.get).mockResolvedValue({ data: [] } as never)
    vi.mocked(axios.post).mockResolvedValue({ data: {} } as never)

    const wrapper = mount(Matchlist, { global: { stubs: routerStubs } })
    // Initialen loadMatches()-Aufruf abwarten
    await flushPromises()

    // Formularfelder mit Testdaten befüllen
    await wrapper.find('input[placeholder="Spielname"]').setValue('Bayern vs BVB')
    await wrapper.find('input[placeholder="Stadion"]').setValue('Allianz Arena')

    // "Hinzufügen"-Button klicken → addMatch() wird ausgeführt
    await wrapper.find('button').trigger('click')
    await flushPromises()

    // axios.post wurde mit den erwarteten Daten aufgerufen
    expect(vi.mocked(axios.post)).toHaveBeenCalledWith(
      expect.stringContaining('/api/matches'),
      expect.objectContaining({
        title: 'Bayern vs BVB',
        owner: 'alex@example.com',
      }),
    )
  })

  // ---------------------------------------------------------------------------
  // Test 4: Fehlerfall – axios wirft einen Fehler, Fehlermeldung in der UI
  // ---------------------------------------------------------------------------
  it('4. PublicView zeigt Fehlermeldung wenn visitsApi.getPublic() fehlschlägt', async () => {
    // Mock wird so konfiguriert, dass er einen Fehler wirft
    vi.mocked(visitsApi.getPublic).mockRejectedValue(new Error('Network Error'))

    const wrapper = mount(PublicView, {
      global: { stubs: { ...routerStubs, MatchStub: true, StadiumCard: true } },
    })

    await flushPromises()

    // Die Fehlermeldung aus dem catch-Block muss im DOM sichtbar sein
    expect(wrapper.text()).toContain('Public-Feed konnte nicht geladen werden')
  })

  // ---------------------------------------------------------------------------
  // Test 5: Props werden korrekt gerendert (wrapper.props())
  // ---------------------------------------------------------------------------
  it('5. MatchStub rendert Heim-/Auswärtsteam und Sichtbarkeits-Tag aus den Props', () => {
    const wrapper = mount(MatchStub, {
      props: { match: mockMatch, showVisibility: true },
    })

    // Props sind korrekt übergeben worden
    expect(wrapper.props('match').homeTeam).toBe('Hertha BSC')
    expect(wrapper.props('showVisibility')).toBe(true)

    // Beide Teams werden im DOM angezeigt
    expect(wrapper.text()).toContain('Hertha BSC')
    expect(wrapper.text()).toContain('Schalke 04')
    // Visibility-Tag ist für PUBLIC = "Öffentlich" sichtbar
    expect(wrapper.text()).toContain('Öffentlich')
  })

  // ---------------------------------------------------------------------------
  // Test 6: Button-Klick mit wrapper.trigger('click')
  // ---------------------------------------------------------------------------
  it('6. UserMenu – Klick auf Avatar-Button öffnet das Dropdown-Panel', async () => {
    const wrapper = mount(UserMenu, {
      props: { email: 'test@example.com' },
      global: { stubs: routerStubs },
    })

    // Das Panel ist anfangs nicht im DOM (v-if="isOpen" ist false)
    expect(wrapper.find('.usermenu__panel').exists()).toBe(false)

    // Avatar-Button klicken → isOpen wird true
    await wrapper.find('.usermenu__trigger').trigger('click')

    // Panel ist jetzt sichtbar und zeigt die E-Mail an
    expect(wrapper.find('.usermenu__panel').exists()).toBe(true)
    expect(wrapper.text()).toContain('test@example.com')
  })

  // ---------------------------------------------------------------------------
  // Test 7: Formulareingabe mit wrapper.setValue()
  // ---------------------------------------------------------------------------
  it('7. Matchlist – setValue() aktualisiert den Spielnamen im v-model-Input', async () => {
    vi.mocked(useAuth0).mockReturnValue(
      makeAuth0({ user: ref({ email: 'alex@example.com' }) }) as any,
    )
    vi.mocked(axios.get).mockResolvedValue({ data: [] } as never)

    const wrapper = mount(Matchlist, { global: { stubs: routerStubs } })
    await flushPromises()

    const input = wrapper.find('input[placeholder="Spielname"]')
    // setValue() setzt den Wert und löst das input-Event aus (v-model-Binding)
    await input.setValue('Testspiel FC')

    expect((input.element as HTMLInputElement).value).toBe('Testspiel FC')
  })

  // ---------------------------------------------------------------------------
  // Test 8: Conditional Rendering (v-if) – Element sichtbar/unsichtbar je nach State
  // ---------------------------------------------------------------------------
  it('8. AuthButtons – zeigt Login wenn nicht eingeloggt, Logout-Button wenn eingeloggt', () => {
    // Zustand: nicht eingeloggt
    vi.mocked(useAuth0).mockReturnValue(
      makeAuth0({ isAuthenticated: ref(false), isLoading: ref(false) }) as any,
    )
    const loggedOut = mount(AuthButtons)
    // Login-Button muss sichtbar sein, Logout-Button darf nicht existieren
    expect(loggedOut.text()).toContain('Login')
    expect(loggedOut.text()).not.toContain('Logout')

    // Zustand: eingeloggt
    vi.mocked(useAuth0).mockReturnValue(
      makeAuth0({
        isAuthenticated: ref(true),
        isLoading: ref(false),
        user: ref({ email: 'alex@example.com' }),
      }) as any,
    )
    const loggedIn = mount(AuthButtons)
    // Logout-Button muss sichtbar sein, Login-Button darf nicht existieren
    expect(loggedIn.text()).toContain('Logout')
    expect(loggedIn.text()).not.toContain('Login')
  })

  // ---------------------------------------------------------------------------
  // Test 9: Emittiertes Event prüfen (wrapper.emitted())
  // ---------------------------------------------------------------------------
  it('9. UserMenu emittiert "logout"-Event wenn Abmelden-Button geklickt wird', async () => {
    const wrapper = mount(UserMenu, {
      props: { email: 'test@example.com' },
      global: { stubs: routerStubs },
    })

    // Menü erst öffnen, damit der Abmelden-Button im DOM erscheint
    await wrapper.find('.usermenu__trigger').trigger('click')

    // Abmelden-Button finden und klicken
    const abmeldenBtn = wrapper.findAll('button').find((b) => b.text().includes('Abmelden'))
    expect(abmeldenBtn).toBeDefined()
    await abmeldenBtn!.trigger('click')

    // Das logout-Event muss genau einmal emittiert worden sein
    expect(wrapper.emitted('logout')).toBeTruthy()
    expect(wrapper.emitted('logout')).toHaveLength(1)
  })

  // ---------------------------------------------------------------------------
  // Test 10: Async-Test – await nextTick() nach State-Änderung, dann DOM prüfen
  // ---------------------------------------------------------------------------
  it('10. PublicView – Ladeindikator verschwindet nach nextTick wenn API antwortet', async () => {
    // Kontrollierbares Promise: wird erst aufgelöst, wenn wir es wollen
    let resolveApi!: (v: unknown) => void
    const pendingApi = new Promise<unknown>((r) => {
      resolveApi = r
    })
    vi.mocked(visitsApi.getPublic).mockReturnValue(pendingApi as never)

    const wrapper = mount(PublicView, {
      global: { stubs: { ...routerStubs, MatchStub: true, StadiumCard: true } },
    })

    // Solange die API noch nicht geantwortet hat, soll der Ladeindikator sichtbar sein
    expect(wrapper.text()).toContain('Lädt …')

    // API-Antwort manuell auflösen
    resolveApi({ data: [] })

    // Auf die DOM-Aktualisierung durch Vue warten
    await nextTick()
    await nextTick()

    // Nach der Auflösung muss der Ladeindikator verschwunden sein
    expect(wrapper.text()).not.toContain('Lädt …')
  })
})
