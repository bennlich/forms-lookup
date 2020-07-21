import _ from 'underscore';
import html from 'nanohtml/lib/browser';
import { fetchAllForms } from './fetchForms.js';
import { lookupPageUrl } from './config.js';

let resultsContainer;

export default function initAllForms(containerEl) {
  console.log("all forms init");

  // Add the forms lookup DOM elements to the page
  containerEl.appendChild(html`
    <div class="jcc-forms-filter__input-container jcc-forms-filter__input-container--desktop">
      <h1>Find Your Court Forms</h1>
      <label class="jcc-forms-filter__input-label">Browse the list of all court forms, or <a class="text-white" href="${lookupPageUrl}">search by topic or form number</a></label>
    </div>
    <div class="jcc-forms-filter__search-results"></div>
  `);

  resultsContainer = document.querySelector(".jcc-forms-filter__search-results");

  render({ loading: true });
  fetchAllForms(render);
};

let render = ({ query, response, loading }) => {
  resultsContainer.firstChild && resultsContainer.firstChild.remove();
  resultsContainer.appendChild(renderFormResults({ query, response, loading }));
};

let renderFormResults = ({ query, response, loading }) => {
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
          <div class="jcc-forms-filter__form-result-buttons">
            <a class="usa-button usa-button--outline jcc-forms-filter__form-guide-button"
               href="${formInfoUrl}"
               aria-label="See form info for ${form.id} ${form.title}">See form info</a>
            <a class="usa-button usa-button--outline jcc-forms-filter__download-form-button"
               href="${form.url}"
               aria-label="View PDF form for ${form.id} ${form.title}">View PDF</a>
          </div>
        </div>
      </div>
    `;
  };

  if (loading) {
    return html`
      <div class="jcc-forms-filter__results-container">
        <div class="jcc-forms-filter__loading">Loading...</div>
      </div>
    `;
  }

  return html`
    <div class="jcc-forms-filter__results-container">
      <div class="jcc-forms-filter__results-header">All Forms</div>
      <div class="jcc-forms-filter__form-results">
        ${response.map(formResult)}
      </div>
    </div>
  `;
};