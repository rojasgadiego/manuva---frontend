import { createStore } from 'vuex'
import auth from './modules/auth'
import theme from './theme'

export default createStore({
  modules: {
    auth,
    theme
  }
})