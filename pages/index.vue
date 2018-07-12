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
          <a class="nav-link active" id="home-tab" data-toggle="tab" href="#posts" role="tab">Posts</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="profile-tab" data-toggle="tab" href="#comments" role="tab">Comments</a>
        </li>
      </ul>
      <div class="tab-content" id="myTabContent">
        <div class="tab-pane fade show active" id="posts" role="tabpanel">
          <ul class="list-group">
            <li class="list-group-item" v-for="post in $store.state.posts" :key="post.id" :post="post">
              <div class="float-left">{{ post.title }}</div>
              <button class="btn btn-sm btn-primary float-right" data-toggle="modal" data-target="#editorModal" @click="$store.commit('setActivePost', post)"><i class="fas fa-pen"></i></button>
            </li>
          </ul>
        </div>
        <div class="tab-pane fade" id="comments" role="tabpanel">
          <ul class="list-group">
            <li class="list-group-item" v-for="comment in $store.state.comments" :key="comment.id" :comment="comment">
              <div class="float-left">
                <small>Re: {{ comment.root_title }}</small><br>
                <small class="text-muted" v-html="renderCommentBody(comment.body)"></small>
              </div>
              <button class="btn btn-sm btn-primary float-right" data-toggle="modal" data-target="#editorModal" @click="$store.commit('setActivePost', comment)"><i class="fas fa-pen"></i></button>
            </li>
          </ul>
        </div>
      </div>

      <div class="modal fade" id="editorModal" tabindex="-1" role="dialog" v-if="$store.state.activePost">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Edit JSON Metadata</h5>
              <button type="button" class="close" data-dismiss="modal">
                <span>&times;</span>
              </button>
            </div>
            <div class="modal-body p-0">
              <textarea v-model="$store.state.activeJsonMetadataString" class="border-0 d-block w-100 p-3" style="height: 350px;"></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" @click="saveMetadata" v-if="isValidJson">
                <span v-if="saving"><i class="fas fa-spinner fa-spin"></i> Saving...</span>
                <span v-else>Save changes</span>
              </button>
              <span v-else class="text-danger">Invalid JSON</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="text-center py-5" v-else>
      <a :href="$steemconnect.getLoginURL()" class="btn btn-primary">Login with SteemConnect</a>
    </div>
  </div>
</template>

<script>
// TODO: add notification
import marked from 'marked'

export default {
  data () {
    return {
      saving: false
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
      await this.$store.dispatch('fetchPosts')
      await this.$store.dispatch('fetchComments')
      this.$store.commit('setActivePost', this.$store.state.posts[0])
    }
  },
  computed: {
    isValidJson () {
      try {
        JSON.parse(this.$store.state.activeJsonMetadataString);
      } catch (e) {
        return false;
      }
      return true;
    }
  },
  methods: {
    logout () {
      this.$store.dispatch('logout')
    },
    renderCommentBody (body) {
      return marked(body)
    },
    saveMetadata () {
      this.saving = true
      this.$steemconnect.comment(
        this.$store.state.activePost.parent_author,
        this.$store.state.activePost.parent_permlink,
        this.$store.state.activePost.author,
        this.$store.state.activePost.permlink,
        this.$store.state.activePost.title,
        this.$store.state.activePost.body,
        JSON.parse(this.$store.state.activeJsonMetadataString),
        (err) => {
          this.saving = false
          if (err) console.log(err)
          else {
            this.$store.dispatch('fetchPosts')
            this.$store.dispatch('fetchComments')
          }
        }
      )
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