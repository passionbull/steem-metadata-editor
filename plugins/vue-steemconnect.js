import Vue from 'vue'
import VueSteemConnect from 'vue-steemconnect'

Vue.use(VueSteemConnect, {
  app: 'wp-steem-share',
  callbackURL: 'http://localhost:3000/auth',
  scope: ['vote', 'comment']
})