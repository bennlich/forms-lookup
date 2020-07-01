import html from 'nanohtml/lib/browser';
import { categories } from '../categories.js';

export const CategoryAlert = ({ query }) => {
  let category = categories.find(category => category.query === query);
  if (category) {
    return html`
      <div class="usa-alert usa-alert--info usa-alert--slim" >
        <div class="usa-alert__body">
          <p class="usa-alert__text">
            Looking for more info about ${query}? Read the <a href="${category.url}">${category.title} self-help guide</a> or view the <a href="${category.formsUrl}">${category.title} forms page</a>.
          </p>
        </div>
      </div>`;  
  } else {
    return '';
  }
};
