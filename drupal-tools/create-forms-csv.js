// Generate a forms.csv for import into SRL drupal
// The source json files were all generated by scraping the courts.ca.gov form search and self-help pages

let _ = require('underscore');
let fs = require('fs');
let parseCsv = require('csv-parse/lib/sync');

let forms = JSON.parse(fs.readFileSync('./data/forms.json'));
let formsByCategoryId = parsePilotCategoriesCsv('./data/Pilot Categories.csv');
let languageVariantsByFormId = JSON.parse(fs.readFileSync('./data/language-variants-by-form-id.json'));
let languageLetters = JSON.parse(fs.readFileSync('./data/language-letters.json'));
let allLanguages = Array.from(new Set(languageLetters.map(r => r.language))).sort();
let formDescriptions = parseFormDescriptionsCsv('./data/Family Law Forms 1.csv');

function tagForms() {
  forms.forEach(form => {
    form.categoryIds = formsByCategoryId
      .filter(category => category.formIds.includes(form.id))
      .map(category => category.categoryId);
  });
}

function parsePilotCategoriesCsv(filename) {
  let rawText = fs.readFileSync(filename).toString();
  let rows = rawText.split('\n').map(r => r.split(','));
  let categoryIds = rows[0];
  let formsByCategoryId = categoryIds.map((categoryId, i) => {
    return {
      categoryId,
      formIds: rows.slice(1).map(cols => cols[i]).filter(val => val && val !== '')
    };
  });
  return formsByCategoryId;
}

function parseFormDescriptionsCsv(filename) {
  let rawText = fs.readFileSync(filename).toString();
  let rows = parseCsv(rawText, { columns: true });
  let removeAsteriskRegex = /\*/g;
  // Add an id to each row that matches the id in forms.json (no asterisk)
  rows.forEach(r => r.id = r['Form Number'].replace(removeAsteriskRegex, ''));
  return rows;
}

function getFormDescription(formId) {
  let formDescriptionRow = formDescriptions.find(r => r.id === formId);
  return formDescriptionRow ? formDescriptionRow['Plain language description (1-2 sentences)'] : '';
}

function getLanguageUrl(formId, language) {
  let languageVariants = languageVariantsByFormId[formId];
  if (!languageVariants)
    return '';

  let matchingVariant = languageVariants.find(r => r.language === language);
  return matchingVariant ? matchingVariant.form.url : '';
}

// If a form has a language letter at the end of its number,
// it is not a canonical form--it is a language guide.
function isCanonicalForm(form) {
  let languageLetterRegex = /^(.+)\s([A-Z]+)$/
  return !languageLetterRegex.test(form.id);
}

function saveFormsCsv() {
  tagForms();
  let columns = [
    'Form name',
    'Form number',
    'Form category ids',
    'Plain language description (1-2 sentences)',
    'PDF URL'
  ].concat(allLanguages.map(language => `${language} URL`));

  let nonCanonicalForms = forms.filter(f => !isCanonicalForm(f));
  console.log(`${nonCanonicalForms.map(f => f.id).join('\n')}`);
  console.log(`Skipped ${nonCanonicalForms.length} non-canonical forms listed above.`);

  console.log(`T tagalog forms ${nonCanonicalForms.filter(f => f.id.endsWith(' T')).map(f => f.url).join(', ')}`)
  console.log(`TG tagalog forms ${nonCanonicalForms.filter(f => f.id.endsWith(' TG')).map(f => f.url).join(', ')}`)

  console.log(`Language column order: ${allLanguages.join(', ')}`);
  
  let formRows = forms
    .filter(isCanonicalForm)
    .map((form) => {
      return [
        `"${form.title}"`,
        form.id,
        `"${form.categoryIds.join(', ')}"`,
        `"${getFormDescription(form.id)}"`,
        form.url
      ].concat(allLanguages.map(language => getLanguageUrl(form.id, language))).join(',');
    });
  let header = columns.join(',');
  let allRows = Array.prototype.concat(header, formRows);
  fs.writeFileSync('output/jcc_forms.csv', allRows.join('\n'));
}

saveFormsCsv();