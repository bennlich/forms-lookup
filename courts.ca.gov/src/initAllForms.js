import { fetchForms } from './fetchForms.js';

let resultsContainer;

export function initAllForms(containerEl) {
  console.log("all forms init");

  // Add the forms lookup DOM elements to the page
  containerEl.appendChild(html`
    <div class="jcc-forms-filter__input-container">
      <label class="jcc-forms-filter__input-label">Browse the list of all court forms, or <a class="text-white" href="./">search by topic or form number</a></label>
    </div>
    <div class="jcc-forms-filter__search-results"></div>
  `);

  resultsContainer = document.querySelector(".jcc-forms-filter__search-results");

  render({ loading: true });
  fetchForms('', render);
};

let render = ({ query, formResults, loading }) => {
  resultsContainer.firstChild && resultsContainer.firstChild.remove();
  resultsContainer.appendChild(renderFormResults({ query, formResults, loading }));
};

let renderFormResults = ({ query, formResults, loading }) => {
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

  if (loading) {
    return html`
      <div class="jcc-forms-filter__results-container">
        Loading...
      </div>
    `;
  }

  return html`
    <div class="jcc-forms-filter__results-container">
      <div class="jcc-forms-filter__results-header">All Forms</div>
      <div class="jcc-forms-filter__form-results">
        ${formResults.map(formResult)}
      </div>
    </div>
  `;
};