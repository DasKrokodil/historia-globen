// Regler för besökarnas förslag (docs/feedback.md). Samma regler används av formuläret
// (js/ui/feedback.js) och av servern (functions/api/feedback.js), så att gränserna bara står på ett ställe.
// Ren modul utan webbläsarobjekt: den importeras också av Cloudflare Pages Function och av testerna.

/** Kategorierna: id som skickas, rubrik i formuläret, prefix i issuets titel och etikett i det privata repot. */
export const FEEDBACK_CATEGORIES = [
  { id: 'new-event',  label: 'Föreslå en historisk händelse',      prefix: '[Ny händelse]', tag: 'new-event' },
  { id: 'correction', label: 'Rapportera ett faktafel',            prefix: '[Faktafel]',    tag: 'historical-correction' },
  { id: 'feature',    label: 'Föreslå en förbättring av webbplatsen', prefix: '[Förbättring]', tag: 'feature-request' },
  { id: 'other',      label: 'Övrig feedback',                     prefix: '[Övrigt]',      tag: 'other-feedback' },
];
export const FEEDBACK_CATEGORY = Object.fromEntries(FEEDBACK_CATEGORIES.map(c => [c.id, c]));

export const LIMITS = { descriptionMin: 10, descriptionMax: 4000, sourceMax: 500, emailMax: 254 };

/** Fälten som får skickas. website är honungsfältet (ska vara tomt). */
export const FIELDS = ['category', 'description', 'source', 'email', 'eventId', 'objectType', 'objectId', 'objectYear', 'pageUrl', 'turnstileToken', 'website'];

export const EVENT_ID = /^[a-z0-9][a-z0-9-]{0,99}$/;
/** Faktarutor som kan bifoga ett objekt till en faktafelsrapport (#379). */
export const REPORT_OBJECT_TYPES = {
  event: 'Händelse', empire: 'Rike', 'vanished-country': 'Försvunnet land',
  religion: 'Religion', war: 'Krig', route: 'Väg eller resa',
};
// Enkel formatkontroll: något@något.toppdomän, utan mellanslag och tecken som inte hör hemma i en adress
const EMAIL = /^[^\s@<>()[\]\\,;:"`]+@[^\s@<>()[\]\\,;:"`]+\.[^\s@<>()[\]\\,;:"`.]{2,}$/;

/** Tar bort styrtecken (utom radbrytning och tabb) och gör radbrytningarna enhetliga. */
export function clean(s) {
  return String(s ?? '').replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim();
}

/**
 * Kontrollerar formulärets fält. Returnerar { errors, value }: errors är { fält: kod } (tomt när allt är rätt)
 * och value de rensade värdena. Koderna: required, too_short, too_long, invalid, not_allowed.
 */
export function validateFeedback(input) {
  const errors = {};
  const str = k => (typeof input[k] === 'string' ? clean(input[k]) : input[k] == null ? '' : null);
  const value = {
    category: str('category'), description: str('description'), source: str('source'),
    email: str('email'), eventId: str('eventId'), objectType: str('objectType'),
    objectId: str('objectId'), objectYear: str('objectYear'), pageUrl: str('pageUrl'),
  };
  for (const [k, v] of Object.entries(value)) if (v === null) errors[k] = 'invalid';

  if (!errors.category && !value.category) errors.category = 'required';
  else if (!errors.category && !FEEDBACK_CATEGORY[value.category]) errors.category = 'invalid';

  const d = value.description;
  if (!errors.description) {
    if (!d) errors.description = 'required';
    else if (d.length < LIMITS.descriptionMin) errors.description = 'too_short';
    else if (d.length > LIMITS.descriptionMax) errors.description = 'too_long';
  }
  if (!errors.source && value.source.length > LIMITS.sourceMax) errors.source = 'too_long';
  if (!errors.email && value.email) {
    if (value.email.length > LIMITS.emailMax) errors.email = 'too_long';
    else if (!EMAIL.test(value.email)) errors.email = 'invalid';
  }
  if (!errors.eventId && value.eventId) {
    if (!EVENT_ID.test(value.eventId)) errors.eventId = 'invalid';
    else if (value.category !== 'correction') errors.eventId = 'not_allowed'; // en händelse hör bara till faktafel
  }
  const contextFields = ['objectType', 'objectId', 'objectYear', 'pageUrl'];
  const hasContext = contextFields.some(k => value[k]);
  if (hasContext && value.category !== 'correction') {
    for (const k of contextFields) if (!errors[k]) errors[k] = 'not_allowed';
  } else if (hasContext) {
    for (const k of contextFields) if (!errors[k] && !value[k]) errors[k] = 'required';
    if (!errors.objectType && !REPORT_OBJECT_TYPES[value.objectType]) errors.objectType = 'invalid';
    if (!errors.objectId && !EVENT_ID.test(value.objectId)) errors.objectId = 'invalid';
    if (!errors.objectYear && !/^-?\d{1,8}$/.test(value.objectYear)) errors.objectYear = 'invalid';
    if (!errors.pageUrl) {
      try {
        const url = new URL(value.pageUrl);
        if (!/^https?:$/.test(url.protocol) || url.search || url.hash || url.username || url.password) errors.pageUrl = 'invalid';
      } catch { errors.pageUrl = 'invalid'; }
    }
  }
  return { errors, value };
}
