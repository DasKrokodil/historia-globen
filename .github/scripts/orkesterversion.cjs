// Orkesterns versionskontroll (.github/workflows/orkesterversion.yml).
// Läser installerad version ur .orchestra/project.md, hämtar upstreams taggar och skapar eller uppdaterar
// ett issue när en nyare stabil version finns. Förhandsversioner (v1.2.0-rc1 o.d.) räknas inte.
const fs = require('node:fs');

const UPSTREAM = { owner: 'solwation', repo: 'dirigenten-och-orkestern' };
const RUBRIK = 'Orkestern: ny version av dirigenten och orkestern finns';

/** "v0.8.2" → [0, 8, 2], annars null (förhandsversioner och andra taggar). */
function tolka(tagg) {
  const m = /^v(\d+)\.(\d+)\.(\d+)$/.exec(tagg);
  return m ? m.slice(1).map(Number) : null;
}
function jamfor(a, b) {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}
/** Installerad tagg ur raden "Installerad version" i project.md, till exempel (tagg `v0.8.2`, …). */
function installerad(text) {
  const rad = text.split('\n').find(r => r.includes('**Installerad version:**'));
  const m = rad && /tagg `(v\d+\.\d+\.\d+)`/.exec(rad);
  return m ? m[1] : null;
}
/** Nyaste stabila taggen bland namnen, eller null. */
function nyaste(namn) {
  return namn.map(n => [n, tolka(n)]).filter(([, v]) => v).sort((a, b) => jamfor(b[1], a[1]))[0]?.[0] ?? null;
}

async function kontrollera({ github, context }) {
  const inst = installerad(fs.readFileSync('.orchestra/project.md', 'utf8'));
  if (!inst) throw new Error('hittade inte "Installerad version" med tagg i .orchestra/project.md');
  const taggar = await github.paginate(github.rest.repos.listTags, { ...UPSTREAM, per_page: 100 });
  const senaste = nyaste(taggar.map(t => t.name));
  if (!senaste) throw new Error('hittade inga stabila taggar i upstream');
  if (jamfor(tolka(senaste), tolka(inst)) <= 0) return `Aktuell: installerad ${inst}, nyaste ${senaste}.`;

  const repo = { owner: context.repo.owner, repo: context.repo.repo };
  const oppna = await github.paginate(github.rest.issues.listForRepo, { ...repo, state: 'open', per_page: 100 });
  const befintligt = oppna.find(i => !i.pull_request && i.title.startsWith(RUBRIK));
  const lank = `https://github.com/${UPSTREAM.owner}/${UPSTREAM.repo}`;
  const text = [
    `Den automatiska kontrollen hittade en nyare version av dirigenten och orkestern.`,
    '',
    `- **Installerad:** ${inst} (raden "Installerad version" i \`.orchestra/project.md\`)`,
    `- **Nyaste stabila:** ${senaste}`,
    `- **Ändringar:** ${lank}/blob/${senaste}/CHANGELOG.md och ${lank}/compare/${inst}...${senaste}`,
    '',
    'Nästa steg (Claude Code): läs ändringarna, bedöm om något är en felrättning som berör oss och vad som behöver ändras i `.orchestra/project.md`, och skriv en kort rekommendation här. Uppdateringen görs enligt `.orchestra/shared/INSTALL.md` i en egen pull request, först när Rikard har godkänt.',
    '',
    '_Skapat av flödet Orkesterns version (`.github/workflows/orkesterversion.yml`)._',
  ].join('\n');

  if (befintligt) {
    if (befintligt.title.endsWith(`(${senaste})`)) return `Issue #${befintligt.number} gäller redan ${senaste}.`;
    await github.rest.issues.update({ ...repo, issue_number: befintligt.number, title: `${RUBRIK} (${senaste})`, body: text });
    await github.rest.issues.createComment({ ...repo, issue_number: befintligt.number, body: `Ännu nyare version: ${senaste}. Texten ovan är uppdaterad.` });
    return `Uppdaterade issue #${befintligt.number} till ${senaste}.`;
  }
  const nytt = await github.rest.issues.create({ ...repo, title: `${RUBRIK} (${senaste})`, body: text, labels: ['teknik'] });
  return `Skapade issue #${nytt.data.number} för ${senaste}.`;
}

module.exports = { kontrollera, tolka, jamfor, installerad, nyaste };
