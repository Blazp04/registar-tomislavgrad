# Produkcijska i sigurnosna kontrolna lista

## Prije objave

- Završiti pravnu provjeru politike privatnosti, voditelja obrade, pravne osnove i rokova čuvanja.
- Postaviti jedinstven `BETTER_AUTH_SECRET` od najmanje 32 slučajna znaka i čuvati ga u upravljanom secret storeu.
- Postaviti `BETTER_AUTH_URL`, `PUBLIC_APP_URL` i `CORS_ORIGINS` samo na produkcijske HTTPS adrese.
- Konfigurirati SMTP i provjeriti potvrdu e-maila, obnovu lozinke i sprječavanje otkrivanja postoji li račun.
- Pokrenuti migracije i početne šifrarnike prije aplikacije; administratorske račune kreirati pojedinačno.
- Migraciju `0002_registry_v1.sql` prvo probno izvršiti na kopiji baze. Ona relevantne stare studentske podatke prenosi u novu strukturu, uklanja stare komunikacijske tablice/polja izvan opsega i zato zahtijeva potvrđenu sigurnosnu kopiju.
- Stari javno uneseni studenti prenose se kao deaktivirani računi. Nakon provjere identiteta administrator ih aktivira, a korisnik postavlja lozinku kroz tok **Zaboravljena lozinka**; postojeća lozinka se ne migrira niti generira.
- Produkcijskom DB korisniku dati samo potrebne ovlasti. Razvojni i analitički računi ne smiju imati pristup produkcijskim osobnim podacima.

## Mreža i aplikacija

- TLS završiti na pouzdanom reverse proxyju/load balanceru i prema backendu proslijediti `X-Forwarded-Proto: https`.
- Ne objavljivati PostgreSQL na javnom internetu. Ograničiti ulaz po mreži i TLS certifikatu.
- Zadržati sigurnosna zaglavlja iz Nginx konfiguracije, `HttpOnly`/`Secure` sesijske kolačiće, provjeru izvora mutacijskih zahtjeva i globalni rate limit.
- API dokumentaciju po potrebi ograničiti internom mrežom u produkciji.
- Ne zapisivati tijela zahtjeva, lozinke, tokene ili cjelovite osobne profile u aplikacijske logove.

## Sigurnosne kopije i oporavak

- Uključiti dnevne automatske sigurnosne kopije i point-in-time recovery na upravljanoj PostgreSQL usluzi.
- Čuvanje kopija odvojiti od primarne baze, šifrirati ih i ograničiti pristup.
- Najmanje tromjesečno testirati obnovu na izoliranoj okolini i zapisati RPO/RTO rezultat.
- Prije svake migracije koja mijenja ili uklanja podatke potvrditi aktualnu kopiju i plan povratka.

## Operativni procesi

- Mjesečno pregledati neažurirane/nepotvrđene profile, otvorene GDPR zahtjeve, audit zapise i korisničke prijedloge šifrarnika.
- Najmanje tromjesečno pregledati administratorske račune i deaktivirati nepotrebne.
- Kandidati za brisanje/anonimizaciju identificiraju se nakon pet godina neaktivnosti ili zadnje potvrde, ali se brišu tek nakon provjere posebnih propisa i otvorenih postupaka.
- Audit zapisi i riješeni zahtjevi čuvaju se pet godina prema početnoj politici; promjena roka mora biti verzionirana i pravno odobrena.
- Redovito pokretati `npm audit`, nadogradnje ovisnosti, testove, backend/frontend build i provjeru migracija.

## Incident

- Onemogućiti kompromitirani račun/sesije, sačuvati audit i infrastrukturne dokaze te utvrditi opseg bez širenja pristupa podacima.
- Aktivirati internu proceduru prijave povrede podataka i uključiti odgovornu osobu za zaštitu podataka.
- Nakon sanacije rotirati tajne, provjeriti sigurnosne kopije i dokumentirati korektivne mjere.
