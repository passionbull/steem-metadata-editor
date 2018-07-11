<template>
  <h1 class="text-center py-5">Connecting...</h1>
</template>

<script>
export default {
  async mounted () {
    let accessToken = this.$route.query['access_token']
    if (accessToken) {
      localStorage.setItem('access_token', accessToken)
      await this.$store.dispatch('login', accessToken)
      this.$router.push('/')
    }
  }
}
</script>