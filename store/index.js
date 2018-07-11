import Vue from 'vue'
import Vuex from 'vuex'
import VueSteemConnect from 'vue-steemconnect'
import steem from 'steem'

Vue.use(VueSteemConnect, {
  app: 'mkt.test',
  callbackURL: 'http://localhost:3000/auth'
})

const createStore = () => {
  return new Vuex.Store({
    state: {
      user: null,
      posts: []
    },
    mutations: {
      login (state, user) {
        state.user = user
      },
      logout (state) {
        state.user = null
      },
      setPosts (state, posts) {
        state.posts = posts
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
      },
      fetchPosts ({ commit, state }) {
        steem.api.getDiscussionsByBlog({tag: state.user.account.name, limit: 100}, (err, posts) => {
          if (err) console.log(err);
          else {
            commit('setPosts', posts.filter(post => post.author === state.user.account.name))
          }
        })
      }
    }
  })
}

export default createStore