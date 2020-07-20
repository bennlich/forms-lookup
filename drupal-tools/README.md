## How to generate the form csv for importing all 2030 forms into drupal

1) Go to https://www.courts.ca.gov/formnumber.htm, inspect an element in the form list, open up the javascript console, and run:

```
nodeList = [].slice.call(document.querySelectorAll('tr.even'))
formData = nodeList.map((el) => {
  let [id, revision, title] = [].slice.call(el.children);
  return {
    id: id.innerText.endsWith('*') ? id.innerText.slice(0, -1) : id.innerText,
    title: title.innerText,
    revisionDate: revision.innerText,
    isMandatory: id.innerText.endsWith('*'),
    url: `https://courts.ca.gov${id.querySelector('a').getAttribute('href')}`
  };
})
JSON.stringify(formData, null, 2)
```

Save the result to `forms.json`.

To scrape form URLs from a form category page (e.g. to generate `forms-by-guide.browse-all-forms.json`):

```
nodeList = [].slice.call(document.querySelectorAll('tr.even'))
formData = nodeList.filter(el => el.children.length === 3).map((el) => {
  let [id, revision, title] = [].slice.call(el.children);
  return `https://courts.ca.gov${id.querySelector('a').getAttribute('href')}`;
})
JSON.stringify(formData, null, 2)
```

2) language-letters.json and language-variants-by-form-id.json:

```
languageLetterRegex = /^(.+)\s([A-Z]+)$/

function hasLanguageLetter(id) {
  return languageLetterRegex.test(id)
}

function getLanguageLetter(id) {
  return languageLetterRegex.exec(id)[2]
}

function removeLanguageLetter(id) {
  return languageLetterRegex.exec(id)[1]
}

// Extract language letter from the end of the form id
languageLetters = Array.from(new Set(
  formData.map(f => f.id)
    .filter(hasLanguageLetter)
    .map(getLanguageLetter)
))

languageData = languageLetters.map(letter => {
  let form = formData.find(f => f.id.includes(' ') && f.id.endsWith(letter));
  return { letter, language: /.*\((.*)\)$/.exec(form.title)[1] }
})
JSON.stringify(languageData, null, 2)

nonEnglishFormIds = Array.from(new Set(formData.map(f => f.id).filter(id => languageLetterRegex.test(id))))
var languageVariantsByFormId = {}
nonEnglishFormIds.forEach(id => {
  let langLetter = getLanguageLetter(id)
  let canonicalId = removeLanguageLetter(id)
  languageVariantsByFormId[canonicalId] = languageVariantsByFormId[canonicalId] || []
  languageVariantsByFormId[canonicalId].push({
    language: languageData.find(d => d.letter === langLetter).language,
    form: formData.find(f => f.id === id)
  })
})

JSON.stringify(languageVariantsByFormId, null, 2)
```

3) Manually build `guides.json` by looking at self-help main and sub-menus.

4) Use `create-forms-csv.js` to create a csv of forms tagged by case-types defined in guides.json

5) Go to https://www.courts.ca.gov/forms.htm, open the console, and run:
```
JSON.stringify(Array.from(document.querySelectorAll('option')).map(el => ({ key: el.value, title: el.innerText })), null, 2)
```
to produce dropdown-abbreviations.json