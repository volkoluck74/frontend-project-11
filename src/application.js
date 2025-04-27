import * as yup from 'yup'
import axios from 'axios'
import _ from 'lodash'
import watcherValidateInput from './view.js'

export default async function app() {
  const form = document.querySelector('form')
  const state = {
    data: {
      urls: [],
      feeds: [],
      posts: [],

    },
    uiState: {
      validateInput: true,
      hasContent: false,
      inputMessage: '',
      viewedPosts: [],
    },
  }

  yup.setLocale({
    mixed: {
      notOneOf: () => ({ key: 'errors.input.urlAlrdeadyAdded' }),
    },
    string: {
      url: () => ({ key: 'errors.input.urlIsInvalid' }),
    },
  })

  function createProxy(proxy, url) {
    const href = new URL('/get', proxy)
    href.searchParams.append('disableCache', 'true')
    href.searchParams.append('url', url)
    return href
  }
  const watchedValidateInput = watcherValidateInput(state)
  function getResponse(url) {
    return axios.get(createProxy('https://allorigins.hexlet.app', url))
  }

  function getXML(response) {
    const parser = new DOMParser()
    return parser.parseFromString(response.data.contents, 'text/xml')
  }
  function updatePosts() {
    setTimeout(() => {
      if (watchedValidateInput.uiState.hasContent) {
        watchedValidateInput.data.feeds.forEach((feed) => {
          const currentPosts = state.data.posts.filter(post => post.feedUid === feed.uid)
          const { url } = state.data.urls.filter(item => item.uid === feed.urlUid)[0]
          getResponse(url).then((response) => {
            const doc = getXML(response)
            const posts = doc.querySelectorAll('channel item')
            posts.forEach((item) => {
              const newPost = {
                title: item.querySelector('title').textContent,
                description: item.querySelector('description').textContent,
                href: item.querySelector('link').textContent,
              }
              if (currentPosts.filter(post => post.title === newPost.title
                && post.description === newPost.description
                && post.href === newPost.href).length === 0) {
                newPost.uid = _.uniqueId
                newPost.feedUid = feed.uid
                watchedValidateInput.data.posts.unshift(newPost)
              }
            })
          }).catch((err) => {
            if (err.message === 'Network Error') {
              watchedValidateInput.uiState.validateInput = false
              watchedValidateInput.uiState.inputMessage = 'errors.input.networkError'
            }
          })
        })
      }
      updatePosts()
    }, 5000)
  }
  updatePosts()
  function validateNewUrl(url) {
    const schema = yup.string().url().notOneOf(state.data.urls.map(item => item.url))
    schema.validate(url, { abortEarly: false })
      .then(() => {
        getResponse(url)
          .then((response) => {
            const urlUid = _.uniqueId()
            const doc = getXML(response)
            const title = doc.querySelector('channel title')
            if (title === null) throw new Error('title is null')
            const description = doc.querySelector('channel description')
            const feedUid = _.uniqueId()
            watchedValidateInput.data.urls.push({ uid: urlUid, url })
            watchedValidateInput.uiState.validateInput = true
            watchedValidateInput.uiState.inputMessage = 'success.input.urlAdded'
            watchedValidateInput.data.feeds.push({
              uid: feedUid,
              urlUid,
              title: title.textContent,
              description: description.textContent,
            })
            const posts = doc.querySelectorAll('channel item')
            posts.forEach((item) => {
              watchedValidateInput.data.posts.push({
                uid: _.uniqueId(),
                urlUid,
                feedUid,
                title: item.querySelector('title').textContent,
                description: item.querySelector('description').textContent,
                href: item.querySelector('link').textContent,
              })
            })
            if (watchedValidateInput.data.feeds.length > 0) {
              watchedValidateInput.uiState.hasContent = true
            }
          })
          .catch((err) => {
            watchedValidateInput.uiState.validateInput = false
            if (err.message === 'Network Error') {
              watchedValidateInput.uiState.inputMessage = 'errors.input.networkError'
            }
            if (err.message === 'title is null') {
              watchedValidateInput.uiState.inputMessage = 'errors.input.notFoundRss'
            }
          })
      })
      .catch((err) => {
        watchedValidateInput.uiState.validateInput = false
        watchedValidateInput.uiState.inputMessage = err.message.key
      })
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = new FormData(form)
    const newUrl = formData.get('url')
    validateNewUrl(newUrl)
  })
}
