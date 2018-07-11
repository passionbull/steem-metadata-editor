import Vue from 'vue'
import Vuex from 'vuex'
import VueSteemConnect from 'vue-steemconnect'

Vue.use(VueSteemConnect, {
  app: 'mkt.test',
  callbackURL: 'http://localhost:3000/auth'
})

const createStore = () => {
  return new Vuex.Store({
    state: {
      user: null
    },
    mutations: {
      login (state, user) {
        state.user = user
      },
      logout (state) {
        state.user = null
      }
    },
    actions: {
      login ({ commit }, accessToken) {
        return new Promise((resolve, reject) => {
          Vue.SteemConnect().setAccessToken(accessToken)
          Vue.SteemConnect().me((err, user) => {
            if (err) reject(err)
            else {
              commit('login', user)
              resolve()
            }
          })
        })
      },
      logout ({ commit }) {
        localStorage.removeItem('access_token')
        commit('logout')
      }
    }
  })
}

export default createStore