import html from 'nanohtml/lib/browser';
import { categories } from '../categories.js';

export const CategoryAlert = ({ query }) => {
  let category = categories.find(category => category.query.toLowerCase() === query.toLowerCase());
  if (category) {
    return html`
      <div class="usa-alert usa-alert--info" >
        <div class="usa-alert__body">
          <p class="usa-alert__heading jcc-forms-filter__alert-heading">Looking for info about ${category.title.toLowerCase()}?</p>
          <ul class="usa-alert__text">
            <li>Read the <a href="${category.url}">${category.title} self-help guide</a></li>
            <li>See <a href="${category.formsUrl}">${category.title} forms packets</a></li>
          </ul>
        </div>
      </div>`;  
  } else {
    return '';
  }
};
