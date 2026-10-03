# Att göra för Olivier

Det här kan bara du göra (konton, nycklar, domäner, juridik). Allt i koden är
förberett: när en inställning saknas faller sajten tillbaka på ett säkert läge
i stället för att gå sönder. Punkterna står i den ordning de behövs för att gå
live.

## 0. Vilken gren som går live ✅ klart

`main` är standardgren på GitHub och produktionsgren i Cloudflare. Allt som
hamnar i `main` byggs och publiceras. Keystatic (punkt 9) sparar ändringar
i `main`.

## 1. Adressen (SITE_URL) ✅ inget att göra just nu

Produktionsadressen `https://westofmauritius.mu` är förinställd i koden
(`src/lib/site.ts`). Den styr kanoniska adresser, sitemap, Open Graph,
strukturerad data och länkar i mejl. Bara om adressen någon gång ändras:
Cloudflare → westofmauritius → Settings → Build → Build variables →
`SITE_URL` = den nya adressen, och bygg om.

## 2. Databas för leads (Neon, gratis)

1. Skapa ett konto på <https://neon.tech> och ett projekt (region: Frankfurt
   ligger närmast Mauritius och Europa).
2. Kopiera "connection string" (börjar med `postgres://`).
3. Skapa tabellerna en gång, från din dator i projektmappen:
   `DATABASE_URL="postgres://…" npm run db:migrate`
4. Cloudflare → westofmauritius → Settings → Variables and secrets → lägg
   till `DATABASE_URL` som **Secret**.

Utan databasen svarar formulären på den publicerade sajten "tillfälligt
otillgängligt" i stället för att tappa leads.

### Nya tabeller (oktober 2026)

Kör `DATABASE_URL="postgres://…" npm run db:migrate` en gång till efter
den här uppdateringen. Den lägger till tabellen för WhatsApp-gruppen och
kolumnen "source" för nyhetsbrevet. Säker att köra flera gånger.

## 3. E-post (Resend, gratis upp till 3 000 mejl/månad)

1. Skapa konto på <https://resend.com>, skapa en API-nyckel.
2. Verifiera avsändardomänen `westofmauritius.mu` i Resend: Domains → Add
   domain → lägg in DNS-posterna de visar (SPF, DKIM och gärna DMARC) i
   Cloudflare → westofmauritius.mu → DNS. Vänta tills Resend visar
   "Verified".
3. Lägg till som Secrets i Cloudflare:
   - `RESEND_API_KEY`
   - `EMAIL_FROM` = `West of Mauritius <hello@westofmauritius.mu>`
   - `LEAD_NOTIFY_EMAIL` = adressen där du vill få nya leads
   - `IP_HASH_SALT` = en lång slumpmässig sträng (t.ex. från
     `openssl rand -hex 32`)

## 4. Juridisk granskning av samtyckestexterna

Samtyckestexten för leads (i `src/lib/forms/consent.ts`) säger uttryckligen
att uppgifterna delas med byggherrar och mäklare. Låt en jurist granska
texten mot GDPR och Mauritius Data Protection Act 2017 innan lansering. Om
texten ändras: lägg till en ny version i filen i stället för att ändra den
gamla, så att varje sparat lead visar exakt vad personen godkände.

## 5. Adminsidan (/admin)

Lägg till som Secrets i Cloudflare:

- `ADMIN_PASSWORD` = ett långt, unikt lösenord (minst 16 tecken).
- `ADMIN_SESSION_SECRET` = en slumpmässig sträng på minst 32 tecken (t.ex.
  `openssl rand -hex 32`). Byter du den loggas alla ut.

Logga sedan in på `https://<din-sajt>/admin`. Där ser och filtrerar du leads,
kontaktmeddelanden och nyhetsbrevsprenumeranter, och exporterar till CSV.
Utan dessa två inställningar är adminsidan avstängd.

## 6. Domänen westofmauritius.mu i DNS

1. Registrera `westofmauritius.mu` om det inte är gjort, och lägg den som zon
   i ditt Cloudflare-konto (Add a site → följ instruktionerna för att byta
   namnservrar hos registraren).
