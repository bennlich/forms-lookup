import html from 'nanohtml/lib/browser';

// For IE 11
import '../ChildNode.remove.polyfill.js';

import { fetchAllForms } from '../fetchForms.js';
import { render, allFormsList } from './renderAllFormsList.js';

let doRender = render(html);
let doAllFormsList = allFormsList(html);

export default function initAllForms(containerEl) {
  console.log("all forms init");

  // Add the forms lookup DOM elements to the page
  containerEl.appendChild(doAllFormsList({ loading: true }));

  // Fetch once and render
  fetchAllForms(doRender);
};
