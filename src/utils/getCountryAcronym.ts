import countryData from '../countryOfOrigin.json';

type Country = {
  name: string;
  acronym: string;
};

const frToEn: Record<string, string> = {
  'etats-unis': 'United States',
  'royaume-uni': 'United Kingdom',
  france: 'France',
  espagne: 'Spain',
  allemagne: 'Germany',
  italie: 'Italy',
  bresil: 'Brazil',
  chine: 'China',
  japon: 'Japan',
  canada: 'Canada',
  russie: 'Russian Federation',
  inde: 'India',
  mexique: 'Mexico',
  moldavie: 'Moldova, Republic of',
  moldova: 'Moldova, Republic of',
  argentine: 'Argentina',
  australie: 'Australia',
  maroc: 'Morocco',
  tunisie: 'Tunisia',
  algerie: 'Algeria',
  egypte: 'Egypt',
  portugal: 'Portugal',
  belgique: 'Belgium',
  suisse: 'Switzerland',
  suede: 'Sweden',
  'pays-bas': 'Netherlands',
  norvege: 'Norway',
  grece: 'Greece',
  autriche: 'Austria',
  irlande: 'Ireland',
  danemark: 'Denmark',
  pologne: 'Poland',
  finlande: 'Finland',
  islande: 'Iceland',
  hongrie: 'Hungary',
  roumanie: 'Romania',
  ukraine: 'Ukraine',
  turquie: 'Turkey',
  "cote d'ivoire": "Cote D'ivoire",
  'coree du sud': 'Korea, Republic of',
  indonesie: 'Indonesia',
  philippines: 'Philippines',
  thailande: 'Thailand',
  vietnam: 'Viet Nam',
  pakistan: 'Pakistan',
  israel: 'Israel',
  liban: 'Lebanon',
  singapour: 'Singapore',
  'nouvelle-zelande': 'New Zealand',
  'afrique du sud': 'South Africa',
  colombie: 'Colombia',
  perou: 'Peru',
};

/**
 * Function to normalize a string by removing accents/diacritics
 * and converting all characters to lowercase
 */
function normalize(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Function to retrieve the ISO 3166-1 alpha-2 country code (acronym)
 * given the country's name in either French or English
 */
export function getCountryAcronym(inputName: string): string | null {
  // If input is empty, return null
  if (!inputName) return null;

  // Check if the input is already a valid ISO 3166-1 alpha-2 code (2 uppercase letters)
  if (/^[A-Z]{2}$/.test(inputName)) {
    // Verify it's a valid country code by checking if it exists in our data
    const isValidCode = (countryData.countries as Country[]).some(
      c => c.acronym === inputName
    );

    if (isValidCode) {
      return inputName;
    }
  }

  const normalizedInput = normalize(inputName);
  const translated = frToEn[normalizedInput] || inputName;

  const country = (countryData.countries as Country[]).find(
    c => normalize(c.name) === normalize(translated)
  );

  return country?.acronym ?? null;
}
