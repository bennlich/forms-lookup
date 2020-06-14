// import _ from "underscore";

import { guides } from './guides.js';

let searchResultsContainer = document.querySelector(".jcc-forms-filter__results-container");
let guideResultsContainer = document.querySelector(".jcc-forms-filter__guide-results");
let formResultsContainer = document.querySelector(".jcc-forms-filter__form-results");
let searchInput = document.querySelector("#jcc-forms-filter__input");

let previousRequest;

let containerEl;

export async function initFormsLookup(containerEl) {
  console.log("form-lookup-drupal-api init");
  containerEl = containerEl;

  let _fetchForms = function() {
    // Abort previous request--we're about to send a new one
    if (previousRequest) previousRequest.abort();

    let query = searchInput.value;
    if (query === '') {
      render();
      return;
    }

    let url = `http://jcc.lndo.site:8080/json/jcc-forms?query=${query}`;
    // let url = `https://pr-187-jcc-srl.pantheonsite.io/json/jcc-forms?query=${query}`;
    let newRequest = new XMLHttpRequest();
    newRequest.responseType = "json";
    newRequest.onload = function() {
      render({
        query: query,
        formResults: newRequest.response
      });
    };
    newRequest.open("GET", url);
    previousRequest = newRequest;
    newRequest.send();
  };

  // Wait 200ms after someone is finished typing before fetching results
  let fetchForms = _.debounce(_fetchForms, 200);

  let render = ({ query, formResults } = {}) => {
    containerEl.firstChild && containerEl.firstChild.remove();
    containerEl.appendChild(renderSearchResults({ query, formResults }));
  };

  let renderSearchResults = ({ query, formResults }) => {

    // let renderGuides = () => {
    //   let matchingGuides = guides;
      
    //   if (formResults) {
    //     let caseTypes = _.unique(_.flatten(formResults.map(f => f["case_types"].split(", "))));
    //     matchingGuides = guides.filter(guide => caseTypes.includes(guide.title));
    //   }

    //   // Sort the guides
    //   matchingGuides = matchingGuides.sort((a, b) => (a.title < b.title ? -1 : 1));
      
    //   // Chunk the guides into columns
    //   let guideResultGroups = _.chunk(matchingGuides, 2);
    //   if (window.innerWidth < 700) {
    //     guideResultGroups = _.chunk(matchingGuides, 1);
    //   }
        
    //   return (
    //     html`<div>
    //       <div class="jcc-forms-filter__results-header">How-to instructions for types of court cases</div>
    //       <div class="jcc-forms-filter__guide-results">
    //         ${matchingGuides.length > 0 ? guideResultGroups.map(categoryResultRow) : noGuides()}
    //       </div>
    //     </div>`
    //   );
    // };

    let renderCategories = () => {
      let categories = guides.sort((a, b) => (a.title < b.title ? -1 : 1));
      
      // Chunk the guides into columns
      let categoryGroups = _.chunk(categories, 2);
      if (window.innerWidth < 700) {
        categoryGroups = _.chunk(categories, 1);
      }
        
      return html`
        <div>
          <div class="jcc-forms-filter__guide-results">
            ${categoryGroups.map(categoryResultRow)}
          </div>
        </div>
      `;
    };

    let renderFormResults = ({ query, formResults }) => {
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

    if (!formResults) {
      return html`
        <div class="jcc-forms-filter__results-container">
          ${renderCategories()}
        </div>`;
    } else {
      return html`
        <div class="jcc-forms-filter__results-container">
          ${renderFormResults({ query, formResults })}
        </div>`;
    }
  }

  function categoryResultRow(guideResultGroup) {
    let onCategoryClick = (e, guide) => {
      e.preventDefault();
      setQuery(guide.query);
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
  }

  function formResult(form) {
    return html`
      <div class="jcc-forms-filter__form-result">
        <div class="jcc-forms-filter__form-result-content">
          <a class="jcc-forms-filter__form-number-and-title" href="${form.url}" target="_blank">
            <div class="form-number">${form.id}</div>
            <div class="form-title">${form.title}</div>
          </a>
          <a class="usa-button usa-button--outline jcc-forms-filter__form-guide-button" href="${form.url}" target="_blank">See form info</a>
          <a class="usa-button usa-button--outline jcc-forms-filter__download-form-button" href="${form.url}" target="_blank">Download form</a>
        </div>
      </div>
    `;
  }

  function setQuery(newQuery) {
    searchInput.value = newQuery;
    searchInput.focus();
    fetchForms();
  }

  searchInput.addEventListener("input", () => fetchForms());

  render();

  searchInput.focus();
}
