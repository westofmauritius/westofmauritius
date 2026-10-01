# Att göra för Oliver

Det här kan bara du göra (konton, nycklar, domäner, juridik). Allt i koden är
förberett: när en inställning saknas faller sajten tillbaka på ett säkert läge
i stället för att gå sönder. Punkterna står i den ordning de behövs för att gå
live.

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
