import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import watcherValidateInput from './view.js';

export default async function app() {
  const form = document.querySelector('form');
  const state = {
    data: {
      urls: [],
      feeds: [],
      posts: [],

    },
    uiState: {
      validateInput: true,
      hasContent: false,
      inputMessage: '',
    },
  };

  yup.setLocale({
    mixed: {
      notOneOf: () => ({ key: 'errors.input.urlAlrdeadyAdded' }),
    },
    string: {
      url: () => ({ key: 'errors.input.urlIsInvalid' }),
    },
  });
  const watchedValidateInput = watcherValidateInput(state);
  function getResponse(url) {
    return axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(`${url}`)}`);
  }

  function getXML(response) {
    const parser = new DOMParser();
    return parser.parseFromString(response.data.contents, 'text/xml');
  }
  /*
  function getError(error) {
    console.error('Ошибка:', error);
  }
*/
  function validateNewUrl(url) {
    const schema = yup.string().url().notOneOf(state.data.urls.map((item) => item.url));
    schema.validate(url, { abortEarly: false })
      .then(() => {
        const urlUid = _.uniqueId();
        watchedValidateInput.data.urls.push({ uid: urlUid, url });
        watchedValidateInput.uiState.validateInput = true;
        watchedValidateInput.uiState.inputMessage = 'success.input.urlAdded';

        getResponse(url).then((response) => {
          const doc = getXML(response);
          const title = doc.querySelector('channel title');
          const description = doc.querySelector('channel description');
          const feedUid = _.uniqueId();
          watchedValidateInput.data.feeds.push({
            uid: feedUid,
            urlUid,
            title: title.textContent,
            description: description.textContent,
          });
          const posts = doc.querySelectorAll('channel item');
          posts.forEach((item) => {
            watchedValidateInput.data.posts.push({
              uid: _.uniqueId(),
              urlUid,
              feedUid,
              title: item.querySelector('title').textContent,
              description: item.querySelector('description').textContent,
              href: item.querySelector('link').textContent,
            });
          });
          if (watchedValidateInput.data.feeds.length > 0) {
            watchedValidateInput.uiState.hasContent = true;
          }
        }).catch((err) => console.log(err));
      })
      .catch((err) => {
        watchedValidateInput.uiState.validateInput = false;
        watchedValidateInput.uiState.inputMessage = err.message.key;
      });
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const newUrl = formData.get('url');
    validateNewUrl(newUrl);
  });
}
