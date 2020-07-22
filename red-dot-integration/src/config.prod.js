// The URL of the new lookup page
export const lookupPageUrl = '/forms.htm';

// The URL of the new all forms page
// TODO: decide what this url will be
export const allFormsPageUrl = '/allforms.html';

// The URL of the old dropdown lookup page
export const legacyDropdownLookupUrl = '';

// Set to false if, after the pilot period, you decide to hide the link to the old UI
export const showLegacyDropdownLookupLink = true;

export const formsAPIUrl = query => `https://selfhelp.courts.ca.gov/json/jcc-forms?query=${query}`;
