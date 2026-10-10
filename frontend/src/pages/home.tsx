import { ArrowRightIcon, CheckIcon, PlusIcon } from "lucide-react";
import { Link } from "react-router";
import { BrandMark, Stamp } from "@/components/brand";
import { Button } from "@/components/ui/button";

const facts = [
  { title: "Jedan račun", text: "za cijeli obrazovni put" },
  { title: "Više studija", text: "bez brisanja prethodnih" },
  { title: "Godišnja potvrda", text: "za pouzdane podatke" },
];

const profileData = [
  "Adresa, naselje i kontakt telefon",
  "Završena srednja škola i smjer",
  "Fakultet, studijski program i grad",
  "Godina, način i status studija",
];

const audiences = [
  { title: "Trenutačni studij", text: "Evidentirajte studij koji upravo pohađate." },
  { title: "Završen studij", text: "Završeni studiji ostaju dio vašeg obrazovnog puta." },
  { title: "Prekinut studij", text: "I prekinuti studij može se evidentirati u profilu." },
];

const questions = [
  {
    question: "Tko može otvoriti račun?",
    answer: "Sadašnji i bivši studenti s prebivalištem na području Općine Tomislavgrad. U profil se može evidentirati trenutačni, završeni ili prekinuti studij.",
  },
  {
    question: "Moram li cijeli profil dovršiti odmah?",
    answer: "Ne. Račun otvarate s osnovnim podacima, a profil dopunjavate nakon prijave. Svaka cjelina sprema se zasebno pa možete nastaviti kasnije.",
  },
  {
    question: "Mogu li evidentirati više studija?",
    answer: "Da. Prethodni studiji ostaju sačuvani, a svaki novi studij dodajete kao zaseban zapis i po potrebi označite kao trenutačni.",
  },
  {
    question: "Mogu li se ovdje prijaviti na stipendijski natječaj?",
    answer: "Ne. Registar trenutačno služi evidenciji studenata i pregledu stipendija koje je administracija već zabilježila.",
  },
];

/* Small, static fragments of the real interface, shown instead of illustrations. */

function Field({ label, value, caret = false }: { label: string; value: string; caret?: boolean }) {
  return (
    <div>
      <p className="text-[0.7rem] font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 flex h-8 items-center rounded-md border bg-card px-2.5 text-[0.8rem]">
        {value}
        {caret && <span className="ml-px h-3.5 w-px animate-pulse bg-foreground" />}
      </div>
    </div>
  );
}

function SignupFragment() {
  return (
    <div className="w-full max-w-64 space-y-3 rounded-lg border bg-card p-4 shadow-elevated">
      <Field label="Ime i prezime" value="Ana Marić" />
      <Field label="E-mail" value="ana.maric@email.com" caret />
      <div className="grid h-8 place-items-center rounded-md bg-primary text-[0.8rem] font-medium text-primary-foreground">Otvori račun</div>
    </div>
  );
}

function EducationFragment() {
  return (
    <div className="w-full max-w-72 rounded-lg border bg-card p-4 shadow-elevated">
      <ol className="relative space-y-4 before:absolute before:top-2 before:bottom-10 before:left-[5px] before:w-px before:bg-border">
        <li className="relative pl-6">
          <span className="absolute top-1.5 left-0 size-[11px] rounded-full border-2 border-muted-foreground/40 bg-card" />
          <p className="text-[0.8rem] font-medium">Gimnazija Marka Marulića</p>
          <p className="text-[0.7rem] text-muted-foreground">Tomislavgrad · 2020. – 2024.</p>
        </li>
        <li className="relative pl-6">
          <span className="absolute top-1.5 left-0 size-[11px] rounded-full bg-primary ring-4 ring-primary/15" />
          <p className="flex items-center gap-2 text-[0.8rem] font-medium">Ekonomski fakultet <span className="rounded bg-primary px-1 py-px text-[0.6rem] text-primary-foreground">Trenutačni</span></p>
          <p className="text-[0.7rem] text-muted-foreground">Mostar · 2. godina</p>
        </li>
        <li className="flex items-center gap-2 rounded-md border border-dashed px-2.5 py-1.5 text-[0.7rem] text-muted-foreground">
          <PlusIcon className="size-3" /> Dodaj studij
        </li>
      </ol>
    </div>
  );
}

function ConfirmFragment() {
  return (
    <div className="w-full max-w-64">
      <div className="space-y-3 rounded-lg border bg-card p-4 shadow-elevated">
        <div>
          <p className="text-[0.7rem] font-medium text-muted-foreground">Akademska godina</p>
          <p className="mt-0.5 font-mono text-[0.85rem] font-medium">2026/2027</p>
        </div>
        <div className="flex items-center gap-2 rounded-md border px-2.5 py-2 text-[0.75rem]">
          <span className="grid size-3.5 place-items-center rounded-[3px] bg-primary text-primary-foreground"><CheckIcon className="size-2.5" strokeWidth={3} /></span>
          Podaci su točni i aktualni
        </div>
        <div className="grid h-8 place-items-center rounded-md bg-navy text-[0.8rem] font-medium text-white">Potvrdi podatke</div>
      </div>
    </div>
  );
}