2. Cloudflare → Workers & Pages → westofmauritius → Settings → Domains &
   Routes → Add → Custom domain: `westofmauritius.mu`, och en till för
   `www.westofmauritius.mu` (den skickas automatiskt vidare till adressen
   utan www).
3. Om du äger den gamla domänen `westmauritius.mu`: koppla den på samma sätt
   som Custom domain. Sajten skickar då alla besök vidare (301) till
   `westofmauritius.mu`, så gamla länkar fortsätter fungera.
4. Avsändardomänen för mejl: se punkt 3 (Resend).

### Indexering sköter sig själv

Sajten släpper bara in sökmotorer på `westofmauritius.mu`. Alla andra
adresser (förhandsadressen på workers.dev) får automatiskt `noindex` och en
robots.txt som stänger allt, oavsett hur bygget gjordes. Du behöver alltså
inte ändra något vid lansering. Vill du stänga allt tillfälligt: Build
variable `SEARCH_INDEXING` = `off`, och bygg om.

När domänen fungerar: lägg till den i Google Search Console (domänegendom,
verifiera med en DNS-post i Cloudflare) och skicka in
`https://westofmauritius.mu/sitemap.xml`.

## 7. Statistik (Umami Cloud, gratis)

1. Skapa ett konto på <https://cloud.umami.is> (gratisplanen räcker).
2. Lägg till webbplatsen `westofmauritius.mu` och kopiera dess **Website ID**.
3. Cloudflare → Build variables: `NEXT_PUBLIC_UMAMI_WEBSITE_ID` = det ID:t,
   och bygg om.

Fler händelser sedan oktober 2026: `whatsapp-interest`,
`cta-community`, `cta-quiz` och `quiz-complete` (vilken ort quizet
föreslog). Alla formulär skickar med vilken sida de kom från
("source"). I adminsidan finns också **Conversions by page** som räknar
förfrågningar, prenumeranter och WhatsApp-intresse per sida.

Umami använder inga cookies, så ingen cookiebanner behövs. Konverteringar
syns under "Events": `lead-submitted` (med budget, tidshorisont och
källsida), `contact-submitted`, `newsletter-signup`, samt klick på
`cta-enquire` och `cta-living-in-the-west` med position.

## 7b. WhatsApp-gruppen

Sidan `/en/community` samlar intresseanmälningar till en WhatsApp-grupp för
västkusten. Skapa gruppen (gärna som WhatsApp Community med
administratörsgodkännande) när några har anmält sig. I adminsidan →
"WhatsApp group" finns listan med en länk som öppnar en chatt med varje
person. Bjud bara in dem som finns i listan; de har godkänt att andra
medlemmar ser deras nummer. Ta bort personer som ber om det.

## 8. Texter som bara du kan skriva

I Keystatic → Site:

- **Author (Olivier)**: sidan `/en/about/olivier` är nu riktig och syns i
  Google, med en kort bio som bara säger det vi vet (att du är mauritier
  och står bakom sajten) och hur sajten arbetar. Gör den personlig: lägg
  till ett porträtt, din egen historia (var du kommer ifrån, din koppling
  till västkusten) och länkar till dina profiler.
- **About us**: sidan är nu riktig — den beskriver vad sajten täcker, hur
  fakta kontrolleras, hur utvalda platser och partnerlänkar märks och vad som
  händer med förfrågningar. Lägg gärna till din egen historia (vem som står
  bakom sajten och varför).
- **Privacy policy, Cookies, Terms of use**: utkasten är skrivna utifrån hur
  sajten faktiskt fungerar. Fyll i allt inom hakparenteser (företagsnamn,
  adress, e-post, lagringstider, garantier vid överföring utanför EU) och
  låt en jurist granska. Bocka sedan ur "Placeholder" så att sidorna
  indexeras.

### "Living in …" på varje ortssida

Varje ort (Keystatic → Areas → välj ort → "Living here") har nu en sektion
för den som funderar på att flytta dit: kort svar, vardagsliv, för- och
nackdelar, kostnadstabell, skolor, vård, pendling och vanliga frågor. Allt
är platshållare. Fyll i med det du vet och kan belägga:

