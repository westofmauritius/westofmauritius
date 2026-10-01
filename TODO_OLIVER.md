# Att göra för Oliver

Det här kan bara du göra (konton, nycklar, domäner, juridik). Allt i koden är
förberett: när en inställning saknas faller sajten tillbaka på ett säkert läge
i stället för att gå sönder. Punkterna står i den ordning de behövs för att gå
live.

## 0. Vilken gren som går live

Allt arbete ligger på grenen `claude/westmauritius-site-planning-eje8l5`.
Skapa en `main`-gren från den (eller slå ihop den via en pull request), gör
`main` till standardgren på GitHub och välj `main` som produktionsgren i
Cloudflare → westofmauritius → Settings → Build. Keystatic (punkt 9) sparar
ändringar i standardgrenen, så det är den Cloudflare ska bygga.

## 1. Cloudflare: byggvariabel för adressen

Cloudflare → Workers & Pages → westofmauritius → Settings → Build → Build
variables:

- `NEXT_PUBLIC_SITE_URL` = sajtens adress, t.ex.
  `https://westofmauritius.<ditt-subdomän>.workers.dev` nu och
  `https://westmauritius.mu` när domänen är kopplad.

Utan den pekar kanoniska adresser, hreflang och sitemap på `localhost`.

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

## 3. E-post (Resend, gratis upp till 3 000 mejl/månad)

1. Skapa konto på <https://resend.com>, skapa en API-nyckel.
2. Verifiera domänen `westmauritius.mu` i Resend (lägg in DNS-posterna de
   visar hos din domänleverantör).
3. Lägg till som Secrets i Cloudflare:
   - `RESEND_API_KEY`
   - `EMAIL_FROM` = t.ex. `West Mauritius <hello@westmauritius.mu>`
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

## 6. Koppla domänen och slå på indexering

1. Registrera `westmauritius.mu` (och gärna `ouestmaurice.mu`) om det inte
   är gjort.
2. Cloudflare → westofmauritius → Settings → Domains & Routes → Add →
   Custom domain: `westmauritius.mu` (och `www.westmauritius.mu`). Domänen
   behöver ligga som zon i ditt Cloudflare-konto.
3. Ändra `NEXT_PUBLIC_SITE_URL` (punkt 1) till `https://westmauritius.mu`.

Franskan ligger under `/fr/…` tills vidare. Hur den flyttas till
`ouestmaurice.mu` står i `src/i18n/routing.ts`.

### Indexering

Tills vidare blockerar sajten sökmotorer (robots.txt och `noindex`), så att
förhandsadressen på workers.dev inte hamnar i Google. När
`westmauritius.mu` är kopplad och `NEXT_PUBLIC_SITE_URL` pekar dit:

- Cloudflare → Build variables: `NEXT_PUBLIC_ALLOW_INDEXING` = `true`, och
  bygg om.
- Lägg till sajten i Google Search Console och skicka in
  `https://westmauritius.mu/sitemap.xml`.

## 7. Statistik (Umami Cloud, gratis)

1. Skapa ett konto på <https://cloud.umami.is> (gratisplanen räcker).
2. Lägg till webbplatsen `westmauritius.mu` och kopiera dess **Website ID**.
3. Cloudflare → Build variables: `NEXT_PUBLIC_UMAMI_WEBSITE_ID` = det ID:t,
   och bygg om.

Umami använder inga cookies, så ingen cookiebanner behövs. Konverteringar
syns under "Events": `lead-submitted` (med budget, tidshorisont och
källsida), `contact-submitted`, `newsletter-signup`, samt klick på
`cta-enquire` och `cta-live-in-the-west` med position.

## 8. Texter som bara du kan skriva

I Keystatic → Site:

- **About us**: sajtens historia och hur platser väljs ut.
- **Privacy policy, Cookies, Terms of use**: utkasten är skrivna utifrån hur
  sajten faktiskt fungerar. Fyll i allt inom hakparenteser (företagsnamn,
  adress, e-post, lagringstider, garantier vid överföring utanför EU) och
  låt en jurist granska. Bocka sedan ur "Placeholder" så att sidorna
  indexeras.

Allt övrigt platshållarinnehåll (orter, platser, guider, Bo i väst) är
markerat med "Placeholder" i Keystatic och visas med en tydlig etikett.

Byt ut dem i takt med att riktigt innehåll finns: skriv in fakta som du själv
har kontrollerat (öppettider, adresser, koordinater), bocka ur "Placeholder"
och lägg till egna foton eller foton med licens som verkligen visar
Mauritius. Hitta aldrig på recensioner, betyg eller priser.

## 9. Redigera innehåll direkt på sajten (valfritt)

Lokalt fungerar Keystatic redan (`npm run dev` → `/keystatic`). För att
redigera på den publicerade sajten behövs en GitHub-app. Stegen står i
[docs/content-editing.md](docs/content-editing.md) under "Option 2".

## Kontroll före lansering

- [ ] `main` byggs i Cloudflare (punkt 0)
- [ ] `NEXT_PUBLIC_SITE_URL` satt (punkt 1)
- [ ] Neon kopplad och `npm run db:migrate` körd (punkt 2)
- [ ] Resend verifierad och secrets satta (punkt 3); skicka ett testlead
      och kontrollera att mejlet kommer fram
- [ ] Samtyckestexter och juridiska sidor granskade (punkt 4 och 8)
- [ ] Inloggning på `/admin` fungerar (punkt 5)
- [ ] Domänen kopplad, sedan `NEXT_PUBLIC_ALLOW_INDEXING=true` (punkt 6)
- [ ] Umami-ID satt (punkt 7)
- [ ] Platshållarinnehåll ersatt eller avpublicerat (punkt 8)
