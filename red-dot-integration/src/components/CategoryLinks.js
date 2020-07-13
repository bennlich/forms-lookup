import _ from 'underscore';
import html from 'nanohtml/lib/browser';
import { categories } from '../categories.js';
import { legacyDropdownLookupUrl } from '../config.js';

export const CategoryLinks = ({ onCategoryClick }) => {
  let sortedCategories = categories.sort((a, b) => (a.title < b.title ? -1 : 1));
  
  // Chunk the categories into columns
  let categoryGroups = _.chunk(sortedCategories, 2);
  if (window.innerWidth < 700) {
    categoryGroups = _.chunk(sortedCategories, 1);
  }

  const CategoryResultRow = (categoryGroup) => {
    return html`
      <div class="jcc-forms-filter__category-result-row">
        ${categoryGroup.map(category => html`
          <div class="jcc-forms-filter__category-result">
            <a href="#" onclick=${e => onCategoryClick(e, category)}>${category.title}</a>
          </div>
        `)}
      </div>
    `;
  };
    
  return html`
    <div>
      <div class="jcc-forms-filter__category-results">
        ${categoryGroups.map(CategoryResultRow)}
        <div class="jcc-forms-filter__category-result-row">
          <div class="jcc-forms-filter__category-result">
            <a href="${legacyDropdownLookupUrl}">Search by category</a>
          </div>
        </div>
      </div>
    </div>
  `;
};
