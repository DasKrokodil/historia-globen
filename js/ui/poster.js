// A4-affisch från Platt vy (#485). Kartan kommer från samma ekvirektangulära
// canvasar som klotet använder; DOM-etiketterna ersätts av en kort händelselista.

import { formatYear, t } from '../model.js';

const WIDTH = 3508;  // A4 liggande, 300 dpi
const HEIGHT = 2480;
const MAP_HEIGHT = WIDTH / 2; // samma 2:1-proportion som baseCanvas och overlayCanvas
const MARGIN = 120;
const MAX_EVENTS = 8;

/**
 * De viktigaste händelserna som pågår ett helt valt år. Funktionen är medvetet
 * ren: #483 kan flytta den till ett gemensamt datumurval utan att exportkoden
 * eller main.js får egen datumlogik.
 */
export function selectPosterEvents(year, events) {
  return events
    .map((event, index) => ({ event, index }))
    .filter(({ event }) => event.start <= year && event.end >= year)
    .sort((a, b) => priority(a.event) - priority(b.event) || a.index - b.index)
    .slice(0, MAX_EVENTS)
    .map(({ event }) => event);
}

function priority(event) { return event.top ? 0 : event.major ? 1 : 2; }

function drawFitText(ctx, text, x, y, maxWidth, size, weight = '400', align = 'left') {
  let fontSize = size;
  do {
    ctx.font = `${weight} ${fontSize}px Instrument Sans, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth || fontSize <= 17) break;
    fontSize -= 1;
  } while (fontSize > 17);
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

/** Skapar affischbilden, men laddar inte ned den. Exporteras för att kunna testas utan DOM-etiketter. */
export function createPoster({ baseCanvas, overlayCanvas, year, events, labels }) {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH; canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  const listed = selectPosterEvents(year, events);

  ctx.fillStyle = '#101924';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.drawImage(baseCanvas, 0, 0, WIDTH, MAP_HEIGHT);
  ctx.drawImage(overlayCanvas, 0, 0, WIDTH, MAP_HEIGHT);
  ctx.fillStyle = '#d8d0be';
  ctx.fillRect(0, MAP_HEIGHT, WIDTH, 3);

  let y = MAP_HEIGHT + 94;
  ctx.fillStyle = '#d0a85f';
  drawFitText(ctx, formatYear(year), MARGIN, y, WIDTH - MARGIN * 2, 58, '600');
  y += 56;
  ctx.fillStyle = '#f1eadc';
  drawFitText(ctx, t(labels.title), MARGIN, y, WIDTH - MARGIN * 2, 42, '600');
  y += 48;
  ctx.fillStyle = '#c8c0b0';
  drawFitText(ctx, t(labels.legend), MARGIN, y, WIDTH - MARGIN * 2, 25);

  y += 52;
  const listBottom = HEIGHT - 112;
  const rowHeight = Math.max(31, Math.floor((listBottom - y) / Math.max(1, listed.length)));
  ctx.fillStyle = '#f1eadc';
  for (const event of listed) {
    const line = `${formatYear(event.start)} · ${t(event.title)}`;
    drawFitText(ctx, line, MARGIN, y, WIDTH - MARGIN * 2, Math.min(27, rowHeight - 8));
    y += rowHeight;
  }
  if (!listed.length) drawFitText(ctx, t(labels.empty), MARGIN, y, WIDTH - MARGIN * 2, 25);

  ctx.strokeStyle = '#8a7551';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(MARGIN, HEIGHT - 82); ctx.lineTo(WIDTH - MARGIN, HEIGHT - 82); ctx.stroke();
  ctx.fillStyle = '#c8c0b0';
  drawFitText(ctx, t(labels.sources), MARGIN, HEIGHT - 42, WIDTH - MARGIN * 2, 22);
  drawFitText(ctx, t(labels.license), WIDTH - MARGIN, HEIGHT - 42, WIDTH - MARGIN * 2, 22, '400', 'right');
  return { canvas, events: listed };
}

/** Sparar en A4-affisch som PNG utan server eller beroende. */
export function downloadPoster(options) {
  const { canvas, events } = createPoster(options);
  const prefix = t(options.labels.filename);
  const filename = `${prefix}-${options.year}.png`;
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) { reject(new Error('Kunde inte skapa affischbilden.')); return; }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      resolve({ filename, eventCount: events.length, canvas });
    }, 'image/png');
  });
}
