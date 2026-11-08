# 11. Kostnader och villkor för de tjänster sidan lutar sig mot

**Status:** utkast 2026-11-08 (#918, DasKrokodil: "ja, kostnader och villkor ska dokumenteras"). Dokumentet säger **vilka tjänster** projektet använder, vad de gör för oss, vad som händer om de ändras och var villkoren ska läsas. **Jag har inte kunnat öppna leverantörernas villkorssidor** från min miljö, och jag skriver inga priser, gränser eller villkor ur minnet. Kolumnerna *Kostnad* och *Villkor kontrollerade* ska fyllas i av DasKrokodil eller i en session som når sidorna. Inga hemligheter, inloggningar eller kontonummer skrivs i repot.

## Tjänsterna

| Tjänst | Vad den gör för oss (belagt i repot) | Kostnad | Villkor kontrollerade |
|---|---|---|---|
| **Cloudflare Pages** | Publicerar historiagloben.se (gren `production`) och dev (gren `main`); kör formulärets serverfunktion; rollback via tidigare publiceringar ([DEPLOYMENT.md](../DEPLOYMENT.md)) | *Fyll i* | *Att göra:* Cloudflares sida om gränser för Pages och villkor för planen |
| **Cloudflare Access** | Skyddar förhandsadresserna (dev) | *Fyll i* | *Att göra* |
| **Cloudflare Turnstile** | Spamskydd i förslagsformuläret (avstängt i production enligt [feedback.md](../feedback.md)) | *Fyll i* | *Att göra* |
| **Domän historiagloben.se** | Adressen | *Fyll i* (pris per år, förnyelsedatum) | Registrator: *fyll i* |
| **GitHub** | Repo (publikt), issues, Actions (kontrollerna), rulesets, privat repo för förslag | *Fyll i* | *Att göra:* GitHubs villkor och Actions-gränser |
| **jsDelivr** | Levererar three.js 0.160.0 (exakt version, beslut 6) | *Fyll i* | *Att göra* |
| **Google Fonts** | Levererar typsnitten (IM Fell English, Instrument Sans, IBM Plex Mono; SIL OFL, [THIRD-PARTY-NOTICES.md](../../THIRD-PARTY-NOTICES.md)) | *Fyll i* | *Att göra* |
| **Ko-fi** | Länk "Stöd Historia Globen" sist i Hjälp (frivilligt stöd, beslut 2026-10-30) | Ko-fi:s egna villkor och avgifter: *Fyll i* | *Att göra* |

Playwright och wrangler används bara i kontrollerna (Actions), inte av sidan; sidan själv har inga andra externa beroenden än three.js och typsnitten.

## Om en tjänst ändrar villkor, pris eller försvinner

Det här är en **bedömning ur arkitekturen**, inte en utredning:

| Tjänst | Hur beroende är vi? | Möjlig väg |
|---|---|---|
| Cloudflare Pages | Måttligt: sidan är statiska filer utan byggsteg (`python3 -m http.server` räcker), men formulärets funktion och Access är Cloudflare-specifika | Annan värd för statiska filer; formuläret kan stängas av (det är avstängt i production). Tidigare övervägd värd: GitHub Pages ([DEPLOYMENT.md](../DEPLOYMENT.md)) |
| jsDelivr / three.js | Högt: utan three.js startar inte globen | three.js är MIT-licensierad; en egen kopia av exakt version 0.160.0 kan läggas i repot och CSP:n ändras. Testerna kan redan använda en lokal kopia (`THREE_LOCAL`). Hör ihop med idén om offline i klassrummet (#486) |
| Google Fonts | Lågt: typsnitt som används i rubriker och text | Typsnitten har öppen licens (OFL) och kan självhostas |
| GitHub | Högt: repot, issues, kontroller, arbetssättet | Git-historiken är kopierbar; arbetssättet (issues, etiketter, Actions) skulle behöva byggas om |
| Domänen | Högt för adressen | Förnyelse måste bevakas |

## Kostnader att hålla koll på

Tre frågor som inte kan besvaras ur repot och som DasKrokodil behöver fylla i:

1. Vad kostar domänen per år, och när förnyas den?
2. Kostar Cloudflare något idag (plan, tilläggstjänster), och vad händer om gränserna passeras?
3. Finns det några kostnader som går över ett kreditkort (verktyg, abonnemang) som projektet beror på?

## Att kontrollera vid uppdatering (varje release)

- [ ] Har en tjänst tillkommit eller tagits bort (nytt beroende kräver DasKrokodils ok)?
- [ ] Har en leverantör ändrat villkor eller pris? Skriv datum och vad.
- [ ] Är kolumnerna *Kostnad* och *Villkor kontrollerade* ifyllda, med datum?
