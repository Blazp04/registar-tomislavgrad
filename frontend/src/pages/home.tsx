import { ArrowRightIcon, CheckCircle2Icon, FileCheck2Icon, GraduationCapIcon, LockKeyholeIcon, UserRoundCheckIcon } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

const steps = [
  { icon: UserRoundCheckIcon, number: "01", title: "Kreirajte račun", text: "Unesite samo ime, prezime i e-mail te potvrdite adresu." },
  { icon: GraduationCapIcon, number: "02", title: "Dopunite profil", text: "Osobne i obrazovne podatke spremate u kratkim, jasnim koracima." },
  { icon: FileCheck2Icon, number: "03", title: "Održavajte podatke ažurnima", text: "Jednom godišnje potvrdite profil i pregledajte evidentirane stipendije." },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-[linear-gradient(135deg,#f8e9e6_0%,#f4f1ec_100%)] lg:block" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-18 md:py-24 lg:grid-cols-[1.2fr_.8fr] lg:px-8 lg:py-30">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary"><LockKeyholeIcon className="h-3.5 w-3.5" /> Sigurna usluga Općine Tomislavgrad</div>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl lg:text-6xl">Vaši podaci o studiranju, uredno evidentirani i pod vašom kontrolom.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Registar omogućuje studentima s područja Općine Tomislavgrad jednostavno održavanje profila i pregled stipendija, a Općini pouzdane podatke za planiranje podrške studentima.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg"><Link to="/register">Registriraj se <ArrowRightIcon /></Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/login">Prijavi se</Link></Button>
            </div>
            <p className="mt-5 text-sm text-slate-500">Registracija traje nekoliko minuta. Ostale podatke unosite nakon prijave.</p>
          </div>
          <div className="relative mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,.12)] lg:mr-0">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-medium uppercase tracking-widest text-slate-500">Studentski profil</p><p className="mt-1 text-xl font-semibold">Sve važno na jednom mjestu</p></div>
              <img src="/grb-tomislavgrad.png" alt="" className="h-13 w-auto" />
            </div>
            <div className="mt-7 rounded-2xl bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between text-sm"><span>Dovršenost profila</span><span className="font-semibold">75%</span></div>
              <div className="mt-3 h-2 rounded-full bg-white/20"><div className="h-2 w-3/4 rounded-full bg-[#efaaa0]" /></div>
              <p className="mt-4 text-xs leading-5 text-slate-300">Još samo podaci o trenutačnom studiju.</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border p-4"><p className="text-xs text-slate-500">Status podataka</p><p className="mt-1 text-sm font-semibold">Potrebna potvrda</p></div>
              <div className="rounded-2xl border p-4"><p className="text-xs text-slate-500">Stipendije</p><p className="mt-1 text-sm font-semibold">2 zapisa</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="kako-radi" className="scroll-mt-24 py-18 md:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl"><p className="text-sm font-semibold text-primary">Kako sustav funkcionira</p><h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Tri jasna koraka, bez dugog obrasca</h2></div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map(({ icon: Icon, number, title, text }) => (
              <article key={number} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between"><div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/8 text-primary"><Icon className="h-5 w-5" /></div><span className="text-sm font-semibold text-slate-300">{number}</span></div>
                <h3 className="mt-6 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="tko-se-moze-registrirati" className="scroll-mt-24 border-y border-slate-200 bg-white py-18 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <div><p className="text-sm font-semibold text-primary">Tko se može registrirati</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Studenti s područja Općine Tomislavgrad</h2><p className="mt-5 leading-7 text-slate-600">Račun mogu otvoriti osobe s prebivalištem na području Općine Tomislavgrad koje trenutačno studiraju ili žele evidentirati završeni ili prekinuti studij. Profil podržava više studija kroz vrijeme.</p></div>
          <div className="space-y-4">
            {["Evidencija srednjoškolskog i visokoškolskog obrazovanja", "Više zapisa studija i potpuna povijest", "Pregled stipendija po akademskim godinama", "Samostalno ažuriranje i godišnja potvrda podataka"].map((item) => <div key={item} className="flex gap-3 rounded-xl bg-[#fbfaf8] p-4 text-sm"><CheckCircle2Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />{item}</div>)}
          </div>
        </div>
      </section>

      <section className="py-18 md:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="rounded-3xl bg-slate-950 px-6 py-10 text-white md:px-10 lg:flex lg:items-center lg:justify-between">
            <div className="max-w-2xl"><div className="flex items-center gap-2 text-sm font-semibold text-[#efaaa0]"><LockKeyholeIcon className="h-4 w-4" /> Zaštita podataka je dio sustava</div><h2 className="mt-3 text-2xl font-semibold md:text-3xl">Prikupljamo samo podatke potrebne za evidenciju i stipendije.</h2><p className="mt-4 text-sm leading-6 text-slate-300">Ne tražimo JMBG, broj osobne iskaznice ni skenirane dokumente. U svakom trenutku možete pregledati podatke, zatražiti izvoz, ispravak, ograničenje ili brisanje.</p></div>
            <Button asChild variant="secondary" className="mt-6 lg:mt-0"><Link to="/privacy">Pročitaj politiku privatnosti</Link></Button>
          </div>
        </div>
      </section>

      <section id="cesta-pitanja" className="scroll-mt-24 border-t border-slate-200 bg-white py-18 md:py-24">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight">Česta pitanja</h2>
          <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
            {[
              ["Moram li sve podatke unijeti pri registraciji?", "Ne. Pri registraciji unosite samo ime, prezime, e-mail i lozinku. Profil dopunjavate nakon prijave, korak po korak."],
              ["Mogu li evidentirati više studija?", "Da. Možete sačuvati prethodne studije i dodati novi, trenutačni studij."],
              ["Mogu li se prijaviti na stipendijski natječaj kroz sustav?", "Ne. Prva verzija služi evidenciji i pregledu stipendija, bez online prijava na natječaje."],
              ["Kako mogu ispraviti ili izvesti svoje podatke?", "Profil možete sami ažurirati, a u odjeljku Privatnost možete preuzeti podatke ili poslati službeni zahtjev."],
            ].map(([question, answer]) => <details key={question} className="group py-5"><summary className="cursor-pointer list-none pr-8 font-medium">{question}</summary><p className="mt-3 text-sm leading-6 text-slate-600">{answer}</p></details>)}
          </div>
        </div>
      </section>
    </>
  );
}
