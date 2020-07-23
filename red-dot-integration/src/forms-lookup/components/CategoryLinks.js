import _ from 'underscore';
import html from 'nanohtml/lib/browser';
import { categories } from '../categories.js';
import { legacyDropdownLookupUrl, showLegacyDropdownLookupLink } from '../../config.js';

export const CategoryLinks = ({ onCategoryClick }) => {
  let sortedCategories = categories
    .filter(c => !c.hidden)
    .sort((a, b) => (a.title < b.title ? -1 : 1));

  let numCategories = sortedCategories.length;
  if (showLegacyDropdownLookupLink) {
    numCategories = sortedCategories.length + 1;
  }

  const legacyDropdownLookupLink = html`
    <div class="jcc-forms-filter__category-result">
      <a href="${legacyDropdownLookupUrl}">Browse all categories</a>
    </div>
  `;

  const FirstColumn = () => {
    let firstHalf = sortedCategories.slice(0, Math.ceil(numCategories / 2));
    return firstHalf.map(CategoryLink);
  };

  const SecondColumn = () => {
    let secondHalf = sortedCategories.slice(Math.ceil(numCategories / 2));
    return secondHalf.map(CategoryLink);
  };

  const CategoryLink = category => html`
    <div class="jcc-forms-filter__category-result">
      <a href="?query=${category.query}" onclick=${e => onCategoryClick(e, category)}>${category.title}</a>
    </div>
  `;
    
  return html`
    <div>
      <div class="jcc-forms-filter__category-results">
        <div class="jcc-forms-filter__category-result-column">
          ${FirstColumn()}
        </div>
        <div class="jcc-forms-filter__category-result-column">
          ${SecondColumn()}
          ${showLegacyDropdownLookupLink ? legacyDropdownLookupLink : ''}
        </div>
      </div>
    </div>
  `;
};
