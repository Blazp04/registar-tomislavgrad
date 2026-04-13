# Registar Tomislavgrad

## Problem
Općina Tomislavgrad nema centralizirani sustav za evidenciju bivših i trenutnih studenata iz općine. Podaci se prikupljaju ručno i teško je generirati izvještaje ili komunicirati sa studentima.

## Users
- **Primary**: Radnici općine (admin) — pregledavaju, filtriraju i upravljaju podacima studenata, šalju SMS poruke
- **Secondary**: Studenti (public) — unose svoje podatke putem javnog obrasca

## Core Features
| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 1 | Registracija studenata | Prikupljanje podataka: ime, prezime, ime oca, adresa, telefon, status studenta, zaposlenost, fakultet, struka, rad u struci | Must-have |
| 2 | Šifrarnici (fakulteti, struke) | Preddefinirane liste s opcijom "Drugo" koja automatski dodaje u šifrarnik | Must-have |
| 3 | Admin dashboard sa statistikama | Grafikoni i brojevi o studentima, zaposlenosti, fakultetima | Must-have |
| 4 | Filtriranje i pretraga studenata | Filtriranje po struci, fakultetu, statusu zaposlenosti, statusu studenta | Must-have |
| 5 | SMS poruke (template) | Bulk slanje SMS poruka studentima s template varijablama (ime, prezime) | Must-have |
| 6 | Generiranje izvještaja | Export podataka o studentima prema filterima | P1 |

## In Scope
- Public obrazac za unos podataka studenata
- Admin panel za pregled, filtriranje, uređivanje studenata
- Dashboard sa statistikama (grafikoni)
- Šifrarnici za fakultete i struke (s opcijom "Drugo")
- SMS template poruke (print u konzolu, bez API integracije)
- Email/password autentifikacija za admin

## Out of Scope
- Stvarno slanje SMS-a (samo ispis u konzolu)
- Plaćanje / pretplate
- Javni pregled registra
- Mobilna aplikacija
- Notifikacije emailom

## Domain Context
- Aplikacija za općinu Tomislavgrad (BiH)
- Jezik sučelja: hrvatski
- Studenti mogu biti trenutni ili bivši
- Zaposlenost i rad u struci su ključni pokazatelji
