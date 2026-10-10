import { Link } from "react-router";

function LegalPage({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return <article>
    <header className="relative isolate overflow-hidden bg-navy-deep text-white">
      <div className="topo absolute inset-0 -z-10 text-white/[0.07]" aria-hidden="true" />
      <div className="mx-auto max-w-3xl px-5 pt-16 pb-14 md:pt-24 md:pb-20">
        <p className="label-mono text-white/45">Registar studenata i stipendija</p>
        <h1 className="mt-5 text-5xl leading-[1] font-semibold tracking-[-0.04em] sm:text-6xl">{title}</h1>
        <p className="mt-6 text-lg leading-8 text-white/70">{intro}</p>
      </div>
    </header>
    <div className="prose-registry mx-auto max-w-3xl px-5 py-12 text-[0.95rem] leading-7 text-muted-foreground md:py-16 [&>section]:border-b [&>section]:py-8 [&>section:first-child]:pt-0">{children}</div>
  </article>;
}

export function PrivacyPage() {
  return <LegalPage title="Politika privatnosti" intro="Ovdje je objašnjeno tko obrađuje podatke, zašto ih koristimo, koliko ih čuvamo i koja prava imate.">
    <section><h2>Voditelj obrade</h2><p>Voditelj obrade je Općina Tomislavgrad, Ulica Mijata Tomića 120, 80240 Tomislavgrad. Kontakt: <a href="mailto:opcina.tg@tel.net.ba">opcina.tg@tel.net.ba</a>, +387 34 356-400.</p></section>
    <section><h2>Svrha i pravna osnova</h2><p>Podatke obrađujemo radi vođenja ažurne evidencije studenata s područja Općine, upravljanja podacima o stipendijama, planiranja mjera podrške i ispunjavanja povezanih administrativnih obveza. Obrada se temelji na obavljanju poslova od javnog interesa i službenim ovlastima Općine; za neobavezne obavijesti traži se zasebna privola.</p></section>
    <section><h2>Koje podatke prikupljamo</h2><p>Račun i kontaktne podatke, adresu i naselje prebivališta, datum rođenja, podatke o srednjoj školi i studijima, status godišnje potvrde te zapise o stipendijama. Ne prikupljamo JMBG, broj osobne iskaznice ni skenirane dokumente kroz ovu verziju sustava.</p></section>
    <section><h2>Rokovi čuvanja</h2><p>Podaci aktivnog profila čuvaju se dok je račun aktivan i evidencija potrebna. Nakon deaktivacije ili posljednje akademske potvrde profil se preispituje, a u pravilu briše ili anonimizira najkasnije nakon pet godina, osim kada poseban propis ili neriješen upravni postupak zahtijeva dulje čuvanje. Audit zapisi i riješeni zahtjevi čuvaju se pet godina radi sigurnosti i dokazivanja postupanja.</p></section>
    <section><h2>Vaša prava</h2><p>Možete pregledati i ispraviti svoje podatke, preuzeti kopiju te zatražiti ispravak, izvoz, ograničenje ili brisanje kada su ispunjeni uvjeti. Neobaveznu privolu možete povući bez utjecaja na raniju zakonitu obradu. Zahtjeve šaljete iz odjeljka Privatnost nakon prijave ili putem kontakta Općine.</p></section>
    <section><h2>Sigurnost i pristup</h2><p>Pristup je ograničen prema ulozi. Lozinke se sigurno sažimaju, prijava je ograničena po broju pokušaja, a važne administratorske promjene bilježe se. Produkcijska usluga mora biti dostupna isključivo preko HTTPS-a.</p></section>
    <p className="mt-8 rounded-md bg-muted px-4 py-3 text-sm">Verzija politike: 2026-08-17. Ovaj tekst treba proći završnu pravnu provjeru službenika Općine prije produkcijske objave.</p>
  </LegalPage>;
}

export function TermsPage() {
  return <LegalPage title="Uvjeti korištenja" intro="Korištenjem registra obvezujete se unositi točne podatke i čuvati pristupne podatke svojeg računa.">
    <section><h2>Namjena sustava</h2><p>Sustav služi evidenciji studenata i stipendija. Nije portal za zapošljavanje, društvena mreža, komunikacijska platforma ni sustav za online prijave na stipendijske natječaje.</p></section>
    <section><h2>Korisnički račun</h2><p>Korisnik je odgovoran za točnost podataka i čuvanje lozinke. Račun se ne smije ustupati drugoj osobi. Zlouporaba ili ugrožavanje sigurnosti može dovesti do privremene deaktivacije.</p></section>
    <section><h2>Ažurnost podataka</h2><p>Korisnik može mijenjati profil i treba ga potvrditi za aktualnu akademsku godinu. Povijest prethodnih studija čuva se radi cjelovitosti evidencije.</p></section>
    <section><h2>Deaktivacija i brisanje</h2><p>Korisnik može deaktivirati račun ili poslati zahtjev za ograničenje i brisanje. Zahtjev se obrađuje u skladu s pravilima čuvanja i postojećim administrativnim obvezama.</p></section>
    <p className="mt-8 rounded-md bg-muted px-4 py-3 text-sm">Verzija uvjeta: 2026-08-17.</p>
  </LegalPage>;
}

export function ContactPage() {
  return <LegalPage title="Kontakt" intro="Za pitanja o registru, svojim podacima ili ostvarivanju prava obratite se Općini Tomislavgrad.">
    <section><h2>Općina Tomislavgrad</h2><p>Ulica Mijata Tomića 120<br />80240 Tomislavgrad<br />Telefon: <a href="tel:+38734356400">+387 34 356-400</a><br />E-mail: <a href="mailto:opcina.tg@tel.net.ba">opcina.tg@tel.net.ba</a><br />Radno vrijeme: 7:30 – 15:30</p></section>
    <p>Za tehnički problem navedite što ste pokušali napraviti i vrijeme pojave pogreške, ali e-mailom ne šaljite lozinku, JMBG, preslike dokumenata ni druge osjetljive podatke.</p>
    <p><Link to="/privacy">Pročitajte politiku privatnosti</Link></p>
  </LegalPage>;
}
