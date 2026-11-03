# Beslut: en fil per beslut

Sedan 2026-11-03 skrivs varje beslut som en **egen fil** här, så att pull requests inte krockar i en gemensam logg. De äldre besluten finns kvar i [../beslut.md](../beslut.md), som är fryst.

## Så här skriver du ett beslut

- **Filnamn:** `ÅÅÅÅ-MM-DD-kortnamn.md`, till exempel `2026-11-04-mobilmeny.md`. Datumet är dagen då beslutet fattades, och kortnamnet är små bokstäver med bindestreck. Om två beslut får samma namn samma dag, lägg till issuenumret: `2026-11-04-mobilmeny-530.md`.
- **Innehåll:** högst en halv sida, på svenska, med tre rubriker:

```markdown
# Kort rubrik (#issue)

**Datum:** 2026-11-04

## Beslut
Vad som bestämdes, i en eller två meningar.

## Varför
Kort motivering.

## Berör
Filer, issues och beslut det hänger ihop med.
```

- **Samma pull request** som ändringen lägger till filen. Lägg inte till något i `../beslut.md`.
- **Ändrar du ett tidigare beslut:** skriv ett nytt beslut som säger vilket det ersätter. Redigera inte gamla filer.
- **Läs** `docs/beslut/` och den frysta `docs/beslut.md` innan du ändrar arkitektur, datamodell, källor, licenser, kategorier eller utseende.
