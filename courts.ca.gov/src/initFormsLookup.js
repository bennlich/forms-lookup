// import _ from "underscore";

import { guides } from './guides.js';
import { fetchForms } from './fetchForms.js';

let searchInput;
let resultsContainer;

export function initFormsLookup(containerEl) {
  console.log("form-lookup-drupal-api init");

  // Add the forms lookup DOM elements to the page
  containerEl.appendChild(html`
    <div class="jcc-forms-filter__input-container">
        <label for="jcc-forms-filter__input" class="jcc-forms-filter__input-label">Search for any topic or form number, or <a class="text-white" href="./allforms.html">view all forms</a></label>
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

  let render = ({ query, formResults, loading } = {}) => {
    Array.from(resultsContainer.children).forEach(el => el.remove());
    resultsContainer.appendChild(renderSearchResults({ query, formResults, loading }));
  };

  let renderSearchResults = ({ query, formResults, loading }) => {

    let renderCategories = () => {
      let categories = guides.sort((a, b) => (a.title < b.title ? -1 : 1));
      
      // Chunk the guides into columns
      let categoryGroups = _.chunk(categories, 2);
      if (window.innerWidth < 700) {
        categoryGroups = _.chunk(categories, 1);
      }

      let categoryResultRow = (guideResultGroup) => {
        let onCategoryClick = (e, guide) => {
          e.preventDefault();
          searchInput.value = guide.query;
          searchInput.focus();
          doQuery(guide.query);
        };
        return html`
          <div class="jcc-forms-filter__guide-result-row">
            ${guideResultGroup.map(guide => html`
              <div class="jcc-forms-filter__guide-result">
                <a href="#" target="_blank" onclick=${e => onCategoryClick(e, guide)}>${guide.title}</a>
              </div>
            `)}
          </div>
        `;
      };
        
      return html`
        <div>
          <div class="jcc-forms-filter__guide-results">
            ${categoryGroups.map(categoryResultRow)}
          </div>
        </div>
      `;
    };

    let renderFormResults = ({ query, formResults }) => {
      let formResult = (form) => {
        let formInfoUrl = `https://epic-forms-jcc-srl.pantheonsite.io/jcc-form/${form.id
          .toLowerCase()
          .replace(/\(|\)|\./g, "")}`;

        return html`
          <div class="jcc-forms-filter__form-result">
            <div class="jcc-forms-filter__form-result-content">
              <a class="jcc-forms-filter__form-number-and-title" href="${formInfoUrl}">
                <div class="form-number">${form.id}</div>
                <div class="form-title">${form.title}</div>
              </a>
              <a class="usa-button usa-button--outline jcc-forms-filter__form-guide-button" href="${formInfoUrl}">See form info</a>
              <a class="usa-button usa-button--outline jcc-forms-filter__download-form-button" href="${form.url}">Download form</a>
            </div>
          </div>
        `;
      };

      return html`
        <div>
          <div class="jcc-forms-filter__results-header">Found ${formResults.length} forms matching "${query}"</div>
          ${formResults.length > 0 ?
            html`<div class="jcc-forms-filter__form-results">
              ${formResults.map(formResult)}
            </div>` : ''}
        </div>
      `;
    };

    let guideAlert = ({ query, formResults }) => {
      let matchingGuide = guides.find(guide => guide.query === query);
      if (matchingGuide) {
        return html`
          <div class="usa-alert usa-alert--info usa-alert--slim" >
            <div class="usa-alert__body">
              <p class="usa-alert__text">
                Looking for more info about ${query}? Read the <a href="${matchingGuide.url}">${matchingGuide.title} self-help guide</a> or view the <a href="${matchingGuide.formsUrl}">${matchingGuide.title} forms page</a>.
              </p>
            </div>
          </div>`;  
      } else {
        return '';
      }
    };

    if (loading) {
      return html`
        <div class="jcc-forms-filter__results-container">
          Loading...
        </div>`;
    }

    if (!formResults) {
      return html`
        <div class="jcc-forms-filter__results-container">
          ${renderCategories()}
        </div>`;
    } else {
      return html`
        ${ guideAlert({ query, formResults }) }
        <div class="jcc-forms-filter__results-container">
          ${renderFormResults({ query, formResults })}
        </div>`;
    }
  }

  searchInput.addEventListener("input", () => doQuery(searchInput.value));

  function doQuery(newQuery) {
    // Update query string
    let newUrl = `${window.location.pathname}?query=${newQuery}`;
    history.replaceState(null, '', newUrl);
    
    // Fetch and re-render
    render({ loading: true });
    fetchForms(newQuery, render);
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
    
    if (!window.location.search)
      return;

    let queryDict = parseQueryString(window.location.search);
    if (queryDict.query) {
      searchInput.value = decodeURI(queryDict.query);
      render({ loading: true });
      fetchForms(searchInput.value, render);
    }
  }

  render();

  updateStateFromQueryString();

  searchInput.focus();
}
