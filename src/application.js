import * as yup from 'yup'
import axios from 'axios'
import _ from 'lodash'
import watcherValidateInput from './view.js'
import i18next from 'i18next'
import ru from './locales/ru.js'
import parseItem from './parseItem.js'

const i18n = i18next.createInstance()
await i18n.init({
  lng: 'ru',
  debug: true,
  resources: {
    ru,
  },
})

const elements = {
  inputEl: document.querySelector('input'),
  messageEl: document.querySelector('.feedback'),
  feedsEl: document.querySelector('.feeds'),
  postsEl: document.querySelector('.posts'),
  modalDialog: document.querySelector('.modal-dialog'),
  modalDialogCloseButton: document.querySelector('.modal-footer').querySelector('button'),
  buttonAddUrl: document.querySelector('form').querySelector('button'),
}

export default async function app() {
  const form = document.querySelector('form')
  const state = {
    uiState: {
      processApp: 'waitingFirstFeed', // 'waiting', 'error', 'addition'
      inputMessage: '',
      viewedPosts: [],
      viewingPost: '',
      modalDialogState: 'close',
    },
    data: {
      urls: [],
      feeds: [],
      posts: [],
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
  // Создаем проксированную ссылку
  function createProxy(proxy, url) {
    const href = new URL('/get', proxy)
    href.searchParams.append('disableCache', 'true')
    href.searchParams.append('url', url)
    return href
  }
  const watchedValidateInput = watcherValidateInput(i18n, elements, state)
  // Получаем ответ через прокси
  function getResponse(url) {
    return axios.get(createProxy('https://allorigins.hexlet.app', url))
  }
  // Разбираем ответ в xml
  function getXML(response) {
    const parser = new DOMParser()
    return parser.parseFromString(response.data.contents, 'text/xml')
  }
  // Проверяем каждый фид и получаем новые посты
  function checkFeed(feed) {
    const currentPosts = watchedValidateInput.data.posts.filter(post => post.feedUid === feed.uid)
    const { url } = watchedValidateInput.data.urls.filter(item => item.uid === feed.urlUid)[0]
    getResponse(url).then((response) => {
      const doc = getXML(response)
      const posts = doc.querySelectorAll('channel item')
      posts.forEach((item) => {
        const newPost = parseItem(item)
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
        watchedValidateInput.uiState.processApp === 'error'
        watchedValidateInput.uiState.inputMessage = 'errors.input.networkError'
      }
    })
  }
  // Получаем новые посты для ранее добавленных фидов
  function updatePosts() {
    setTimeout(() => {
      if (watchedValidateInput.uiState.processApp !== 'waitingFirstFeed') {
        watchedValidateInput.data.feeds.forEach(feed => checkFeed(feed))
      }
      updatePosts()
    }, 5000)
  }
  // Валидация url
  function validateURL(url) {
    const schema = yup.string().url().notOneOf(watchedValidateInput.data.urls.map(item => item.url))
    return schema.validate(url, { abortEarly: false })
  }
  // Получение контента для нового url
  function getContentOfNewURL(url) {
    validateURL(url)
      .then(() => {
        watchedValidateInput.uiState.processApp = 'addition'
        getResponse(url)
          .then((response) => {
            const urlUid = _.uniqueId()
            const doc = getXML(response)
            const title = doc.querySelector('channel title')
            if (title === null) {
              console.log('BOOOm')
              throw new Error('title is null')
            }
            const description = doc.querySelector('channel description')
            const feedUid = _.uniqueId()
            watchedValidateInput.data.urls.push({ uid: urlUid, url })
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
            watchedValidateInput.uiState.processApp = 'waiting'
          })
          .catch((err) => {
            watchedValidateInput.uiState.processApp = 'error'
            if (err.message === 'Network Error') {
              watchedValidateInput.uiState.inputMessage = 'errors.input.networkError'
            }
            if (err.message === 'title is null') {
              watchedValidateInput.uiState.inputMessage = 'errors.input.notFoundRss'
            }
          })
      })
      .catch((err) => {
        watchedValidateInput.uiState.processApp = 'error'
        watchedValidateInput.uiState.inputMessage = err.message.key
      })
  }
  updatePosts()
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = new FormData(form)
    if (watchedValidateInput.uiState.processApp !== 'addition') {
      const newUrl = formData.get('url')
      getContentOfNewURL(newUrl)
    }
  })
}
