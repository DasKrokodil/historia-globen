// Etikettkontrollen (#588, beslut 2026-11-05, förenklad 2026-11-06): håller regeln "ett issue, en ägare" med en maskin.
// Sedan 2026-11-06 finns en gemensam `redo` och en gemensam `pågår`, och ägaren är den person som issuet är tilldelat
// (Assignees). De gamla agentetiketterna räknas med tills de är omdöpta i GitHub.
// Används av .github/workflows/etikettkontroll.yml via actions/github-script. Ingen hemlighet behövs,
// bara GITHUB_TOKEN med issues: write. Allt som skrivs till GitHub är etiketter och korta kommentarer.
// Ändrar ingen kod eller data i sidan.

const AGARE = ['pågår', 'orkester: pågår', 'codex: pågår', 'copilot: pågår'];
const REDO = ['redo', 'codex: redo', 'copilot: redo'];
const STADA = [...AGARE, ...REDO, 'behöver hjälp', 'etikettfel'];
const FEL = 'etikettfel';
const PAMINN_DAGAR = 7;
const SIGNATUR = '\n\n---\n_Automatisk etikettkontroll (#588)._';

// Ren funktion: vilka motsägelser finns bland etiketterna och tilldelningen? Tom lista = allt är som det ska.
function bedom(etiketter, tilldelade = []) {
  const namn = new Set(etiketter);
  const agare = AGARE.filter(e => namn.has(e));
  const redo = REDO.filter(e => namn.has(e));
  const problem = [];
  if (agare.length > 1) problem.push(`flera ägare samtidigt: ${agare.map(e => `\`${e}\``).join(', ')}`);
  if (redo.length > 1) problem.push(`både ${redo.map(e => `\`${e}\``).join(' och ')}`);
  if (agare.length >= 1 && redo.length >= 1) {
    problem.push(`${redo.map(e => `\`${e}\``).join(', ')} sitter kvar fast issuet redan är taget (${agare.map(e => `\`${e}\``).join(', ')})`);
  }
  if (agare.length >= 1 && tilldelade.length > 1) {
    problem.push(`issuet är taget men tilldelat flera personer: ${tilldelade.map(t => `\`${t}\``).join(', ')}`);
  }
  return problem;
}

// Issuenummer som en pull request stänger. "Del av #N" stänger inget och räknas inte.
function stangda(text) {
  const nummer = new Set();
  for (const m of String(text || '').matchAll(/\b(?:closes|closed|fixes|fixed|resolves|resolved)\s+#(\d+)/gi)) nummer.add(Number(m[1]));
  return [...nummer];
}

const namnLista = issue => (issue.labels || []).map(l => (typeof l === 'string' ? l : l.name));
const tilldeladeLista = issue => (issue.assignees || []).map(a => a.login);

async function taBortEtikett({ github, context }, nummer, namn) {
  try {
    await github.rest.issues.removeLabel({ ...context.repo, issue_number: nummer, name: namn });
  } catch (e) {
    if (e.status !== 404) throw e;
  }
}

// Ett issue: varna (en gång) när etiketterna säger emot varandra, och ta bort varningen när det är rättat.
async function kontrolleraIssue(ctx, nummer) {
  const { github, context } = ctx;
  const { data: issue } = await github.rest.issues.get({ ...context.repo, issue_number: nummer });
  if (issue.pull_request || issue.state !== 'open') return 'hoppade över';
  const etiketter = namnLista(issue);
  const problem = bedom(etiketter, tilldeladeLista(issue));
  const harFel = etiketter.includes(FEL);
  if (problem.length && !harFel) {
    await github.rest.issues.addLabels({ ...context.repo, issue_number: nummer, labels: [FEL] });
    await github.rest.issues.createComment({
      ...context.repo, issue_number: nummer,
      body: `**Etiketterna säger emot varandra:** ${problem.join('; ')}.\n\nRegeln är ett issue, en ägare (AGENTS.md, beslut 2026-11-05 och 2026-11-06). Den agent som kom först, enligt kommentarerna, behåller issuet. Ta bort den etikett som inte stämmer. Varningen försvinner av sig själv när det är rättat.${SIGNATUR}`,
    });
    return 'varnade';
  }
  if (!problem.length && harFel) {
    await taBortEtikett(ctx, nummer, FEL);
    return 'varningen borttagen';
  }
  return 'ok';
}

// En sammanslagen pull request: städa bort pågår-, redo- och hjälpetiketter på issuen den stänger.
async function stadaEfterMerge(ctx, pr) {
  const { github, context } = ctx;
  if (!pr.merged) return [];
  const gjorda = [];
  for (const nummer of stangda(pr.body)) {
    let issue;
    try { ({ data: issue } = await github.rest.issues.get({ ...context.repo, issue_number: nummer })); } catch (e) { if (e.status === 404) continue; throw e; }
    if (issue.pull_request) continue;
    for (const namn of namnLista(issue).filter(e => STADA.includes(e))) {
      await taBortEtikett(ctx, nummer, namn);
      gjorda.push(`#${nummer}: ${namn}`);
    }
  }
  for (const namn of namnLista(pr).filter(e => e === 'behöver hjälp' || e === FEL)) await taBortEtikett(ctx, pr.number, namn);
  return gjorda;
}

// Dagligen: reconcilera alla öppna issues, och påminn om ett pågår som ingen har rört på sju dagar.
async function dagligKontroll(ctx) {
  const { github, context, core } = ctx;
  const sedan = Date.now() - PAMINN_DAGAR * 24 * 3600 * 1000;
  const issues = await github.paginate(github.rest.issues.listForRepo, { ...context.repo, state: 'open', per_page: 100 });
  const pulls = await github.paginate(github.rest.pulls.list, { ...context.repo, state: 'open', per_page: 100 });
  let varnade = 0; let paminde = 0;
  for (const issue of issues) {
    if (issue.pull_request) continue;
    const etiketter = namnLista(issue);
    if (etiketter.some(e => AGARE.includes(e) || REDO.includes(e) || e === FEL)) {
      if ((await kontrolleraIssue(ctx, issue.number)) === 'varnade') varnade++;
    }
    const agare = etiketter.filter(e => AGARE.includes(e));
    if (!agare.length || new Date(issue.updated_at).getTime() > sedan) continue;
    const pr = pulls.find(p => new RegExp(`(^|[/-])issue-${issue.number}(-|$)`).test(p.head.ref) && new Date(p.updated_at).getTime() > sedan);
    if (pr) continue;
    await github.rest.issues.createComment({
      ...context.repo, issue_number: issue.number,
      body: `**Ingen har rört det här på ${PAMINN_DAGAR} dagar** och det har fortfarande ${agare.map(e => `\`${e}\``).join(', ')}. Ett \`pågår\` kräver en aktiv arbetare, ett pågående test eller en dokumenterad spärr (CLAUDE.md, regel 3 för flödet). Fortsätt, lämna en överlämningsrapport och sätt \`behöver hjälp\`, eller ta bort etiketten.${SIGNATUR}`,
    });
    paminde++;
  }
  core.info(`Dagligt etikettkontroll: ${varnade} varningar, ${paminde} påminnelser.`);
}

module.exports = { bedom, stangda, kontrolleraIssue, stadaEfterMerge, dagligKontroll, AGARE, REDO, STADA, FEL };
