## forms lookup - red dot integration

### Install dependencies

```
npm install
```

### Build

```
npm run build
```

### Deploy to red dot

In the `build/` directory you will find three files:

- [forms-lookup-bundle.js](build/forms-lookup-bundle.js) - script for the forms lookup page
- [all-forms-bundle.js](build/all-forms-bundle.js) - script for the all forms page
- [forms-lookup.css](build/forms-lookup.css) - stylesheet for both pages

#### Deploy [forms.htm](https://www.courts.ca.gov/forms.htm)

Include the stylesheet (see [index.html line 56](index.html#L56)):

```html
<link rel="stylesheet" type="text/css" href="build/forms-lookup.css">
```

Include the following `<div>` and `<script>` tags (see [index.html lines 434-442](index.html#L434-L442)):

```html
<div class="row"> 
    <div class="col-xs-12">
        <div id="jcc-forms-results-mount-point"></div>
        <script src="build/forms-lookup-bundle.js"></script>
        <script>initFormsLookup(document.querySelector('#jcc-forms-results-mount-point'));</script>
    </div>
</div>
```

#### Deploy allforms.html

This is a new listing of all forms that replaces both [formname.htm](https://www.courts.ca.gov/formname.htm) and [formnumber.htm](https://www.courts.ca.gov/formnumber.htm). 

Include the stylesheet (see [allforms.html line 56](allforms.html#L56)):

```html
<link rel="stylesheet" type="text/css" href="build/forms-lookup.css">
```

Include the following `<div>` and `<script>` tags (see [allforms.html lines 434-442](allforms.html#L434-L442)):

```html
<div class="row"> 
    <div class="col-xs-12">
        <div id="jcc-forms-results-mount-point"></div>
        <script src="build/all-forms-bundle.js"></script>
        <script>initAllForms(document.querySelector('#jcc-forms-results-mount-point'));</script>
    </div>
</div>
```

### Local Development

Develop locally with your favorite static web server. E.g. `python -m SimpleHTTPServer`.

