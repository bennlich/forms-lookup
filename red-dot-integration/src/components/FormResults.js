import html from 'nanohtml/lib/browser';

export const FormResults = ({ query, response }) => {
  let FormResult = (form) => {
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

  return html`
    <div>
      <div class="jcc-forms-filter__results-header">Found ${response.length} forms matching "${query}"</div>
      ${response.length > 0 ?
        html`<div class="jcc-forms-filter__form-results">
          ${response.map(FormResult)}
        </div>` : ''}
    </div>
  `;
};