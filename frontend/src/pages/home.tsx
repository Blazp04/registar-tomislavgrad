import {
  ArrowRightIcon,
  CheckIcon,
  Clock3Icon,
  FileCheck2Icon,
  GraduationCapIcon,
  ShieldCheckIcon,
  UserRoundCheckIcon,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    icon: UserRoundCheckIcon,
    title: "Otvorite svoj račun",
    text: "Za početak su dovoljni ime, prezime, e-mail i lozinka. Profil možete nastaviti uređivati kada vam odgovara.",
  },
  {
    number: "02",
    icon: GraduationCapIcon,
    title: "Dodajte obrazovanje",
    text: "Evidentirajte srednju školu te sadašnje i prethodne studije. Svaki zapis ostaje dio vašeg obrazovnog puta.",
  },
  {
    number: "03",
    icon: FileCheck2Icon,
    title: "Potvrdite podatke",
    text: "Jednom godišnje provjerite profil kako bi Općina imala pouzdanu osnovu za planiranje studentske podrške.",
  },
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

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#f1eee6]">
        <div className="absolute inset-x-0 top-0 h-px bg-[#102d3d]/20" aria-hidden="true" />
        <div className="absolute -left-24 top-36 h-48 w-48 rounded-full border border-[#102d3d]/10" aria-hidden="true" />
        <div className="absolute -left-8 top-52 h-20 w-20 rounded-full border border-[#102d3d]/10" aria-hidden="true" />

        <div className="mx-auto flex min-h-[calc(100svh-4.5rem)] max-w-[90rem] items-center px-5 py-14 sm:px-8 md:py-20 lg:px-12 xl:px-16">
          <div className="relative z-10 max-w-5xl">
            <p className="landing-reveal flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#a12825]">
              <span className="h-px w-8 bg-[#a12825]" /> Digitalna usluga Općine Tomislavgrad
            </p>

            <h1 className="landing-reveal landing-delay-1 mt-7 max-w-4xl text-[clamp(3.6rem,7.7vw,7.4rem)] font-semibold leading-[0.83] tracking-[-0.072em] text-[#102d3d]">
              Vaše studiranje,
              <span className="mt-3 block font-display font-normal italic tracking-[-0.045em] text-[#b72e2a]">na jednom mjestu.</span>
            </h1>

            <p className="landing-reveal landing-delay-2 mt-8 max-w-xl text-base leading-7 text-[#52636c] sm:text-lg sm:leading-8">
              Evidentirajte svoj obrazovni put, održavajte podatke ažurnima i pregledajte stipendije koje je Općina zabilježila - kroz jedan jasan profil.
            </p>

            <div className="landing-reveal landing-delay-3 mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-13 rounded-none bg-[#b72e2a] px-6 text-white shadow-none hover:bg-[#982320]">
                <Link to="/register">Otvorite račun <ArrowRightIcon /></Link>
              </Button>
              <Link to="/login" className="group inline-flex items-center gap-2 text-sm font-semibold text-[#102d3d]">
                Već imate račun? Prijavite se
                <span className="h-px w-6 bg-[#102d3d] transition-[width] group-hover:w-10" aria-hidden="true" />
              </Link>
            </div>

            <div className="landing-reveal landing-delay-3 mt-11 grid max-w-xl gap-3 border-t border-[#bcc4c2] pt-5 text-sm text-[#52636c] sm:grid-cols-2">
              <span className="flex items-center gap-2"><Clock3Icon className="h-4 w-4 text-[#a12825]" /> Račun za nekoliko minuta</span>
              <span className="flex items-center gap-2"><GraduationCapIcon className="h-4 w-4 text-[#a12825]" /> Za sadašnje i bivše studente</span>
            </div>
          </div>

        </div>

        <div className="bg-[#102d3d] text-white">
          <div className="mx-auto grid max-w-[90rem] divide-y divide-white/12 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8 lg:px-12 xl:px-16">
            <div className="flex gap-4 py-6 sm:px-5 sm:first:pl-0">
              <span className="font-display text-3xl text-[#d9b55b]">01</span>
              <p className="text-sm leading-6 text-white/68"><strong className="block font-semibold text-white">Jedan račun</strong> za cijeli obrazovni put</p>
            </div>
            <div className="flex gap-4 py-6 sm:px-5">
              <span className="font-display text-3xl text-[#d9b55b]">02</span>
              <p className="text-sm leading-6 text-white/68"><strong className="block font-semibold text-white">Više studija</strong> bez brisanja prethodnih</p>
            </div>
            <div className="flex gap-4 py-6 sm:px-5 sm:last:pr-0">
              <span className="font-display text-3xl text-[#d9b55b]">03</span>
              <p className="text-sm leading-6 text-white/68"><strong className="block font-semibold text-white">Godišnja potvrda</strong> za pouzdane podatke</p>
            </div>
          </div>
        </div>
      </section>

      <section id="kako-radi" className="scroll-mt-24 bg-[#fbfaf6] py-20 md:py-30">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-end">
            <p className="section-kicker">Kako funkcionira</p>
            <div>
              <h2 className="max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-[#102d3d] sm:text-5xl md:text-6xl">
                Kratki koraci. Profil koji ostaje s vama.
              </h2>
              <p className="mt-5 max-w-2xl leading-7 text-[#607079]">Ne morate ispunjavati jedan dugi obrazac. Svaki dio spremate zasebno i vraćate mu se kada želite.</p>
            </div>
          </div>

          <ol className="mt-14 grid border-y border-[#cfd2cc] md:grid-cols-3 md:divide-x md:divide-[#cfd2cc]">
            {steps.map(({ number, icon: Icon, title, text }, index) => (
              <li key={number} className={`group relative py-8 md:min-h-[25rem] md:px-8 md:py-9 ${index > 0 ? "border-t border-[#cfd2cc] md:border-t-0" : ""}`}>
                <div className="flex items-start justify-between">
                  <span className="font-display text-5xl text-[#b72e2a]">{number}</span>
                  <span className="grid h-12 w-12 place-items-center border border-[#bcc5c7] text-[#102d3d] transition-colors group-hover:border-[#d9b55b] group-hover:bg-[#d9b55b]">
                    <Icon className="h-5 w-5" strokeWidth={1.7} />
                  </span>
                </div>
                <div className="mt-16 md:mt-24">
                  <h3 className="text-xl font-semibold tracking-[-0.025em] text-[#102d3d]">{title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[#64737a]">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="sto-trebate" className="scroll-mt-24 bg-[#dfe8e8] py-20 md:py-28">
        <div className="mx-auto grid max-w-[90rem] gap-10 px-5 sm:px-8 lg:grid-cols-[.92fr_1.08fr] lg:gap-0 lg:px-12 xl:px-16">
          <div className="bg-[#b72e2a] p-7 text-white sm:p-10 lg:p-14">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white/65">Što trebate pripremiti</p>
            <h2 className="mt-8 max-w-xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-5xl">
              Za račun malo. Za profil - ono što već znate.
            </h2>
            <div className="mt-12 border-t border-white/25 pt-6">
              <p className="text-sm font-semibold">Pri otvaranju računa</p>
              <p className="mt-2 text-sm leading-7 text-white/72">Ime i prezime, e-mail adresa i sigurna lozinka. Ostalo dopunjavate nakon prijave.</p>
            </div>
          </div>

          <div className="bg-[#102d3d] p-7 text-white sm:p-10 lg:p-14">
            <div className="flex items-center gap-3 text-[#d9b55b]">
              <ShieldCheckIcon className="h-5 w-5" />
              <p className="text-sm font-semibold">Podaci za vaš profil</p>
            </div>
            <ul className="mt-8 divide-y divide-white/15 border-y border-white/15">
              {[
                "Adresa, naselje i kontakt telefon",
                "Završena srednja škola i smjer",
                "Fakultet, studijski program i grad",
                "Godina, način i status studija",
              ].map((item, index) => (
                <li key={item} className="grid grid-cols-[2rem_1fr] gap-4 py-4 text-sm leading-6 text-white/75">
                  <span className="font-display text-lg text-[#d9b55b]">0{index + 1}</span>{item}
                </li>
              ))}
            </ul>
            <p className="mt-6 flex items-start gap-3 text-xs leading-6 text-white/52">
              <CheckIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-[#d9b55b]" />
              Ne prilažete osobne dokumente, potvrde ni druge datoteke.
            </p>
          </div>
        </div>
      </section>

      <section id="tko-se-moze-registrirati" className="scroll-mt-24 overflow-hidden bg-[#fbfaf6] py-20 md:py-30">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
            <div>
              <p className="section-kicker">Kome registar služi</p>
              <h2 className="mt-7 max-w-4xl text-[clamp(2.8rem,6vw,6.2rem)] font-semibold leading-[0.9] tracking-[-0.065em] text-[#102d3d]">
                Sadašnji studenti. Bivši studenti. <span className="font-display font-normal italic text-[#b72e2a]">Jedna zajednička slika.</span>
              </h2>
            </div>
            <div className="border-l-2 border-[#d9b55b] pl-7 sm:pl-9">
              <p className="text-lg leading-8 text-[#53666f]">Račun mogu otvoriti studenti s prebivalištem na području Općine Tomislavgrad - bez obzira je li njihov studij trenutačan, završen ili prekinut.</p>
              <p className="mt-7 text-sm leading-7 text-[#69777d]">Ažurni podaci pomažu Općini bolje razumjeti gdje i što mladi studiraju te kvalitetnije planirati stipendije i druge oblike podrške.</p>
              <Button asChild variant="outline" className="mt-9 h-12 rounded-none border-[#102d3d] bg-transparent px-5 text-[#102d3d] hover:bg-[#102d3d] hover:text-white">
                <Link to="/register">Provjerite svoj profil <ArrowRightIcon /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="cesta-pitanja" className="scroll-mt-24 border-t border-[#d8d8d1] bg-[#f1eee6] py-20 md:py-28">
        <div className="mx-auto grid max-w-[90rem] gap-12 px-5 sm:px-8 lg:grid-cols-[.72fr_1.28fr] lg:px-12 xl:px-16">
          <div>
            <p className="section-kicker">Prije registracije</p>
            <h2 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-[#102d3d] sm:text-5xl">Najčešća pitanja</h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-[#65747b]">Za dodatne informacije možete nam se javiti putem kontakt podataka na dnu stranice.</p>
          </div>
          <div className="border-t border-[#bdc4c2]">
            {questions.map(({ question, answer }, index) => (
              <details key={question} className="group border-b border-[#bdc4c2] py-6">
                <summary className="flex cursor-pointer list-none items-center gap-4 text-base font-semibold tracking-[-0.02em] text-[#102d3d] marker:content-none sm:text-lg">
                  <span className="font-display text-2xl font-normal text-[#b72e2a]">0{index + 1}</span>
                  <span className="flex-1">{question}</span>
                  <span className="relative h-8 w-8 shrink-0 border border-[#9fa9aa] transition-colors group-open:bg-[#102d3d]" aria-hidden="true">
                    <span className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 bg-current group-open:text-white" />
                    <span className="absolute left-1/2 top-1/2 h-3 w-px -translate-y-1/2 bg-current transition-transform group-open:rotate-90 group-open:text-white" />
                  </span>
                </summary>
                <p className="max-w-2xl pb-1 pt-4 pl-12 text-sm leading-7 text-[#65747b]">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#d9b55b]">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-8 px-5 py-14 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12 xl:px-16">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#102d3d]/60">Vaš prvi korak</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#102d3d] sm:text-4xl">Otvorite račun danas. Profil dovršite svojim tempom.</h2>
          </div>
          <Button asChild size="lg" className="h-13 shrink-0 rounded-none bg-[#102d3d] px-6 text-white hover:bg-[#071e2a]">
            <Link to="/register">Započnite registraciju <ArrowRightIcon /></Link>
          </Button>
        </div>
      </section>
    </>
  );
}
