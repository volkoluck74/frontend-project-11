import * as yup from 'yup';
//import { proxy,subscribe, snapshot } from 'valtio/vanilla';
import {watcherValidateInput} from './view.js';


export default function app () {
    const form = document.querySelector('form');
    const state = {
        data: {
            urls: [],
        },
        uiState: {
            validateInput: true,
        },
    };
    let watchedValidateInput= watcherValidateInput(state);
    function validateNewUrl(url) {
        const schema = yup.string().url('first test').notOneOf(state.data.urls); 
        schema.isValid(url).then(isValid => {
            if (isValid) {
                watchedValidateInput.data.urls.push(url);
                watchedValidateInput.uiState.validateInput = true;
            }
            else {
                watchedValidateInput.uiState.validateInput = false;
            }
        });
    };
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const newUrl = formData.get('url');
        validateNewUrl(newUrl);
        //console.log(arr)
      });
}