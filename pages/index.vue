<template>
  <div>
    <h1 class="text-center pt-5">Steem Metadata Editor</h1>
    <div class="container pb-5" v-if="$store.state.user">
      <h5 class="lead text-center pb-1">
        logged in as <a :href="'https://steemit.com/@' + $store.state.user.account.name" target="_blank">@{{ $store.state.user.account.name }}</a>
      </h5>
      <div class="text-center pb-5"><a href="#" class="btn btn-sm btn-secondary" @click="logout()">logout <i class="fas fa-sign-out-alt"></i></a></div>

      <ul class="nav nav-tabs nav-justified" id="myTab" role="tablist">
        <li class="nav-item">
          <a class="nav-link active" id="home-tab" data-toggle="tab" href="#posts" role="tab" aria-controls="home" aria-selected="true">Posts</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="profile-tab" data-toggle="tab" href="#comments" role="tab" aria-controls="profile" aria-selected="false">Comments</a>
        </li>
      </ul>
      <div class="tab-content" id="myTabContent">
        <div class="tab-pane fade show active" id="posts" role="tabpanel" aria-labelledby="posts-tab">
          <ul class="list-group">
            <li class="list-group-item" v-for="post in $store.state.posts" :key="post.id" :post="post">
              <div class="float-left">{{ post.title }}</div>
              <button class="btn btn-sm btn-primary float-right"><i class="fas fa-pen"></i></button>
            </li>
          </ul>
        </div>
        <div class="tab-pane fade" id="comments" role="tabpanel" aria-labelledby="comments-tab">
          <ul class="list-group">
            <li class="list-group-item" v-for="comment in $store.state.comments" :key="comment.id" :comment="comment">
              <div class="float-left">
                <small>Re: {{ comment.root_title }}</small><br>
                <small class="text-muted" v-html="renderCommentBody(comment.body)"></small>
              </div>
              <button class="btn btn-sm btn-primary float-right"><i class="fas fa-pen"></i></button>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="text-center py-5" v-else>
      <a :href="$steemconnect.getLoginURL()" class="btn btn-primary">Login with SteemConnect</a>
    </div>
  </div>
</template>

<script>
import marked from 'marked'

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
      this.$store.dispatch('fetchComments')
    }
  },
  methods: {
    logout () {
      this.$store.dispatch('logout')
    },
    renderCommentBody (body) {
      return marked(body)
    }
  }
}
</script>

<style lang="sass">
  .nav-tabs
    border-bottom: none
  .list-group-item
    border-top-left-radius: 0 !important
    border-top-right-radius: 0 !important
    p
      &:last-child
        margin-bottom: 0
</style>