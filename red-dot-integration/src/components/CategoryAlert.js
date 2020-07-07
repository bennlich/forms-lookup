import html from 'nanohtml/lib/browser';
import { categories } from '../categories.js';

export const CategoryAlert = ({ query }) => {
  let category = categories.find(category => category.query.toLowerCase() === query.toLowerCase());
  if (category) {
    return html`
      <div class="usa-alert usa-alert--info" >
        <div class="usa-alert__body">
          <p class="usa-alert__heading jcc-forms-filter__alert-heading">Looking for info about ${query.toLowerCase()}?</p>
          <p class="usa-alert__text">
            Read the <a href="${category.url}">${category.title} self-help guide</a> and the <a href="${category.formsUrl}">${category.title} forms page</a>.
          </p>
        </div>
      </div>`;  
  } else {
    return '';
  }
};
