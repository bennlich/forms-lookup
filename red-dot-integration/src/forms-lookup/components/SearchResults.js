import html from 'nanohtml/lib/browser';

import { CategoryLinks } from './CategoryLinks.js';
import { CategoryAlert } from './CategoryAlert.js';
import { FormResults } from './FormResults.js';

export const SearchResults = (actions, { query, response, loading, showMoreForms }) => {
  if (loading) {
    return html`
      <div class="jcc-forms-filter__results-container">
        <div class="jcc-forms-filter__loading">Loading...</div>
      </div>`;
  }

  if (!response) {
    return html`
      <div class="jcc-forms-filter__results-container">
        ${CategoryLinks(actions)}
      </div>`;
  } else {
    return html`
      ${CategoryAlert(actions, { query })}
      <div class="jcc-forms-filter__results-container">
        ${FormResults(actions, { query, response, showMoreForms })}
      </div>`;
  }
};
