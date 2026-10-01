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
