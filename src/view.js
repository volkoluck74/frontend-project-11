import onChange from 'on-change';

export function watcherValidateInput (state) {
    const input = document.querySelector('input');
    function render() {
        input.classList.remove();
        if (state.uiState.validateInput) {
            input.classList.remove('is-invalid');
            input.classList.add('w-100', 'form-control')
            input.value = '';
        }
        else input.classList.add('is-invalid','w-100', 'form-control');
    };
    const watchedObject = onChange(state, render);
    return watchedObject;
};
