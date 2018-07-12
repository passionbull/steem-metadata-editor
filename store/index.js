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
      posts: [],
      comments: [],
      activePost: null,
      activeJsonMetadataString: null
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
      },
      setComments (state, comments) {
        state.comments = comments
      },
      setActivePost (state, post) {
        state.activePost = post
        state.activeJsonMetadataString = JSON.stringify(JSON.parse(post.json_metadata), null, 4)
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
        return new Promise((resolve, reject) => {
          steem.api.getDiscussionsByBlog({tag: state.user.account.name, limit: 100}, (err, posts) => {
            if (err) reject(err);
            else {
              posts = posts.filter(post => post.author === state.user.account.name)
              commit('setPosts', posts)
              resolve()
            }
          })
        })
      },
      fetchComments ({ commit, state }) {
        return new Promise((resolve, reject) => {
          steem.api.getDiscussionsByComments({start_author: state.user.account.name, limit: 100}, (err, comments) => {
            if (err) reject(err);
            else {
              commit('setComments', comments)
              resolve()
            }
          })
        })
      }
    }
  })
}

export default createStore