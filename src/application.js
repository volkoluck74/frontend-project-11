import * as yup from 'yup';
import {watcherValidateInput} from './view.js';
import i18next from 'i18next';
import ru from './locales/ru.js'
//import axios from 'axios';

export default async function app () {
    const form = document.querySelector('form');
    const state = {
        data: {
            urls: [],
        },
        uiState: {
            validateInput: true,
            inputMessage: '',
        },
    };
    const i18nextInstance = i18next.createInstance();
    await i18nextInstance.init({
        lng: 'ru',
        debug: true,
        resources: {
          ru
        },
      });
    yup.setLocale({
        mixed: {
            notOneOf: () => ({key: 'errors.input.urlAlrdeadyAdded'}),
        },
        string: {
            url: () => ({key: 'errors.input.urlIsInvalid'}),
        }
    });
    let watchedValidateInput= watcherValidateInput(state);
    function validateNewUrl(url) {
        const schema = yup.string().url().notOneOf(state.data.urls);
        schema.validate(url, {abortEarly: false})
        .then((e)=>{
            watchedValidateInput.data.urls.push(url);
            watchedValidateInput.uiState.validateInput = true;
            watchedValidateInput.uiState.inputMessage = i18nextInstance.t('success.input.urlAdded');
        })
        .catch(err => {
            watchedValidateInput.uiState.validateInput = false;
            watchedValidateInput.uiState.inputMessage = i18nextInstance.t(`${err.message.key}`);
            
        });
    };
    /*
    axios.get('https://jsonplaceholder.typicode.com/posts/1')
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.error('Ошибка:', error);
    });
    */
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const newUrl = formData.get('url');
        validateNewUrl(newUrl);
      });
}