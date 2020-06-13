// import _ from "underscore";

import { guides } from './guides.js';

let searchResultsContainer = document.querySelector(".jcc-forms-filter__results-container");
let guideResultsContainer = document.querySelector(".jcc-forms-filter__guide-results");
let formResultsContainer = document.querySelector(".jcc-forms-filter__form-results");
let searchInput = document.querySelector("#jcc-forms-filter__input");

let previousRequest;

let containerEl;

export async function initFormsLookup(containerEl) {
  console.log("form-lookup-drupal-api init");
  containerEl = containerEl;

  let _fetchForms = function() {
    // Abort previous request--we're about to send a new one
    if (previousRequest) previousRequest.abort();

    let query = searchInput.value;
    if (query === '') {
      render();
      return;
    }

    let url = `http://jcc.lndo.site:8080/json/jcc-forms?query=${query}`;
    // let url = `https://pr-187-jcc-srl.pantheonsite.io/json/jcc-forms?query=${query}`;
    let newRequest = new XMLHttpRequest();
    newRequest.responseType = "json";
    newRequest.onload = function() {
      render(newRequest.response);
    };
    newRequest.open("GET", url);
    previousRequest = newRequest;
    newRequest.send();
  };

  // Wait 200ms after someone is finished typing before fetching results
  let fetchForms = _.debounce(_fetchForms, 200);

  let render = (formResults) => {

    let renderGuideResults = () => {
      let matchingGuides = guides;
      
      if (formResults) {
        let caseTypes = _.unique(_.flatten(formResults.map(f => f["case_types"].split(", "))));
        matchingGuides = guides.filter(guide => caseTypes.includes(guide.title));
      }

      // Sort the guides
      matchingGuides = matchingGuides.sort((a, b) => (a.title < b.title ? -1 : 1));
      
      // Chunk the guides into columns
      let guideResultGroups = _.chunk(matchingGuides, 2);
      if (window.innerWidth < 700) {
        guideResultGroups = _.chunk(matchingGuides, 1);
      }
        
      return (
        html`<div>
          <div class="jcc-forms-filter__results-header">How-to instructions for types of court cases</div>
          <div class="jcc-forms-filter__guide-results">
            ${matchingGuides.length > 0 ? guideResultGroups.map(guideResultRow) : noGuides()}
          </div>
        </div>`
      );
    };

    let renderFormResults = () => {
      if (!formResults) {
        return '';
      }
      return (
        html`<div>
          <div class="jcc-forms-filter__results-header">Forms</div>
          <div class="jcc-forms-filter__form-results">
              ${formResults.length > 0 ? formResults.map(formResult) : noForms()}
          </div>
        </div>`
      );
    };

    containerEl.firstChild && containerEl.firstChild.remove();
    containerEl.appendChild(
      html`<div class="jcc-forms-filter__results-container">
        ${renderGuideResults()}
        ${renderFormResults()}
      </div>`
    );
  }

  // let render = (formResults) => {
  //   // debug
  //   console.log(formResults);
  //   window.formResults = formResults;

  //   if (!formResults) {
  //     searchResultsContainer.innerHTML = `
  //       <div class="jcc-forms-filter__results-header">How-to instructions for types of court cases</div>
  //       <div class="jcc-forms-filter__guide-results">
  //           <div class="jcc-forms-filter__loading--guides">...</div>
  //       </div>
  //     `;
  //     renderGuides(formResults);
  //   } else {
  //     searchResultsContainer.innerHTML = `
  //       <div class="jcc-forms-filter__results-header">How-to instructions for types of court cases</div>
  //       <div class="jcc-forms-filter__guide-results">
  //           <div class="jcc-forms-filter__loading--guides">...</div>
  //       </div>
  //       <div class="jcc-forms-filter__results-header">Forms</div>
  //       <div class="jcc-forms-filter__form-results">
  //           <div class="jcc-forms-filter__loading">...</div>
  //       </div>
  //     `;
  //     renderGuides(formResults);
  //     renderForms(formResults);
  //   }
  // }

  // let renderForms = formResults => {    
  //   formResultsContainer = document.querySelector(".jcc-forms-filter__form-results");
  //   if (formResults.length > 0) {
  //     formResultsContainer.innerHTML = "";
  //     formResults.map(form => formResult(form)).forEach(el => formResultsContainer.appendChild(el));
  //   } else {
  //     formResultsContainer.innerHTML = noForms();
  //   }
  // };

  // let renderGuides = formResults => {
  //   guideResultsContainer = document.querySelector(".jcc-forms-filter__guide-results");
  //   let matchingGuides = guides;

  //   if (formResults) {
  //     let caseTypes = _.unique(_.flatten(formResults.map(f => f["case_types"].split(", "))));
  //     matchingGuides = guides.filter(guide => caseTypes.includes(guide.title));
  //   }

  //   if (matchingGuides.length > 0) {
  //     matchingGuides = matchingGuides.sort((a, b) => (a.title < b.title ? -1 : 1));
  //     let guideResultGroups = _.chunk(matchingGuides, 2);
  //     if (window.innerWidth < 700) {
  //       guideResultGroups = _.chunk(matchingGuides, 1);
  //     }
  //     guideResultsContainer.innerHTML = guideResultGroups
  //       .map(guideGroup => guideResultRow(guideGroup))
  //       .join("\n");
  //   } else {
  //     guideResultsContainer.innerHTML = noGuides();
  //   }
  // };

  function noGuides() {
    return html`
      <div class="jcc-forms-filter__no-results jcc-forms-filter__no-results--guides">No matching guides</div>
    `;
  }

  function noForms() {
    return html`
      <div class="jcc-forms-filter__no-results">No matching forms</div>
    `;
  }

  function guideResultRow(guideResultGroup) {
    if (guideResultGroup.length == 2) {
      return html`
        <div class="jcc-forms-filter__guide-result-row">
          <div class="jcc-forms-filter__guide-result">
            <a href="${guideResultGroup[0].url}" target="_blank">${guideResultGroup[0].title}</a>
          </div>
          <div class="jcc-forms-filter__guide-result">
            <a href="${guideResultGroup[1].url}" target="_blank">${guideResultGroup[1].title}</a>
          </div>
        </div>
      `;
    } else {
      return html`
        <div class="jcc-forms-filter__guide-result-row">
          <div class="jcc-forms-filter__guide-result">
            <a href="${guideResultGroup[0].url}" target="_blank">${guideResultGroup[0].title}</a>
          </div>
        </div>
      `;
    }
  }

  function formResult(form) {
    return html`
      <div class="jcc-forms-filter__form-result">
        <div class="jcc-forms-filter__form-result-content">
          <a class="jcc-forms-filter__form-number-and-title" href="${form.url}" target="_blank">
            <div class="form-number">${form.id}</div>
            <div class="form-title">${form.title}</div>
          </a>
          <a class="usa-button usa-button--outline jcc-forms-filter__form-guide-button" href="${form.url}" target="_blank">See form info</a>
          <a class="usa-button usa-button--outline jcc-forms-filter__download-form-button" href="${form.url}" target="_blank">Download form</a>
        </div>
      </div>
    `;
  }

  searchInput.addEventListener("input", () => fetchForms());

  render();
}
