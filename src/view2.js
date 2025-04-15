import onChange from 'on-change';
import i18next from 'i18next';
import ru from './locales/ru.js'

const i18nextInstance = i18next.createInstance();
await i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources: {
        ru
    },
});

const inputEl = document.querySelector('input');
const messageEl = document.querySelector('.feedback');
const feedsEl = document.querySelector('.feeds');
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
function renderInput(state) {
    if (state.uiState.validateInput) {
        setValidClass(inputEl);
        setTextSuccess(messageEl)
        inputEl.value = '';
    }
    else {
        setInvalidClass(inputEl);
        setTextDanger(messageEl);
    }
    messageEl.textContent = i18nextInstance.t(`${state.uiState.inputMessage}`);
};
function renderFeeds(state) {
    if (state.uiState.hasFeeds) {
        const divFirst = document.createElement('div');
        divFirst = classList.add('card', 'border-0');
        feedsEl.appendChild(divFirst);

        const divSecond = document.createElement('div');
        divSecond.classList.add('card-body');
        divFirst.appendChild(divSecond);

        const h2 = document.createElement('h2');
        h2.classList.add('card-title', 'h4');
        h2.textContent = i18nextInstance.t(`elements.headers.feeds`);
    }
};

export async function watcherValidate (state) {
    function render (state) {
        renderInput(state);
        //renderFeeds(state);
    }
    const watchedObject = onChange(state, render);
    return watchedObject;
};

