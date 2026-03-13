const STORAGE_KEY = 'app-theme'

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
  toggleTheme({ state, commit }) {
    const next = state.theme === 'dark' ? 'light' : 'dark'
    commit('SET_THEME', next)
  },

  setTheme({ commit }, theme) {
    if (!['dark', 'light'].includes(theme)) return
    commit('SET_THEME', theme)
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}