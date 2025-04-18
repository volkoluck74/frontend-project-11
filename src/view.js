import onChange from 'on-change';
import i18next from 'i18next';
import ru from './locales/ru.js';

const inputEl = document.querySelector('input');
const messageEl = document.querySelector('.feedback');
const feedsEl = document.querySelector('.feeds');
const postsEl = document.querySelector('.posts');

const i18nextInstance = i18next.createInstance();
await i18nextInstance.init({
  lng: 'ru',
  debug: true,
  resources: {
    ru,
  },
});

export default function watcherValidateInput(state) {
  function setInvalidClass(el) {
    el.classList.remove('is-valid');
    el.classList.add('is-invalid');
  }
  function setValidClass(el) {
    el.classList.remove('is-invalid');
    el.classList.add('is-valid');
  }
  function setTextDanger(el) {
    el.classList.remove('text-success');
    el.classList.add('text-danger');
  }
  function setTextSuccess(el) {
    el.classList.remove('text-danger');
    el.classList.add('text-success');
  }
  function renderInput() {
    if (state.uiState.validateInput) {
      setValidClass(inputEl);
      setTextSuccess(messageEl);
      inputEl.value = '';
    } else {
      setInvalidClass(inputEl);
      setTextDanger(messageEl);
    }
    messageEl.textContent = i18nextInstance.t(`${state.uiState.inputMessage}`);
  }
  function renderFeeds() {
    if (state.uiState.hasContent) {
      feedsEl.childNodes.forEach((item) => item.remove());
      const divFirst = document.createElement('div');
      divFirst.classList.add('card', 'border-0');
      feedsEl.appendChild(divFirst);

      const divSecond = document.createElement('div');
      divSecond.classList.add('card-body');
      divFirst.appendChild(divSecond);

      const h2 = document.createElement('h2');
      h2.classList.add('card-title', 'h4');
      h2.textContent = i18nextInstance.t('elements.headers.feeds');
      divSecond.appendChild(h2);

      const ulEl = document.createElement('ul');
      ulEl.classList.add('list-group', 'border-0', 'rounded-0');
      divFirst.appendChild(ulEl);
      state.data.feeds.forEach((item) => {
        const liEl = document.createElement('li');
        liEl.classList.add('list-group-item', 'border-0', 'border-end-0');
        ulEl.append(liEl);

        const h3 = document.createElement('h3');
        h3.classList.add('h6', 'm-0');
        h3.textContent = item.title;
        liEl.appendChild(h3);

        const p = document.createElement('p');
        p.classList.add('m-0', 'small', 'text-black-50');
        p.textContent = item.description;
        liEl.appendChild(p);
      });
    }
  }

  function renderPosts() {
    if (state.uiState.hasContent) {
      postsEl.childNodes.forEach((item) => item.remove());
      const divFirst = document.createElement('div');
      divFirst.classList.add('card', 'border-0');
      postsEl.appendChild(divFirst);

      const divSecond = document.createElement('div');
      divSecond.classList.add('card-body');
      divFirst.appendChild(divSecond);

      const h2 = document.createElement('h2');
      h2.classList.add('card-title', 'h4');
      h2.textContent = i18nextInstance.t('elements.headers.posts');
      divSecond.appendChild(h2);

      const ulEl = document.createElement('ul');
      ulEl.classList.add('list-group', 'border-0', 'rounded-0');
      divFirst.appendChild(ulEl);
      state.data.posts.forEach((item) => {
        const liEl = document.createElement('li');
        liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
        ulEl.append(liEl);

        const a = document.createElement('a');
        if (state.uiState.viewedPosts.filter((filterItem) => item.uid === filterItem).length !== 0) a.classList.add('fw-normal', 'link-secondary');
        else a.classList.add('fw-bold');
        a.setAttribute('href', `${item.href}`);
        a.setAttribute('data-id', `${item.uid}`);
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
        a.textContent = item.title;
        liEl.appendChild(a);

        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.setAttribute('data-id', `${item.uid}`);
        button.setAttribute('data-bs-toggle', 'modal');
        button.setAttribute('data-bs-target', '#modal');
        button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
        button.textContent = i18nextInstance.t('elements.buttons.postsButton');
        liEl.appendChild(button);
        button.addEventListener('click', () => {
          const modalDialog = document.querySelector('.modal-dialog');
          const h5 = modalDialog.querySelector('.modal-title');
          h5.textContent = item.title;

          const divModalBody = modalDialog.querySelector('.modal-body');
          divModalBody.textContent = item.description;

          const aModal = modalDialog.querySelector('a');
          aModal.href = item.href;
          if (state.uiState.viewedPosts.filter((element) => element === item.uid).length === 0) {
            state.uiState.viewedPosts.push(item.uid);
            renderPosts();
          }
        });
      });
    }
  }
  function render() {
    renderInput();
    renderFeeds();
    renderPosts();
  }
  const watchedObject = onChange(state, render);
  return watchedObject;
}
