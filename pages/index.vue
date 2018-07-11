<template>
  <div class="container" v-if="$store.state.user">
    <h1>The Wizard's Lair</h1>
    <a href="#" @click="logout()">Logout</a>
    <div v-for="post in posts" :key="post.id" :post="post">{{ post.title }}</div>
  </div>
  <div v-else>
    <a :href="$steemconnect.getLoginURL()">Login</a>
  </div>
</template>

<script>
import steem from 'steem'

export default {
  data() {
    return {
      posts: []
    }
  },
  async mounted () {
    if (!this.$store.state.user) {
      const accessToken = localStorage.getItem('access_token')
      if (accessToken) {
        await this.$store.dispatch('login', accessToken)
      }
    }

    if (this.$store.state.user) {
      this.fetchPosts()
    }
  },
  methods: {
    fetchPosts () {
      steem.api.getDiscussionsByBlog({tag: this.$store.state.user.account.name, limit: 100}, (err, posts) => {
        if (err) console.log(err);
        else {
          this.posts = posts.filter(post => post.author === this.$store.state.user.account.name)
        }
      })
    },
    logout () {
      this.$store.dispatch('logout')
    }
  }
}
</script>
