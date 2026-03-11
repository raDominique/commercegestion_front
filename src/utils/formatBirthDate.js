// Formats a date (Date object, timestamp, or date string) to "JJ Mois AAAA" in French
const MONTHS_FR = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

function formatBirthDate(input) {
  if (input === null || input === undefined || input === '') return '';
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTHS_FR[date.getMonth()] || '';
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export default formatBirthDate;