const steps = [
  { title: "Otvorite svoj račun", text: "Za početak su dovoljni ime, prezime, e-mail i lozinka. Profil možete nastaviti uređivati kada vam odgovara.", fragment: <SignupFragment /> },
  { title: "Dodajte obrazovanje", text: "Evidentirajte srednju školu te sadašnje i prethodne studije. Svaki zapis ostaje dio vašeg obrazovnog puta.", fragment: <EducationFragment /> },
  { title: "Potvrdite podatke", text: "Jednom godišnje provjerite profil kako bi Općina imala pouzdanu osnovu za planiranje studentske podrške.", fragment: <ConfirmFragment /> },
];

export default function HomePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy-deep text-white">
        <img src="/teren-hero.svg" alt="" aria-hidden="true" className="topo-drift pointer-events-none absolute inset-0 -z-10 size-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-navy-deep/70 lg:hidden" aria-hidden="true" />

        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="label-mono flex items-center justify-between border-b border-white/10 py-4 text-white/40">
            <span>Općina Tomislavgrad</span>
            <span className="hidden sm:inline">Duvanjsko polje · 43°43′ N 17°14′ E</span>
          </div>

          <div className="max-w-4xl pt-20 pb-24 md:pt-28 md:pb-32 lg:pt-32 lg:pb-40">
            <h1 className="landing-reveal text-[clamp(3rem,8.2vw,7.25rem)] leading-[0.92] font-semibold tracking-[-0.045em]">
              Vaše studiranje, <span className="block text-brand-bright">na jednom mjestu.</span>
            </h1>
            <p className="landing-reveal landing-delay-1 mt-8 max-w-xl text-lg leading-8 text-white/70">
              Evidentirajte svoj obrazovni put, održavajte podatke ažurnima i pregledajte stipendije koje je Općina zabilježila — kroz jedan jasan profil.
            </p>
            <div className="landing-reveal landing-delay-2 mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Button asChild size="lg" className="h-12 px-6 text-base">
                <Link to="/register">Otvorite račun <ArrowRightIcon /></Link>
              </Button>
              <Link to="/login" className="group text-sm text-white/70 transition-colors hover:text-white">
                Već imate račun? <span className="font-medium text-white underline decoration-white/30 underline-offset-4 group-hover:decoration-white">Prijavite se</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute right-8 bottom-32 hidden items-center gap-3 text-white/45 xl:flex" aria-hidden="true">
          <svg width="44" height="6" className="text-brand-bright"><line x1="1" y1="3" x2="43" y2="3" stroke="currentColor" strokeWidth="1.6" strokeDasharray="1 6" strokeLinecap="round" /></svg>
          <span className="label-mono">Rub Duvanjskog polja</span>
        </div>

        <div className="border-t border-white/10 bg-navy-deep/80 backdrop-blur-sm">
          <dl className="mx-auto grid max-w-7xl px-5 sm:grid-cols-3 sm:px-8">
            {facts.map((fact, index) => (
              <div key={fact.title} className={`py-6 sm:px-6 sm:first:pl-0 ${index > 0 ? "border-t border-white/10 sm:border-t-0 sm:border-l" : ""}`}>
                <dt className="text-sm font-medium">{fact.title}</dt>
                <dd className="mt-0.5 text-sm text-white/55">{fact.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="kako-radi" className="scroll-mt-16 bg-card py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <h2 className="text-4xl leading-[1.02] font-semibold tracking-[-0.035em] sm:text-5xl md:text-6xl lg:col-span-7">Kratki koraci. Profil koji ostaje s vama.</h2>
            <p className="text-base leading-7 text-muted-foreground lg:col-span-4 lg:col-start-9">Ne morate ispunjavati jedan dugi obrazac. Svaki dio spremate zasebno i vraćate mu se kada želite.</p>
          </div>

          <ol className="mt-16 grid gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="flex flex-col bg-card">
                <div className="flex h-72 items-center justify-center border-b bg-surface px-8 select-none" aria-hidden="true">{step.fragment}</div>
                <div className="p-6 sm:p-8">
                  <p className="font-mono text-xs text-muted-foreground">0{index + 1}</p>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="sto-trebate" className="scroll-mt-16 border-y bg-background py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="text-4xl leading-[1.02] font-semibold tracking-[-0.035em] sm:text-5xl">Za račun malo. Za profil — ono što već znate.</h2>
            <p className="mt-6 text-base leading-7 text-muted-foreground">Pri otvaranju računa trebate samo ime i prezime, e-mail adresu i sigurnu lozinku. Ostalo dopunjavate nakon prijave.</p>
            <p className="mt-8 flex items-start gap-3 border-l-2 border-primary pl-4 text-sm leading-6">Ne prilažete osobne dokumente, potvrde ni druge datoteke.</p>
          </div>

          <div className="relative lg:col-span-6 lg:col-start-7">
            <div className="rounded-lg border bg-card shadow-elevated">
              <div className="flex items-center justify-between gap-4 border-b px-6 py-4">
                <div className="flex items-center gap-3">
                  <BrandMark className="h-8" />
                  <div className="leading-tight">
                    <p className="text-sm font-semibold">Općina Tomislavgrad</p>
                    <p className="text-xs text-muted-foreground">Registar studenata i stipendija</p>
                  </div>
                </div>
                <p className="label-mono hidden text-muted-foreground sm:block">Podaci za profil</p>
              </div>
              <ol className="px-6">
                {profileData.map((item, index) => (
                  <li key={item} className="flex items-end gap-4 border-b border-dashed py-5 last:border-0">
                    <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                    <span className="text-[0.95rem]">{item}</span>
                  </li>
                ))}
              </ol>
              <div className="label-mono border-t bg-surface px-6 py-3.5 text-muted-foreground">
                Prilozi: <span className="text-foreground">nisu potrebni</span>
              </div>
            </div>
            <Stamp className="pointer-events-none absolute -right-3 -bottom-16 size-36 rotate-[-12deg] opacity-85 sm:-right-10" />
          </div>
        </div>
      </section>

      <section id="tko-se-moze-registrirati" className="scroll-mt-16 bg-card py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <h2 className="max-w-5xl text-[clamp(2.5rem,6.2vw,5.5rem)] leading-[0.98] font-semibold tracking-[-0.04em]">
            Sadašnji studenti. Bivši studenti. <span className="text-primary">Jedna zajednička slika.</span>
          </h2>
          <div className="mt-16 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-lg leading-8">Račun mogu otvoriti studenti s prebivalištem na području Općine Tomislavgrad — bez obzira je li njihov studij trenutačan, završen ili prekinut.</p>
              <p className="mt-5 text-sm leading-7 text-muted-foreground">Ažurni podaci pomažu Općini bolje razumjeti gdje i što mladi studiraju te kvalitetnije planirati stipendije i druge oblike podrške.</p>
              <Link to="/register" className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary">
                Provjerite svoj profil <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <ul className="border-t lg:col-span-6 lg:col-start-7">
              {audiences.map((item) => (
                <li key={item.title} className="grid gap-1 border-b py-5 sm:grid-cols-[12rem_1fr] sm:gap-6">
                  <span className="font-medium">{item.title}</span>
                  <span className="text-sm leading-6 text-muted-foreground">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="cesta-pitanja" className="scroll-mt-16 border-t bg-background py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="text-4xl leading-[1.02] font-semibold tracking-[-0.035em] sm:text-5xl">Najčešća pitanja</h2>
            <p className="mt-5 max-w-sm text-base leading-7 text-muted-foreground">Za dodatne informacije javite se Općini.</p>
            <a href="mailto:opcina.tg@tel.net.ba" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">opcina.tg@tel.net.ba <ArrowRightIcon className="size-4" /></a>
          </div>
          <div className="border-t lg:col-span-7 lg:col-start-6">
            {questions.map(({ question, answer }) => (
              <details key={question} className="group border-b">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-medium tracking-tight marker:content-none [&::-webkit-details-marker]:hidden">
                  {question}
                  <PlusIcon className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45 group-open:text-primary" />
                </summary>
                <p className="max-w-2xl pb-6 text-[0.95rem] leading-7 text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-primary text-white">
        <div className="topo absolute inset-0 -z-10 text-white/[0.16]" aria-hidden="true" />
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-24 sm:px-8 md:py-32 lg:grid-cols-12 lg:items-end">
          <h2 className="text-[clamp(2.5rem,5.4vw,5rem)] leading-[0.98] font-semibold tracking-[-0.04em] lg:col-span-8">
            Otvorite račun danas. <span className="block text-white/60">Profil dovršite svojim tempom.</span>
          </h2>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-4 lg:col-span-4 lg:justify-end">
            <Button asChild size="lg" className="h-12 bg-white px-6 text-base text-primary shadow-none hover:bg-white/90">
              <Link to="/register">Započnite registraciju <ArrowRightIcon /></Link>
            </Button>
            <Link to="/login" className="text-sm font-medium text-white/80 underline decoration-white/30 underline-offset-4 hover:text-white">Prijava</Link>
          </div>
        </div>
      </section>
    </>
  );
}
