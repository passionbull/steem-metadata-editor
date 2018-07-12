<template>
  <div>
    <!-- Headline with wunderfull creative logo :P -->
    <h1 class="text-center pt-5">
      { }<br>
      Steem Metadata Editor
    </h1>

    <!-- logged in: -->
    <div class="container pb-5" v-if="$store.state.user">
      <!-- user info/logout button -->
      <h5 class="lead text-center pb-1">
        logged in as <a :href="'https://steemit.com/@' + $store.state.user.account.name" target="_blank">@{{ $store.state.user.account.name }}</a>
      </h5>
      <div class="text-center pb-5"><a href="#" class="btn btn-sm btn-secondary" @click="logout()">logout <i class="fas fa-sign-out-alt"></i></a></div>

      <!-- tabs to switch between posts and comments -->
      <ul class="nav nav-tabs nav-justified" id="myTab" role="tablist">
        <li class="nav-item">
          <a class="nav-link active" id="home-tab" data-toggle="tab" href="#posts" role="tab">Posts</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" id="profile-tab" data-toggle="tab" href="#comments" role="tab">Comments</a>
        </li>
      </ul>

      <!-- lists of posts and comments -->
      <div class="tab-content" id="myTabContent">
        <!-- lists of posts -->
        <div class="tab-pane fade show active" id="posts" role="tabpanel">
          <ul class="list-group">
            <!-- single item -->
            <li class="list-group-item" v-for="post in $store.state.posts" :key="post.id" :post="post">
              <div class="float-left">{{ post.title }}</div>
              <!-- button to switch active post and json_metadata -->
              <button class="btn btn-sm btn-primary float-right" data-toggle="modal" data-target="#editorModal" @click="$store.commit('setActivePost', post)"><i class="fas fa-pen"></i></button>
            </li>
          </ul>
        </div>

        <!-- lists of comments -->
        <div class="tab-pane fade" id="comments" role="tabpanel">
          <ul class="list-group">
            <!-- single item -->
            <li class="list-group-item" v-for="comment in $store.state.comments" :key="comment.id" :comment="comment">
              <div class="float-left">
                <small>Re: {{ comment.root_title }}</small><br>
                <small class="text-muted" v-html="renderCommentBody(comment.body)"></small>
              </div>
              <!-- button to switch active comment and json_metadata -->
              <button class="btn btn-sm btn-primary float-right" data-toggle="modal" data-target="#editorModal" @click="$store.commit('setActivePost', comment)"><i class="fas fa-pen"></i></button>
            </li>
          </ul>
        </div>
      </div>

      <!-- modal to hold the textarea to edit the jsonMetadata -->
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
              <!-- always show cancel button, show save button when metadata valid, otherwise show Invalid JSON error-->
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

    <!-- logged out, just show SteemConnect login button -->
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
      saving: false // loading indicator for Save Changes button
    }
  },
  async mounted () {
    // state.user will be set, when coming from auth page
    // but not if accessed this page directly
    if (!this.$store.state.user) {
      // in that case we look for an access token in localStorage
      const accessToken = localStorage.getItem('access_token')
      if (accessToken) {
        // and try to login with it (await is important, for the next if to be reliable )
        await this.$store.dispatch('login', accessToken)
      }
    }

    // if logged in, fetch posts/comments and set first post as active one
    if (this.$store.state.user) {
      await this.$store.dispatch('fetchPosts')
      await this.$store.dispatch('fetchComments')
      this.$store.commit('setActivePost', this.$store.state.posts[0])
    }
  },
  computed: {
    // helper to toggle error message an button in editor modal
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
    // for comments it shows the actual body in the group-list, so let's parse the markdown with marked
    renderCommentBody (body) {
      return marked(body)
    },
    // the essence, saving the edited jsonMetadata
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
            // and update data (posts/comments) again, once metadata is update
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
  body
    background: #f8f8f8
    font-family: 'Roboto', sans-serif
  h1
    font-family: 'Roboto', sans-serif
  .nav-tabs
    border-bottom: none
  .list-group-item
    border-top-left-radius: 0 !important
    border-top-right-radius: 0 !important
    p
      &:last-child
        margin-bottom: 0
</style>