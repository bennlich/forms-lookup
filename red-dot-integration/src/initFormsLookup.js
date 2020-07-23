import _ from 'underscore';
import html from 'nanohtml/lib/browser';

// For IE 11
import './ChildNode.remove.polyfill.js';

import { categories } from './categories.js';
import { fetchForms } from './fetchForms.js';
import { freezeBody, unfreezeBody } from './freezeBody.js';
import { CategoryLinks } from './components/CategoryLinks.js';
import { CategoryAlert } from './components/CategoryAlert.js';
import { FormResults } from './components/FormResults.js';
import { getQueryForLegacyFilter } from './legacyFilterSupport.js';
import { allFormsPageUrl } from './config.js';

function isMobile() {
  return window.innerWidth < 700;
}

function mobileContainerVisible() {
  return history.state && history.state.mobileContainerVisible;
}

function enterMobileView() {
  history.pushState({ mobileContainerVisible: true }, '');
}

export default function initFormsLookup(containerEl) {
  console.log('forms lookup init');

  // Add the forms lookup DOM elements to the page
  containerEl.appendChild(html`
    <div class="jcc-forms-filter__input-container jcc-forms-filter__input-container--desktop">
      <h1>Find Your Court Forms</h1>
      <label for="jcc-forms-filter__input" class="jcc-forms-filter__input-label">Search for any topic or form number, or <a class="text-white" href="${allFormsPageUrl}">view all forms</a></label>
      <input type="text"
             id="jcc-forms-filter__input"
             placeholder="E.g. divorce, name change, fl-100, restraining order"
             class="usa-input jcc-forms-filter__input"
             name="input-type-text"
             autocomplete="off">
    </div>
    <div class="jcc-forms-filter__search-results" aria-live="polite"></div>
    <div class="jcc-forms-filter__mobile-container">
      <div class="jcc-forms-filter__input-container">
        <input type="text"
               id="jcc-forms-filter__mobile-input"
               placeholder="E.g. divorce, name change, fl-100, restraining order"
               class="usa-input jcc-forms-filter__mobile-input"
               name="input-type-text"
               autocomplete="off">
      </div>
      <div class="jcc-forms-filter__mobile-search-results" aria-live="polite"></div>
    </div>
  `);
  
  let searchInput = document.querySelector("#jcc-forms-filter__input");
  searchInput.addEventListener("input", (e) => {
    // IE11 fix to prevent input event from firing when searchInput gains/loses focus
    if (document.activeElement !== searchInput) {
      return;
    }
    
    doQuery({ query: searchInput.value });
  });
  if (isMobile()) {
    searchInput.addEventListener("mouseup", (e) => {
      e.preventDefault();
      enterMobileView();
      rerender();
    });
  }

  let mobileSearchInput = document.querySelector("#jcc-forms-filter__mobile-input");
  mobileSearchInput.addEventListener("input", () => doQuery({ query: mobileSearchInput.value }));

  let lastRender = {};
  let rerender = () => render(lastRender);

  let render = ({ query, response, loading } = {}) => {
    lastRender = { query, response, loading };

    // Render desktop
    let resultsContainer = document.querySelector(".jcc-forms-filter__search-results");
    Array.from(resultsContainer.children).forEach(el => el.remove());
    resultsContainer.appendChild(SearchResults({ query, response, loading }));

    // Render mobile
    if (mobileContainerVisible()) {
      let mobileContainer = document.querySelector(".jcc-forms-filter__mobile-container");
      mobileContainer.style.display = 'block';
      
      let mobileResultsContainer = document.querySelector(".jcc-forms-filter__mobile-search-results");
      Array.from(mobileResultsContainer.children).forEach(el => el.remove());
      mobileResultsContainer.appendChild(SearchResults({ query, response, loading }));
      
      mobileSearchInput.focus();
      freezeBody();
    } else {
      let mobileContainer = document.querySelector(".jcc-forms-filter__mobile-container");
      mobileContainer.style.display = 'none';
      unfreezeBody();
    }
  };

  let SearchResults = ({ query, response, loading }) => {
    let onCategoryClick = (e, category) => {
      e.preventDefault();
      searchInput.value = category.query;
      mobileSearchInput.value = category.query;
      searchInput.focus();
      
      // Enter mobile mode if we are not already there
      if (!mobileContainerVisible() && isMobile()) {
        enterMobileView();
      }
      
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

  function doQuery({ query, pushState=false }) {
    // Update query string
    let newUrl = `${window.location.pathname}?query=${query}`;
    if (pushState) {
      history.pushState(history.state, '', newUrl);
    } else {
      history.replaceState(history.state, '', newUrl);
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
      if (queryDict.query) {
        query = decodeURI(queryDict.query);
      } else if (queryDict.filter) {
        // This is where we support legacy URLs like https://www.courts.ca.gov/forms.htm?filter=DV
        query = getQueryForLegacyFilter(queryDict.filter);
      }
    }
    
    searchInput.value = query;
    mobileSearchInput.value = query;
    render({ loading: true });
    fetchForms(query, render);
  }

  // Initial render. Subsequent renders occur when the user types in the input,
  // or clicks on a category button.
  render();

  updateStateFromQueryString();

  // Handle case when someone uses the browser back button
  window.addEventListener("popstate", () => updateStateFromQueryString());

  // Focus the search input to draw attention to it
  searchInput.focus();
}
