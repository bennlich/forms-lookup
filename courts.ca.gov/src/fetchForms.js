let previousRequest;

let _fetchForms = function(query, callback) {
  // Abort previous request--we're about to send a new one
  if (previousRequest) previousRequest.abort();

  if (query === '') {
    callback();
    return;
  }

  let url = `http://jcc.lndo.site:8080/json/jcc-forms?query=${query}`;
  // let url = `https://pr-187-jcc-srl.pantheonsite.io/json/jcc-forms?query=${query}`;
  let newRequest = new XMLHttpRequest();
  newRequest.responseType = "json";
  newRequest.onload = function() {
    callback({
      query: query,
      formResults: newRequest.response
    });
  };
  newRequest.open("GET", url);
  previousRequest = newRequest;
  newRequest.send();
};

// Wait 200ms after someone is finished typing before trying to hit the API again
export const fetchForms = _.debounce(_fetchForms, 200);
