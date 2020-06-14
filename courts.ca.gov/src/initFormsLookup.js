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

  let render = ({ query, formResults } = {}) => {
    resultsContainer.firstChild && resultsContainer.firstChild.remove();
    resultsContainer.appendChild(renderSearchResults({ query, formResults }));
  };

  let renderSearchResults = ({ query, formResults }) => {

    //   if (formResults) {
    //     let caseTypes = _.unique(_.flatten(formResults.map(f => f["case_types"].split(", "))));
    //     matchingGuides = guides.filter(guide => caseTypes.includes(guide.title));
    //   }

    let renderCategories = () => {
      let categories = guides.sort((a, b) => (a.title < b.title ? -1 : 1));
      
      // Chunk the guides into columns
      let categoryGroups = _.chunk(categories, 2);
      if (window.innerWidth < 700) {
        categoryGroups = _.chunk(categories, 1);
      }

      let categoryResultRow = (guideResultGroup) => {
        let setQuery = (newQuery) => {
          searchInput.value = newQuery;
          searchInput.focus();
          fetchForms(searchInput.value, render);
        };
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
              <a class="jcc-forms-filter__form-number-and-title" href="${formInfoUrl}" target="_blank">
                <div class="form-number">${form.id}</div>
                <div class="form-title">${form.title}</div>
              </a>
              <a class="usa-button usa-button--outline jcc-forms-filter__form-guide-button" href="${formInfoUrl}" target="_blank">See form info</a>
              <a class="usa-button usa-button--outline jcc-forms-filter__download-form-button" href="${form.url}" target="_blank">Download form</a>
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

  searchInput.addEventListener("input", () => {
    if (searchInput.value === '') {
      render();
    } else {
      fetchForms(searchInput.value, render)
    }
  });

  render();

  searchInput.focus();
}
