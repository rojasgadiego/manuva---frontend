import { nextTick } from 'vue'

const STORAGE_KEY = 'app-theme'

/**
 * Aplica una transición uniforme de 200ms a TODOS los elementos
 * durante el cambio de tema, luego la remueve para no interferir
 * con las animaciones normales de la app.
 */
const applyTheme = async (commit, theme) => {
  // 1. Forzar la misma transición en todos los elementos
  const style = document.createElement('style')
  style.id = '__theme-transition__'
  style.textContent = `
    *, *::before, *::after {
      transition:
        background-color 200ms ease,
        border-color     200ms ease,
        color            200ms ease !important;
    }
  `
  document.head.appendChild(style)

  // 2. Aplicar el tema
  commit('SET_THEME', theme)

  // 3. Esperar render de Vue + 2 frames para que el fade termine
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 250))

  // 4. Remover — las transiciones de hover/interacción vuelven a sus valores normales
  const el = document.getElementById('__theme-transition__')
  if (el) el.remove()
}

const state = () => ({
  theme: localStorage.getItem(STORAGE_KEY) || 'dark',
})

const getters = {
  theme:  (state) => state.theme,
  isDark: (state) => state.theme === 'dark',
}

const mutations = {
  SET_THEME(state, theme) {
    state.theme = theme
    localStorage.setItem(STORAGE_KEY, theme)
  },
}

const actions = {
  async toggleTheme({ state, commit }) {
    const next = state.theme === 'dark' ? 'light' : 'dark'
    await applyTheme(commit, next)
  },

  async setTheme({ commit }, theme) {
    if (!['dark', 'light'].includes(theme)) return
    await applyTheme(commit, theme)
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}