import _ from 'underscore';
import { formsAPIUrl } from './config.js';

let previousRequest;

let _executeQuery = function(query, callback) {
  let url = formsAPIUrl(query);
  let newRequest = new XMLHttpRequest();
  newRequest.onload = function() {
    let response;
    try {
      response = JSON.parse(newRequest.response);
    } catch (e) {
      console.error(e);
      console.error("Could not parse response:", newRequest.response);
    }
    callback({ query, response });
  };
  newRequest.onerror = function() {
    console.error('An error occured while fetching forms.');
  };
  newRequest.open("GET", url);
  previousRequest = newRequest;
  newRequest.send();
}

let _fetchForms = function(query, callback, onBeforeQuery) {
  // Abort previous request--we're about to send a new one
  if (previousRequest) previousRequest.abort();

  if (query.length < 2) {
    callback({ query, response: null });
    return;
  }

  if (onBeforeQuery) onBeforeQuery();

  _executeQuery(query, ({ query, response }) => {
    // Push num results to google tag manager data layer
    if (window.dataLayer && window.dataLayer.push) {
      window.dataLayer.push({
       'event': 'searchResults',
       'numSearchResults': response.length
      });
    }
    callback({ query, response });
  });
};

// Wait 200ms after someone is finished typing before trying to hit the API again
const fetchForms = _.debounce(_fetchForms, 200);
const fetchAllForms = (callback) => _executeQuery('', callback);

export { fetchForms, fetchAllForms };
