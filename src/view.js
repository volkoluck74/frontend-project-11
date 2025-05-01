import onChange from 'on-change'

export default function watcherValidateInput(i18n, elements, state) {
  const { inputEl, messageEl, feedsEl, postsEl, modalDialog, modalDialogCloseButton, buttonAddUrl } = elements

  modalDialogCloseButton.addEventListener('click', () => {
    watchedObject.uiState.modalDialogState = 'close'
  })
  // При ошибки валидации
  function setInvalidClass(el) {
    el.classList.remove('is-valid')
    el.classList.add('is-invalid')
  }
  // При успешной валидации
  function setValidClass(el) {
    el.classList.remove('is-invalid')
    el.classList.add('is-valid')
  }
  // Окраска текста при ошибке
  function setTextDanger(el) {
    el.classList.remove('text-success')
    el.classList.add('text-danger')
  }
  // Окраска текста при успехе
  function setTextSuccess(el) {
    el.classList.remove('text-danger')
    el.classList.add('text-success')
  }
  // Блокировка кнопки добавления новых фидов в момент добавления
  function renderButton() {
    if (watchedObject.uiState.processApp === 'addition') {
      buttonAddUrl.disabled = true
    }
    else {
      buttonAddUrl.disabled = false
    }
  }
  // Отрисовка инпута в зависимости от статуса
  function renderInput() {
    if (watchedObject.uiState.processApp === 'error') {
      setInvalidClass(inputEl)
      setTextDanger(messageEl)
    }
    if (watchedObject.uiState.processApp === 'waiting') {
      setValidClass(inputEl)
      setTextSuccess(messageEl)
    }
    messageEl.textContent = i18n.t(`${watchedObject.uiState.inputMessage}`)
  }
  // Отрисовка блока с фидами
  function renderFeeds() {
    if (watchedObject.data.posts.length > 0) {
      feedsEl.childNodes.forEach(item => item.remove())
      const divFirst = document.createElement('div')
      divFirst.classList.add('card', 'border-0')
      feedsEl.appendChild(divFirst)

      const divSecond = document.createElement('div')
      divSecond.classList.add('card-body')
      divFirst.appendChild(divSecond)

      const h2 = document.createElement('h2')
      h2.classList.add('card-title', 'h4')
      h2.textContent = i18n.t('elements.headers.feeds')
      divSecond.appendChild(h2)

      const ulEl = document.createElement('ul')
      ulEl.classList.add('list-group', 'border-0', 'rounded-0')
      divFirst.appendChild(ulEl)
      state.data.feeds.forEach((item) => {
        const liEl = document.createElement('li')
        liEl.classList.add('list-group-item', 'border-0', 'border-end-0')
        ulEl.append(liEl)

        const h3 = document.createElement('h3')
        h3.classList.add('h6', 'm-0')
        h3.textContent = item.title
        liEl.appendChild(h3)

        const p = document.createElement('p')
        p.classList.add('m-0', 'small', 'text-black-50')
        p.textContent = item.description
        liEl.appendChild(p)
      })
    }
  }
  // Отрисовка диалогового окна
  function renderModal() {
    const post = watchedObject.data.posts.filter(item => item.uid === watchedObject.uiState.viewingPost)
    if (post.length !== 0) {
      modalDialog.querySelector('.modal-title').textContent = post[0].title
      modalDialog.querySelector('.modal-body').textContent = post[0].description
      modalDialog.querySelector('a').href = post[0].href
    }
  }
  // Отрисовка постов
  function renderPosts() {
    if (watchedObject.data.posts.length > 0) {
      postsEl.childNodes.forEach(item => item.remove())
      const divFirst = document.createElement('div')
      divFirst.classList.add('card', 'border-0')
      postsEl.appendChild(divFirst)

      const divSecond = document.createElement('div')
      divSecond.classList.add('card-body')
      divFirst.appendChild(divSecond)

      const h2 = document.createElement('h2')
      h2.classList.add('card-title', 'h4')
      h2.textContent = i18n.t('elements.headers.posts')
      divSecond.appendChild(h2)

      const ulEl = document.createElement('ul')
      ulEl.classList.add('list-group', 'border-0', 'rounded-0')
      divFirst.appendChild(ulEl)
      state.data.posts.forEach((item) => {
        const liEl = document.createElement('li')
        liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0')
        ulEl.append(liEl)

        const a = document.createElement('a')
        if (state.uiState.viewedPosts.filter(filterItem => item.uid === filterItem).length !== 0) a.classList.add('fw-normal', 'link-secondary')
        else a.classList.add('fw-bold')
        a.setAttribute('href', `${item.href}`)
        a.setAttribute('data-id', `${item.uid}`)
        a.setAttribute('target', '_blank')
        a.setAttribute('rel', 'noopener noreferrer')
        a.textContent = item.title
        liEl.appendChild(a)

        const button = document.createElement('button')
        button.setAttribute('type', 'button')
        button.setAttribute('data-id', `${item.uid}`)
        button.setAttribute('data-bs-toggle', 'modal')
        button.setAttribute('data-bs-target', '#modal')
        button.classList.add('btn', 'btn-outline-primary', 'btn-sm')
        button.textContent = i18n.t('elements.buttons.postsButton')
        liEl.appendChild(button)
        button.addEventListener('click', () => {
          watchedObject.uiState.modalDialogState = 'open'
          watchedObject.uiState.viewingPost = item.uid
          if (watchedObject.uiState.viewedPosts.filter(element => element === item.uid).length === 0) {
            watchedObject.uiState.viewedPosts.push(item.uid)
          }
        })
      })
    }
  }
  function render() {
    renderButton()
    renderInput()
    renderFeeds()
    renderPosts()
    renderModal()
  }
  const watchedObject = onChange(state, render)
  return watchedObject
}
