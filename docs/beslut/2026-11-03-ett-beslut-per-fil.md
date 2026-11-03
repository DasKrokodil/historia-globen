# Ett beslut per fil

**Datum:** 2026-11-03

## Beslut
Varje nytt beslut skrivs som en egen fil, `docs/beslut/ÅÅÅÅ-MM-DD-kortnamn.md`, i samma pull request som ändringen. Den gamla loggen `docs/beslut.md` är fryst. Instruktionerna i CLAUDE.md, AGENTS.md och `.orchestra/project.md` är uppdaterade.

## Varför
Alla pull requests la sin beslutsrad sist i samma fil och fick därför en konflikt varje gång en annan pull request slogs ihop. Det kostade onödiga omgångar och tokens.

## Berör
`docs/beslut.md`, `docs/beslut/README.md`, CLAUDE.md, AGENTS.md, `.orchestra/project.md`, `.orchestra/context-map.md`, README.md och `docs/README.md`.
