import './styles.scss'
import 'bootstrap'
import app from './application.js'
import i18next from 'i18next'
import ru from './locales/ru.js'

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

app(i18n, elements)
