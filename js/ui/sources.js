// "Om källorna": källpolicy och källregistret från data/sources.json.
import { t, settings } from '../model.js';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export class SourcesDialog {
  constructor({ root, body, close, openBtn }, data) {
    Object.assign(this, { root, body, data });
    this.onSettings = () => {};
    openBtn.addEventListener('click', () => this.open());
    close.addEventListener('click', () => this.hide());
    root.addEventListener('click', e => { if (e.target === root) this.hide(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !root.hidden) this.hide(); });
  }

  open(highlightIds = null) {
    const { sources, events, funfacts, polities, land, borders, religionsDoc } = this.data;
    // Religionslagrets riken: med kontrollerat år för kristnandet har de en egen källa
    const states = (religionsDoc?.polities ?? []).filter(p => p.source).map(p => ({ name: p.name, sources: [p.source], review: 'source-checked' }));
    const usedBy = id => [
      ...events.filter(e => e.sources?.includes(id)).map(e => t(e.title)),
      ...polities.filter(p => p.sources?.includes(id)).map(p => t(p.name)),
      ...states.filter(s => s.sources?.includes(id)).map(s => `${s.name} (kristendom)`),
      ...(id === 'wikipedia-religion' ? ['Religioner (faktarutan för varje rike)'] : []),
      ...(id === 'wp-religion-by-country' ? ['Religioner (nutida länder från 1900)'] : []),
      ...(land.source === id ? ['Grundkartan'] : []),
      ...(borders.source === id ? ['Dagens gränser'] : []),
    ];
    const counts = { checked: 0, two: 0, human: 0, draft: 0 };
    for (const x of [...events, ...funfacts, ...polities, ...states]) {
      if (x.review === 'human-reviewed') counts.human++;
      else if (x.review === 'two-sources') counts.two++;
      else if (x.review === 'source-checked') counts.checked++;
      else counts.draft++;
    }
    const rows = sources
      .filter(s => !highlightIds || highlightIds.includes(s.id))
      .map(s => {
        const used = usedBy(s.id);
        return `<tr>
          <td><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>${used.length ? `<div class="used-by">Används för: ${used.map(esc).join(', ')}</div>` : ''}</td>
          <td>${esc(s.license)}</td>
          <td class="num">${esc(s.checked)}</td>
        </tr>`;
      }).join('');

    this.body.innerHTML = `
      ${highlightIds ? '<p><strong>Källor för den här fun facten.</strong> <button type="button" class="link-btn" data-all>Visa alla källor</button></p>' : ''}
      <h3>Källpolicy</h3>
      <ol>
        <li>Varje uppgift har minst en källa, med länk och datum då den kontrollerades.</li>
        <li>Varje uppgift har en granskningsstatus: utkast, källa kontrollerad, två källor stämmer eller granskad av människa. Utkast visas inte.</li>
        <li>"Två källor stämmer" betyder att årtal och plats har jämförts med en andra, oberoende källa, till exempel Wikidata, och att de stämmer.</li>
        <li>Uppgifter som Claude föreslår är utkast tills källan är öppnad och stämmer.</li>
        <li>Osäkerhet visas öppet, till exempel "cirka" eller ett spann.</li>
        <li>En fun fact som jämför två saker har källa för båda leden.</li>
      </ol>
      <h3>Läget just nu</h3>
      <p>${counts.checked} uppgifter har kontrollerad källa. ${counts.two} har dessutom en andra källa som stämmer. Båda grupperna väntar på granskning av människa. ${counts.human} är granskade. ${counts.draft} är utkast.</p>
      <h3>Källregister</h3>
      <div class="src-table-wrap"><table class="src-table">
        <thead><tr><th>Källa</th><th>Licens</th><th>Kontrollerad</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <div class="check-row">
        <input type="checkbox" id="show-drafts" ${settings.showDrafts ? 'checked' : ''}>
        <label for="show-drafts">Visa även utkast (för den som granskar)</label>
      </div>`;
    this.body.querySelector('[data-all]')?.addEventListener('click', () => this.open());
    this.body.querySelector('#show-drafts').addEventListener('change', e => {
      settings.showDrafts = e.target.checked;
      this.onSettings();
    });
    this.root.hidden = false;
  }
  hide() { this.root.hidden = true; }
}
