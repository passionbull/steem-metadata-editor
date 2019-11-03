# Steem Metadata Editor

Edit your post's and comment's json_metadata with ease.

## Build Setup

``` bash
# install dependencies
npm i

# serve with hot reload at localhost:3000
npm run dev

# build for production and launch server
npm run build
npm start
```

For detailed explanation on how things work, checkout [Nuxt.js docs](https://nuxtjs.org).


# deploy github page
https://gist.github.com/cobyism/4730490

npm run generate
git add dist -f && git commit -m "write your comment"
git subtree push --prefix dist origin gh-pages