- **Kostnader**: fyll bara i ett belopp när du har en källa. Ange datum
  ("Checked on") och källa med länk på varje rad. Tomma rader visar "Not
  confirmed yet".
- **Skolor och vård**: nämn bara ställen du har kontrollerat, med länk.
- **Frågorna** är riktiga sökfrågor. Skriv svaren, 2 till 3 meningar.
- Bocka sedan ur "Placeholder" i sektionen. Då blir frågorna FAQ-data i
  Google.

### Läs igenom det riktiga innehållet

Orterna, 19 offentliga platser (stränder, natur, sevärdheter) och sju
guider (stränder, solnedgångar, saker att göra, en dag i Chamarel, vandring,
en dag i Le Morne och en praktisk reseguide) har nu
riktiga texter på engelska och franska. Fakta är kontrollerade mot
Wikipedia och koordinaterna mot OpenStreetMap, men läs igenom dem med dina
egna ögon innan lansering — du känner västkusten bäst. Inga öppettider,
priser eller omdömen är påhittade.

Fotona kommer från Wikimedia Commons med fri licens (CC0, CC BY, CC BY-SA).
Fotograf och licens visas på varje bild och länkar till källan. Ta inte
bort de uppgifterna. Byt gärna till egna foton med tiden.

### Det som fortfarande är platshållare

Ingenting på den engelska sajten är längre platshållare. Det som återstår
är sådant bara du kan göra:

- **Restauranger och butiker**: de påhittade exemplen är borttagna. Det
  finns nu en riktig matguide (vad man äter, utan att nämna ställen) och en
  shoppingguide (köpcentrumen enligt OpenStreetMap). Lägg till riktiga
  restauranger du själv har ätit på, som platser i Keystatic.
- **Franska**: all ny text sedan oktober finns bara på engelska. Bygget
  stoppar om franskan slås på innan texterna är översatta.
- **Juridiska sidor**: fyll i företagsuppgifter och låt en jurist granska.

Hitta aldrig på recensioner, betyg eller priser.

## 8b. Slå på franska (när de franska texterna är klara)

Franska versionen finns redan men är dold: ingen språkväxlare, inga franska
sidor i sitemap och franska sidor har `noindex`. När texterna är genomlästa:
Cloudflare → Build variables → `NEXT_PUBLIC_FRENCH_PUBLISHED` = `true`, och
bygg om. Allt annat slås på automatiskt.

## 9. Redigera innehåll direkt på sajten (valfritt)

Lokalt fungerar Keystatic redan (`npm run dev` → `/keystatic`). För att
redigera på den publicerade sajten behövs en GitHub-app. Stegen står i
[docs/content-editing.md](docs/content-editing.md) under "Option 2".

## Kontroll före lansering

- [x] `main` byggs i Cloudflare (punkt 0)
- [ ] Neon kopplad och `npm run db:migrate` körd (punkt 2)
- [ ] Resend verifierad och secrets satta (punkt 3); skicka ett testlead
      och kontrollera att mejlet kommer fram
- [ ] Samtyckestexter och juridiska sidor granskade (punkt 4 och 8)
- [ ] Inloggning på `/admin` fungerar (punkt 5)
- [ ] `westofmauritius.mu` kopplad i Cloudflare, Search Console och sitemap (punkt 6)
- [ ] Avsändardomänen verifierad i Resend (punkt 3)
- [ ] Umami-ID satt (punkt 7)
- [ ] Riktiga texter genomlästa, platshållare ersatta eller raderade (punkt 8)
- [ ] `npm run db:migrate` körd igen efter oktoberuppdateringen (WhatsApp-tabellen)
- [ ] Författarsidan ifylld med bio och foto, "Placeholder" urbockad (punkt 8)
- [ ] "Living in …" på orterna och frågesidorna ifyllda med källor (punkt 8)
- [ ] WhatsApp-gruppen skapad när det finns intresse (punkt 7b)
- [ ] Franska påslagen när texterna är klara (punkt 8b), inte före
