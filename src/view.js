import onChange from 'on-change';

export function watcherValidateInput (state) {
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
            messageEl.textContent = state.uiState.inputMessage;
        }
        else {
            setInvalidClass(inputEl);
            setTextDanger(messageEl);
            messageEl.textContent = state.uiState.inputMessage;
        }
    };
    const watchedObject = onChange(state, render);
    return watchedObject;
};
