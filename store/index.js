import Vue from 'vue'
import Vuex from 'vuex'
import VueSteemConnect from 'vue-steemconnect'
import steem from 'steem'

// make steemconnect available
Vue.use(VueSteemConnect, {
  app: 'mkt.test',
  callbackURL: 'https://steem-metadata-editor.herokuapp.com/auth'
})

const createStore = () => {
  return new Vuex.Store({
    state: {
      user: null, // logged in user, via steemconnect
      posts: [], // user's posts
      comments: [], // user's comments
      activePost: null, // currently selected post/comment (set by clicking the edit button)
      activeJsonMetadataString: null // edited post's/comment's json_metadata as an indented string
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
        // always when active post changes, also change active metadata
        state.activeJsonMetadataString = JSON.stringify(JSON.parse(post.json_metadata), null, 4)
      }
    },
    actions: {
      login ({ commit }, accessToken) {
        // return prmoise to be able to wait for the user object to be set
        return new Promise((resolve, reject) => {
          // set access token and try to fetch user object
          Vue.SteemConnect().setAccessToken(accessToken)
          Vue.SteemConnect().me((err, user) => {
            if (err) reject(err)
            else {
              // save user object in store
              commit('login', user)
              resolve()
            }
          })
        })
      },
      logout ({ commit }) {
        // remove access token and unset user in store
        localStorage.removeItem('access_token')
        commit('logout')
      },
      fetchPosts ({ commit, state }) {
        // return promise to be able to wait for posts to be fetched
        return new Promise((resolve, reject) => {
          steem.api.getDiscussionsByBlog({tag: state.user.account.name, limit: 100}, (err, posts) => {
            if (err) reject(err);
            else {
              // filter to remove resteems, we need only posts from the logged in user
              posts = posts.filter(post => post.author === state.user.account.name)
              // save posts in store
              commit('setPosts', posts)
              resolve()
            }
          })
        })
      },
      fetchComments ({ commit, state }) {
        // return promise to be able to wait for comments to be fetched
        return new Promise((resolve, reject) => {
          steem.api.getDiscussionsByComments({start_author: state.user.account.name, limit: 100}, (err, comments) => {
            if (err) reject(err);
            else {
              // save comments in store, no filtering necessary
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