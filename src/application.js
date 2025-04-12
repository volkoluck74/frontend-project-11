import * as yup from 'yup';
import { proxy,subscribe, snapshot } from 'valtio/vanilla';

export default function app () {
    const form = document.querySelector('form');
    const input = document.querySelector('input');

    const state = proxy({
        data: {
            urls: [],
        },
        uiState: {
            validateInput: true,
        },
    });
    subscribe(state, () => {
        render();
    });
    function render() {
        input.classList.remove();
        if (state.uiState.validateInput) {
            input.classList.remove('is-invalid');
            input.classList.add('w-100', 'form-control')
            input.value = '';
        }
        else input.classList.add('is-invalid','w-100', 'form-control');
    }
    function validateNewUrl(url) {
        schema.isValid(url).then(isValid => {
            if (isValid && state.data.urls.indexOf(url) === -1) {
                state.data.urls.push(url);
                state.uiState.validateInput = true;
            }
            else {
                state.uiState.validateInput = false;
            }
        })
    }
    const schema = yup.string().url().min(1); 
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const newUrl = formData.get('url');
        validateNewUrl(newUrl);
      });
      //render();
}