import * as yup from 'yup';
import {watcherValidateInput} from './view.js';
import axios from 'axios';
import _ from 'lodash';

export default async function app () {

    const form = document.querySelector('form');
    const state = {
        data: {
            urls: [],
            feeds: [],

        },
        uiState: {
            validateInput: true,
            hasFeeds: false,
            inputMessage: '',
        },
    };
    
    yup.setLocale({
        mixed: {
            notOneOf: () => ({key: 'errors.input.urlAlrdeadyAdded'}),
        },
        string: {
            url: () => ({key: 'errors.input.urlIsInvalid'}),
        }
    });
    let watchedValidateInput= watcherValidateInput(state);
    function getResponse(url) {
        return axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(`${url}`)}`);
     }
 
     function getXML(response) {
         const parser = new DOMParser();
         return parser.parseFromString(response.data.contents, "text/xml");
     };
     function getError(error) {
         console.error('Ошибка:', error);
     };
    function validateNewUrl(url) {
        const schema = yup.string().url().notOneOf(state.data.urls.map(item => item.url));
        schema.validate(url, {abortEarly: false})
        .then((e)=>{
            const urlUid = _.uniqueId();
            watchedValidateInput.data.urls.push({uid: urlUid, url});
            watchedValidateInput.uiState.validateInput = true;
            watchedValidateInput.uiState.inputMessage = 'success.input.urlAdded';
            
            getResponse(url).then(response => {
                const doc = getXML(response);
                const title = doc.querySelector('channel title');
                const description  = doc.querySelector('channel description');
                watchedValidateInput.data.feeds.push({
                    uid: _.uniqueId(),
                    urlUid,
                    title: title.textContent,
                    description: description.textContent,
                });
                //if (watchedValidateInput.data.feeds.length > 0) watchedValidateInput.uiState.hasFeeds = true;
            }).catch(err => console.log(err));
            
            
        })
        .catch(err => {
            watchedValidateInput.uiState.validateInput = false;
            watchedValidateInput.uiState.inputMessage = err.message.key;
            
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