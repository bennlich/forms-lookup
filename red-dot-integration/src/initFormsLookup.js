import _ from 'underscore';
import html from 'nanohtml/lib/browser';
import { categories } from './categories.js';
import { fetchForms } from './fetchForms.js';
import { CategoryLinks } from './components/CategoryLinks.js';
import { CategoryAlert } from './components/CategoryAlert.js';
import { FormResults } from './components/FormResults.js';
import { allFormsPageUrl } from './config.js';

let searchInput;
let resultsContainer;

export default function initFormsLookup(containerEl) {
  console.log('forms lookup init');

  // Add the forms lookup DOM elements to the page
  containerEl.appendChild(html`
    <div class="jcc-forms-filter__input-container">
        <label for="jcc-forms-filter__input" class="jcc-forms-filter__input-label">Search for any topic or form number, or <a class="text-white" href="${allFormsPageUrl}">view all forms</a></label>
        <input type="text"
               id="jcc-forms-filter__input"
               placeholder="E.g. divorce, name change, fl-100, restraining order"
               class="usa-input jcc-forms-filter__input"
               name="input-type-text"
               autocomplete="off">
    </div>
    <div class="jcc-forms-filter__search-results"></div>
  `);
  
  searchInput = document.querySelector("#jcc-forms-filter__input");
  resultsContainer = document.querySelector(".jcc-forms-filter__search-results");

  let render = ({ query, response, loading } = {}) => {
    Array.from(resultsContainer.children).forEach(el => el.remove());
    resultsContainer.appendChild(renderSearchResults({ query, response, loading }));
  };

  let renderSearchResults = ({ query, response, loading }) => {
    let onCategoryClick = (e, category) => {
      e.preventDefault();
      searchInput.value = category.query;
      searchInput.focus();
      doQuery({ query: category.query, pushState: true });
    };

    if (loading) {
      return html`
        <div class="jcc-forms-filter__results-container">
          <div class="jcc-forms-filter__loading">Loading...</div>
        </div>`;
    }

    if (!response) {
      return html`
        <div class="jcc-forms-filter__results-container">
          ${CategoryLinks({ onCategoryClick })}
        </div>`;
    } else {
      return html`
        ${CategoryAlert({ query })}
        <div class="jcc-forms-filter__results-container">
          ${FormResults({ query, response })}
        </div>`;
    }
  };

  searchInput.addEventListener("input", () => doQuery({ query: searchInput.value }));

  window.addEventListener("popstate", () => updateStateFromQueryString());

  function doQuery({ query, pushState=false }) {
    // Update query string
    let newUrl = `${window.location.pathname}?query=${query}`;
    if (pushState) {
      history.pushState(null, '', newUrl);
    } else {
      history.replaceState(null, '', newUrl);
    }
    
    // Fetch and re-render
    render({ loading: true });
    fetchForms(query, render);
  }

  function updateStateFromQueryString() {
    let parseQueryString = queryString => {
      let pairs = queryString.slice(1).split('&').map(pair => pair.split('='));
      let queryDict = {};
      for (let i=0; i<pairs.length; i++) {
        queryDict[pairs[i][0]] = pairs[i][1];
      }
      return queryDict;
    }
    
    let query = '';
    if (window.location.search) {
      let queryDict = parseQueryString(window.location.search);
      query = decodeURI(queryDict.query);
    }
    
    searchInput.value = query;
    render({ loading: true });
    fetchForms(query, render);
  }

  render();

  updateStateFromQueryString();

  searchInput.focus();
}
