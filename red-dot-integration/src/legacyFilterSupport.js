import { categories } from './categories.js';

// Map from legacy ?filter= query params to new ?query= query params
const legacyFilterMap = [
  {
    "key": "AD",
    "title": "Adoption",
    "categoryId": "adoption"
  },
  {
    "key": "ADR",
    "title": "Alternative Dispute Resolution",
    "prefix": "ADR"
  },
  {
    "key": "APP",
    "title": "Appellate",
    "categoryId": "appeals"
  },
  {
    "key": "AT",
    "title": "Attachment",
    "prefix": "AT"
  },
  {
    "key": "BMD",
    "title": "Birth, Marriage, Death",
    "prefix": "BMD"
  },
  {
    "key": "CLETS",
    "title": "CLETS",
    "prefix": "CLETS"
  },
  {
    "key": "CM",
    "title": "Case Management",
    "prefix": "CM"
  },
  {
    "key": "CIV",
    "title": "Civil",
    "categoryId": "civil"
  },
  {
    "key": "CH",
    "title": "Civil Harassment Prevention",
    "categoryId": "civil-harassment"
  },
  {
    "key": "CD",
    "title": "Claim and Delivery",
    "prefix": "CD"
  },
  {
    "key": "REC",
    "title": "Court Records",
    "prefix": "REC"
  },
  {
    "key": "CR",
    "title": "Criminal",
    "categoryId": "criminal"
  },
  {
    "key": "DAL",
    "title": "Disability Access Litigation",
    "prefix": "DAL"
  },
  {
    "key": "DSC",
    "title": "Discovery",
    "prefix": "DISC"
  },
  {
    "key": "DV",
    "title": "Domestic Violence Prevention - English",
    "categoryId": "domestic-violence"
  },
  {
    "key": "DVC",
    "title": "Domestic Violence Prevention - Chinese",
    "categoryId": "domestic-violence"
  },
  {
    "key": "DVK",
    "title": "Domestic Violence Prevention - Korean",
    "categoryId": "domestic-violence"
  },
  {
    "key": "DVS",
    "title": "Domestic Violence Prevention - Spanish",
    "categoryId": "domestic-violence"
  },
  {
    "key": "DVV",
    "title": "Domestic Violence Prevention - Vietnamese",
    "categoryId": "domestic-violence"
  },
  {
    "key": "DVO",
    "title": "Domestic Violence Prevention - Other Languages",
    "categoryId": "domestic-violence"
  },
  {
    "key": "EA",
    "title": "Elder or Dependent Adult Abuse Prevention",
    "categoryId": "elder-abuse"
  },
  {
    "key": "EFS",
    "title": "Electronic Filing and Service",
    "prefix": "EFS"
  },
  {
    "key": "EM",
    "title": "Emancipation of Minor",
    "prefix": "EM"
  },
  {
    "key": "EPO",
    "title": "Emergency Protective Order",
    "prefix": "EPO"
  },
  {
    "key": "EJ",
    "title": "Enforcement of Judgment",
    "prefix": "EJ"
  },
  {
    "key": "EJT",
    "title": "Expedited Jury Trial",
    "prefix": "EJT"
  },
  {
    "key": "DI",
    "title": "Family Law - Dissolution, Legal Separation and Annulment FL-100 - 199",
    "categoryId": "divorce"
  },
  {
    "key": "PA",
    "title": "Family Law - Parentage Actions FL-200 - 299",
    "categoryId": "parentage"
  },
  {
    "key": "MO",
    "title": "Family Law - Motions and Attachments FL-300 - 399",
    "categoryId": "fl-motions-and-attachments"
  },
  {
    "key": "EN",
    "title": "Family Law - Enforcement FL-400 - 499",
    "categoryId": "fl-enforcement"
  },
  {
    "key": "IA",
    "title": "Family Law - Interstate Actions FL-500 - 599",
    "categoryId": "fl-interstate-actions"
  },
  {
    "key": "GO",
    "title": "Family Law - Governmental Child Support FL-600 - 699",
    "categoryId": "fl-governmental-child-support"
  },
  {
    "key": "SD",
    "title": "Family Law - Summary Dissolutions FL-800 - 899",
    "categoryId": "fl-summary-dissolutions"
  },
  {
    "key": "FLM",
    "title": "Family Law - Miscellaneous FL-900 - 999",
    "categoryId": "fl-miscellaneous"
  },
  {
    "key": "FW",
    "title": "Fee Waiver",
    "prefix": "FW"
  },
  {
    "key": "GC",
    "title": "Guardianships and Conservatorships",
    "prefix": "GC"
  },
  {
    "key": "GVP",
    "title": "Gun Violence Prevention",
    "categoryId": "gun-violence-prevention"
  },
  {
    "key": "HC",
    "title": "Habeas Corpus",
    "prefix": "HC"
  },
  {
    "key": "ID",
    "title": "Ignition Interlock Device",
    "prefix": "ID"
  },
  {
    "key": "ICW",
    "title": "Indian Child Welfare Act",
    "prefix": "ICWA"
  },
  {
    "key": "IN",
    "title": "Interpreter",
    "prefix": "INT"
  },
  {
    "key": "JV",
    "title": "Juvenile",
    "categoryId": "juvenile"
  },
  {
    "key": "JUD",
    "title": "Judgment",
    "prefix": "JUD"
  },
  {
    "key": "JURY",
    "title": "Jury Selection",
    "prefix": "JURY"
  },
  {
    "key": "LA",
    "title": "Language Access",
    "prefix": "LA"
  },
  {
    "key": "MD",
    "title": "Menacing Dog",
    "prefix": "MD"
  },
  {
    "key": "MIL",
    "title": "Military Service",
    "query": "military"
  },
  {
    "key": "MC",
    "title": "Miscellaneous",
    "prefix": "MC"
  },
  {
    "key": "NC",
    "title": "Name Changes",
    "prefix": "NC"
  },
  {
    "key": "NTA",
    "title": "Notice to Appear and Related Forms",
    "prefix": "TR"
  },
  {
    "key": "PLG",
    "title": "Pleading - General",
    "prefix": "PLD"
  },
  {
    "key": "CO",
    "title": "Pleading - Contract",
    "prefix": "PLD"
  },
  {
    "key": "PL",
    "title": "Pleading - Personal Injury, Property Damage, Wrongful Death",
    "prefix": "PLD"
  },
  {
    "key": "UD",
    "title": "Pleading - Unlawful Detainer",
    "prefix": "UD"
  },
  {
    "key": "DE",
    "title": "Probate - Decedents Estates",
    "prefix": "DE"
  },
  {
    "key": "POS",
    "title": "Proof of Service",
    "categoryId": "proof-of-service"
  },
  {
    "key": "RC",
    "title": "Receiverships",
    "prefix": "RC"
  },
  {
    "key": "SVP",
    "title": "School Violence Prevention",
    "prefix": "SV"
  },
  {
    "key": "SC",
    "title": "Small Claims",
    "categoryId": "small-claims"
  },
  {
    "key": "SUB",
    "title": "Subpoena",
    "prefix": "SUBP"
  },
  {
    "key": "SUM",
    "title": "Summons",
    "prefix": "SUM"
  },
  {
    "key": "TR",
    "title": "Traffic Infractions",
    "categoryId": "traffic"
  },
  {
    "key": "TH",
    "title": "Transitional Housing Misconduct",
    "prefix": "TH"
  },
  {
    "key": "TC",
    "title": "Translated forms - Chinese" // not currently supporting this filter
  },
  {
    "key": "TK",
    "title": "Translated forms - Korean" // not currently supporting this filter
  },
  {
    "key": "TS",
    "title": "Translated forms - Spanish" // not currently supporting this filter
  },
  {
    "key": "TV",
    "title": "Translated forms - Vietnamese" // not currently supporting this filter
  },
  {
    "key": "TO",
    "title": "Translated forms - Other" // not currently supporting this filter
  },
  {
    "key": "UD",
    "title": "Unlawful Detainer (Landlord/Tenant)",
    "prefix": "UD"
  },
  {
    "key": "VL",
    "title": "Vexatious Litigants",
    "prefix": "VL"
  },
  {
    "key": "WG",
    "title": "Wage Garnishment",
    "prefix": "WG"
  },
  {
    "key": "WV",
    "title": "Workplace Violence Prevention",
    "prefix": "WV"
  }
];

export const getQueryForLegacyFilter = filter => {
  let legacyFilterConfig = legacyFilterMap.find(config => config.key === filter);
  if (legacyFilterConfig) {
    if (legacyFilterConfig.categoryId) {
      // This will match a JCC Form Category taxonomy term
      let matchingCategory = categories.find(c => c.id === legacyFilterConfig.categoryId);
      if (!matchingCategory) return '';
      return matchingCategory.query;
    } else {
      // This will match a JCC Form Prefix taxonomy term
      return legacyFilterConfig.title;
    }
  } else {
    return '';
  }
}
