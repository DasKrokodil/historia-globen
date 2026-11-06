// A4-affisch från Platt vy (#485). Kartan kommer från samma ekvirektangulära
// canvasar som klotet använder; DOM-etiketterna ersätts av en kort händelselista.

import { formatEventTime, formatYear, t } from '../model.js';
import { selectEventsForYear } from '../date-events.js';

const WIDTH = 3508;  // A4 liggande, 300 dpi
const HEIGHT = 2480;
const MAP_WIDTH = 3200;
const MAP_HEIGHT = MAP_WIDTH / 2; // samma 2:1-proportion som baseCanvas och overlayCanvas
const MAP_X = (WIDTH - MAP_WIDTH) / 2;
const MAP_Y = 40;
const MARGIN = 120;
const MAX_EVENTS = 8;
const COLORS = {
  background: '#101924', text: '#f1eadc', muted: '#c8c0b0', accent: '#d0a85f', line: '#8a7551',
};

/**
 * De viktigaste händelserna som pågår ett helt valt år. Funktionen är medvetet
 * ren: #483 kan flytta den till ett gemensamt datumurval utan att exportkoden
 * eller main.js får egen datumlogik.
 */
export function selectPosterEvents(year, events) {
  return selectEventsForYear(year, events).slice(0, MAX_EVENTS);
}

function drawText(ctx, text, x, y, size, weight = '400', align = 'left') {
  ctx.font = `${weight} ${size}px Instrument Sans, sans-serif`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

/** Skapar affischbilden, men laddar inte ned den. Exporteras för att kunna testas utan DOM-etiketter. */
export function createPoster({ baseCanvas, overlayCanvas, year, events, labels }) {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH; canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  const listed = selectPosterEvents(year, events);

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.drawImage(baseCanvas, MAP_X, MAP_Y, MAP_WIDTH, MAP_HEIGHT);
  ctx.drawImage(overlayCanvas, MAP_X, MAP_Y, MAP_WIDTH, MAP_HEIGHT);
  ctx.fillStyle = COLORS.muted;
  ctx.fillRect(MAP_X, MAP_Y + MAP_HEIGHT, MAP_WIDTH, 3);

  let y = MAP_Y + MAP_HEIGHT + 160;
  ctx.fillStyle = COLORS.accent;
  drawText(ctx, formatYear(year), MARGIN, y, 140, '600');
  y += 72;
  ctx.fillStyle = COLORS.text;
  drawText(ctx, t(labels.title), MARGIN, y, 64, '600');
  y += 48;
  ctx.fillStyle = COLORS.muted;
  drawText(ctx, t(labels.legend), MARGIN, y, 32);

  const listTop = y + 70;
  const columnCount = listed.length > 4 ? 2 : 1;
  const rows = Math.max(1, Math.ceil(listed.length / columnCount));
  const listBottom = HEIGHT - 142;
  const rowHeight = Math.floor((listBottom - listTop) / rows);
  const columnWidth = (WIDTH - MARGIN * 2) / columnCount;
  ctx.fillStyle = COLORS.text;
  for (const [index, event] of listed.entries()) {
    const column = Math.floor(index / rows);
    const row = index % rows;
    const x = MARGIN + column * columnWidth;
    const rowY = listTop + row * rowHeight;
    drawText(ctx, `${formatEventTime(event)} · ${t(event.title)}`, x, rowY + 48, 48);
    ctx.fillStyle = COLORS.muted;
    drawText(ctx, t(event.place), x, rowY + 82, 30);
    ctx.fillStyle = COLORS.text;
  }
  if (!listed.length) drawText(ctx, t(labels.empty), MARGIN, listTop + 48, 48);

  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(MARGIN, HEIGHT - 82); ctx.lineTo(WIDTH - MARGIN, HEIGHT - 82); ctx.stroke();
  ctx.fillStyle = COLORS.muted;
  drawText(ctx, t(labels.sources), MARGIN, HEIGHT - 42, 22);
  drawText(ctx, t(labels.website), WIDTH / 2, HEIGHT - 42, 22, '400', 'center');
  drawText(ctx, t(labels.license), WIDTH - MARGIN, HEIGHT - 42, 22, '400', 'right');
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
