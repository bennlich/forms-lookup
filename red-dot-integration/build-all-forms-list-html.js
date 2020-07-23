const fetch = require('node-fetch');
const fs = require('fs');
const html = require('nanohtml');
const esmImport = require('esm')(module);
let { allFormsList } = esmImport('./src/all-forms-list/renderAllFormsList.js');
const { formsAPIUrl } = esmImport('./src/config.js');

allFormsList = allFormsList(html);

fetch(formsAPIUrl(''))
  .then(res => res.json())
  .then(response => {
    let renderedContent = allFormsList({ response });
    fs.writeFileSync('build/allformslist.html', renderedContent.toString());
  })
  .catch(e => console.error(e));
