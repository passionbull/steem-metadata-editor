<template>
  <div class="container" v-if="$store.state.user">
    <h1>The Wizard's Lair</h1>
    <a href="#" @click="logout()">Logout</a>
    <div v-for="post in $store.state.posts" :key="post.id" :post="post">{{ post.title }}</div>
  </div>
  <div v-else>
    <a :href="$steemconnect.getLoginURL()">Login</a>
  </div>
</template>

<script>
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
      this.$store.dispatch('fetchPosts')
    }
  },
  methods: {
    logout () {
      this.$store.dispatch('logout')
    }
  }
}
</script>
