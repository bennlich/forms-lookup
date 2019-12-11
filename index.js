async function init() {
  let guides = [
    {
      'id': 'small-claims',
      'title': 'Small Claims',
      'url': 'https://www.courts.ca.gov/selfhelp-smallclaims.htm',
      'formsUrl': 'https://www.courts.ca.gov/1017.htm',
      'tags': ['small claims', 'sue', 'suing', 'mediation', 'appeal']
    },
    {
      'id': 'custody',
      'title': 'Custody & Parenting Time (Visitation)',
      'url': 'https://www.courts.ca.gov/selfhelp-custody.htm',
      'formsUrl': 'https://www.courts.ca.gov/1192.htm',
      'tags': ['family law', 'custody', 'parenting time', 'visitation', 'violence']
    },
    {
      'id': 'child-support',
      'title': 'Child Support',
      'url': 'https://www.courts.ca.gov/selfhelp-support.htm',
      'formsUrl': 'https://www.courts.ca.gov/1199.htm',
      'tags': ['family law', 'child support']
    },
    {
      'id': 'parentage',
      'title': 'Parentage/Paternity',
      'url': 'https://www.courts.ca.gov/selfhelp-parentage.htm',
      'formsUrl': 'https://www.courts.ca.gov/1203.htm',
      'tags': ['family law', 'parentage', 'paternity', 'parent']
    },
    {
      'id': 'child-abuse',
      'title': 'Child Abuse & Neglect',
      'url': 'https://www.courts.ca.gov/selfhelp-childabuse.htm',
      'formsUrl': 'https://www.courts.ca.gov/1208.htm',
      'tags': ['family law', 'child abuse', 'neglect', 'abuse', 'violence']
    },
    {
      'id': 'guardianship',
      'title': 'Guardianship',
      'url': 'https://www.courts.ca.gov/selfhelp-guardianship.htm',
      'formsUrl': 'https://www.courts.ca.gov/1214.htm',
      'tags': ['family law', 'guardianship', 'custody', 'parent']
    },
    {
      'id': 'juvenile-delinquency',
      'title': 'Juvenile Delinquency',
      'url': 'https://www.courts.ca.gov/selfhelp-delinquency.htm',
      'formsUrl': 'https://www.courts.ca.gov/1217.htm',
      'tags': ['family law', 'juvenile delinquency', 'minor']
    },
    {
      'id': 'adoption',
      'title': 'Adoption',
      'url': 'https://www.courts.ca.gov/selfhelp-adoption.htm',
      'formsUrl': 'https://www.courts.ca.gov/1219.htm',
      'tags': ['family law', 'adoption']
    },
    {
      'id': 'emancipation',
      'title': 'Emancipation',
      'url': 'https://www.courts.ca.gov/selfhelp-emancipation.htm',
      'formsUrl': 'https://www.courts.ca.gov/1222.htm',
      'tags': ['family law', 'emancipation', 'become adult', 'parents']
    },
    {
      'id': 'divorce',
      'title': 'Divorce or Separation',
      'url': 'https://www.courts.ca.gov/selfhelp-divorce.htm',
      'formsUrl': 'https://www.courts.ca.gov/8218.htm',
      'tags': ['divorce', 'separation', 'domestic partner']
    },
    {
      'id': 'domestic-violence',
      'title': 'Domestic Violence',
      'url': 'https://www.courts.ca.gov/selfhelp-domesticviolence.htm',
      'formsUrl': 'https://www.courts.ca.gov/1271.htm',
      'tags': ['violence', 'domestic', 'restraining order']
    },
    {
      'id': 'restraining-order',
      'title': 'Restraining Order',
      'url': 'https://www.courts.ca.gov/selfhelp-domesticviolence.htm',
      'formsUrl': 'https://www.courts.ca.gov/1271.htm',
      'tags': ['violence', 'restraining order']
    },
    {
      'id': 'adult-abuse',
      'title': 'Elder and Dependent Adult Abuse',
      'url': 'https://www.courts.ca.gov/selfhelp-elder.htm',
      'formsUrl': 'https://www.courts.ca.gov/1276.htm',
      'tags': ['violence', 'restraining order']
    },
    {
      'id': 'civil-harassment',
      'title': 'Civil Harassment',
      'url': 'https://www.courts.ca.gov/1044.htm',
      'formsUrl': 'https://www.courts.ca.gov/1281.htm',
      'tags': ['violence']
    },
    {
      'id': 'workplace-violence',
      'title': 'Workplace Violence',
      'url': 'https://www.courts.ca.gov/1045.htm',
      'formsUrl': 'https://www.courts.ca.gov/1286.htm',
      'tags': ['violence']
    },
    {
      'id': 'gun-violence',
      'title': 'Gun Violence Restraining Orders',
      'url': 'https://www.courts.ca.gov/33961.htm',
      'formsUrl': 'https://www.courts.ca.gov/33683.htm',
      'tags': ['violence']
    },
    {
      'id': 'evictions',
      'title': 'Evictions',
      'url': 'https://www.courts.ca.gov/selfhelp-eviction.htm',
      'formsUrl': 'https://www.courts.ca.gov/selfhelp-eviction.htm',
      'tags': ['housing', 'evictions', 'unlawful detainer']
    },
    {
      'id': 'foreclosure',
      'title': 'Foreclosure',
      'url': 'https://www.courts.ca.gov/1048.htm',
      'formsUrl': 'https://www.courts.ca.gov/1048.htm',
      'tags': ['housing', 'foreclosure']
    },
    {
      'id': 'security-depost',
      'title': 'Security Deposits',
      'url': 'https://www.courts.ca.gov/selfhelp-eviction-security-deposits.htm',
      'formsUrl': 'https://www.courts.ca.gov/selfhelp-eviction-security-deposits.htm',
      'tags': ['housing', 'security deposits']
    },
    {
      'id': 'name-change',
      'title': 'Name Change',
      'url': 'https://www.courts.ca.gov/selfhelp-namechange.htm',
      'formsUrl': 'https://www.courts.ca.gov/1053.htm',
      'tags': ['name change']
    },
  ];

  let forms = await fetch('all-forms.json').then((res) => res.json());

  let concepts = [
    {
      'canonicalName': 'abuse',
      'relatedTags': ['violence', 'hit', 'beat', 'whip', 'touch']
    }
  ];

  let searchResults = document.querySelector('.search-results');
  let guideResults = document.querySelector('.guide-results');
  let formResults = document.querySelector('.form-results');
  let searchInput = document.querySelector('#srl-filter-input');

  let render = () => {
    let currentInput = searchInput.value;
    let matchingGuides = guides.filter((guide) => {
      let allTags = guide.tags.concat(guide.title);
      allTags = _.flatten(allTags.map((t) => t.split(' ')));
      return _.some(allTags.map((tag) => tag.toLowerCase().startsWith(currentInput.toLowerCase())));
    });

    let matchingForms = forms.filter((form) => {
      let allTags = [form.id, form.title, form.id.replace(/\-/g, '')].concat(form.id.split('-'));
      return _.some(allTags.map((tag) => tag.toLowerCase().startsWith(currentInput.toLowerCase())));
    });

    if (matchingGuides.length > 0) {
      guideResults.innerHTML = matchingGuides.map((guide) => guideResult(guide)).join('\n');  
    } else {
      guideResults.innerHTML = "No matching guides";
    }
    
    if (matchingForms.length > 0) {
      formResults.innerHTML = matchingForms.map((form) => formResult(form)).join('\n');  
    } else {
      formResults.innerHTML = "No matching forms";
    }
    
  }

  function guideResult(guide) {
    return (`
      <div class="guide-result">
        <a href="${guide.url}" target="_blank">${guide.title}</a>
      </div>
    `);
  }

  function formResult(form) {
    return (`
      <div class="form-result">
        <div class="form-number">${form.id}</div>
        <div class="form-title">
          <a href="${form.url}" target="_blank">${form.title}</a>
        </div>
      </div>
    `);
  }

  searchInput.addEventListener('input', () => render());

  render();

}

init();
