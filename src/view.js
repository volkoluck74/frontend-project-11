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

export  function watcherValidateInput (state) {
    const inputEl = document.querySelector('input');
    const messageEl = document.querySelector('.feedback');
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
    function render() {
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
    const watchedObject = onChange(state, render);
    return watchedObject;
};
