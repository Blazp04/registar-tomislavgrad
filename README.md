# Registar studenata i stipendija Općine Tomislavgrad

Web sustav za evidenciju studentskih profila, povijesti obrazovanja i stipendija po akademskim godinama. Funkcionalni izvor istine je dokument `project-planning/smjernice_za_razvoj_registra_studenata_i_stipendija.docx`.

## Sadržaj prve verzije

- javna landing stranica, registracija, potvrda e-maila, prijava i obnova lozinke
- studentski dashboard i profil koji se sprema po koracima
- više zapisa studija kroz vrijeme i godišnja potvrda ažurnosti
- studentski pregled stipendija
- administrativno pretraživanje, preporučeni filtri i CSV izvoz
- osnovna statistika, šifrarnici i provjera korisničkih prijedloga
- privole, zahtjevi za ispravak/izvoz/ograničenje/brisanje i audit zapisi
- odvojene studentske i administratorske ovlasti

Sustav namjerno ne sadrži portal za poslove, chat, račune poslodavaca, mobilnu aplikaciju, online prijave na stipendijske natječaje ni vanjske sveučilišne integracije.

## Lokalno pokretanje

Preduvjeti: Node.js 22+, PostgreSQL i npm.

1. Kopirajte `backend/.env.example` u `backend/.env` i postavite sigurne vrijednosti.
2. U backendu pokrenite:

   ```bash
   npm ci
   npm run db:migrate
   npm run db:seed
   npm run dev
   ```

3. Za prvi administratorski račun postavite `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_FIRST_NAME` i `ADMIN_LAST_NAME`, zatim pokrenite `npm run admin:create` u backendu. Lozinka mora imati najmanje 12 znakova.
4. U frontendu pokrenite:

   ```bash
   npm ci
   npm run dev
   ```

Frontend je na `http://localhost:5173`, backend na `http://localhost:3000`, a API dokumentacija na `http://localhost:3000/docs`.

## Provjere

```bash
cd backend && npm test && npm run build && npm run db:check
cd frontend && npm run lint && npm run build
```

## Dokumentacija

- [Korisničke upute](docs/korisnicke-upute.md)
- [Produkcijska i sigurnosna kontrolna lista](docs/produkcija-i-sigurnost.md)
- [API dokumentacija](http://localhost:3000/docs) nakon pokretanja backenda

Prije produkcijske objave tekst politike privatnosti, pravna osnova i konačni rokovi čuvanja trebaju biti odobreni od odgovorne osobe Općine.
