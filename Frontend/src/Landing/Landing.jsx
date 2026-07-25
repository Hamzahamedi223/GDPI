import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardList,
  Mail,
  MapPin,
  Menu,
  Monitor,
  Phone,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Solution", href: "#solution" },
    { name: "Pilotage", href: "#operations" },
    { name: "Contact", href: "#contact" },
  ];

  const handleScroll = (event, href) => {
    event.preventDefault();
    const element = document.getElementById(href.replace("#", ""));
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f8f4] text-[#172018]">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-[#d7ddcf] bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#22351f] text-white shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">GDPI Command</p>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#708066]">Asset control</p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(event) => handleScroll(event, link.href)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-[#4c5948] transition hover:bg-[#eef1e8] hover:text-[#22351f]"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/auth/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-[#22351f] hover:bg-[#eef1e8]">
              Se connecter
            </Link>
            <Link to="/auth/signup" className="rounded-lg bg-[#22351f] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#314a2d]">
              Demarrer
            </Link>
          </div>

          <button
            className="rounded-lg p-2 text-[#22351f] hover:bg-[#eef1e8] lg:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="Menu"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-[#d7ddcf] bg-white lg:hidden"
            >
              <div className="space-y-2 px-4 py-4">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(event) => handleScroll(event, link.href)}
                    className="block rounded-lg px-4 py-3 text-sm font-semibold text-[#4c5948] hover:bg-[#eef1e8]"
                  >
                    {link.name}
                  </a>
                ))}
                <Link to="/auth/login" className="block rounded-lg px-4 py-3 text-sm font-semibold text-[#22351f] hover:bg-[#eef1e8]">
                  Se connecter
                </Link>
                <Link to="/auth/signup" className="block rounded-lg bg-[#22351f] px-4 py-3 text-center text-sm font-semibold text-white">
                  Demarrer
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main>
        <section className="relative overflow-hidden pt-20">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(34,53,31,0.08),transparent_42%),linear-gradient(0deg,rgba(255,255,255,0.6),transparent)]" />
          <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c5cfbd] bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-[#5d6b55]">
                <Activity className="h-4 w-4 text-[#6f7f35]" />
                Parc informatique sous controle
              </div>
              <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-tight text-[#172018] sm:text-6xl lg:text-7xl">
                Commandez votre infrastructure avec precision.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#4c5948]">
                Une plateforme professionnelle pour suivre les equipements, services, pannes, utilisateurs et demandes avec une interface claire, robuste et prete pour les operations quotidiennes.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/auth/login" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#22351f] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#314a2d]">
                  Acceder au tableau de bord
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#solution" onClick={(event) => handleScroll(event, "#solution")} className="inline-flex items-center justify-center rounded-lg border border-[#b8c3ae] bg-white px-6 py-3 text-sm font-bold text-[#22351f] transition hover:bg-[#eef1e8]">
                  Voir la solution
                </a>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.12, duration: 0.6 }} className="relative">
              <div className="overflow-hidden rounded-2xl border border-[#c5cfbd] bg-white shadow-2xl shadow-[#22351f]/10">
                <div className="flex items-center justify-between border-b border-[#dfe5d8] bg-[#22351f] px-5 py-4 text-white">
                  <div>
                    <p className="text-sm font-bold">Centre operations</p>
                    <p className="text-xs text-white/65">Vue temps reel</p>
                  </div>
                  <span className="rounded-full bg-[#d8e7ca] px-3 py-1 text-xs font-bold text-[#22351f]">Actif</span>
                </div>
                <div className="grid gap-4 p-5">
                  {[
                    ["Equipements", "160", Monitor],
                    ["Pannes ouvertes", "24", Wrench],
                    ["Utilisateurs", "80", ShieldCheck],
                    ["Services", "8", Building2],
                  ].map(([label, value, Icon]) => (
                    <div key={label} className="flex items-center justify-between rounded-xl border border-[#dfe5d8] bg-[#fafbf8] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#e7eddf] text-[#22351f]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-semibold text-[#3d4938]">{label}</span>
                      </div>
                      <span className="text-2xl font-black text-[#22351f]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="solution" className="scroll-mt-24 bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#6f7f35]">Solution</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight text-[#172018]">Une interface faite pour decider vite.</h2>
              <p className="mt-4 text-[#5b6656]">Tout est organise pour les equipes qui consultent, comparent, affectent et resolvent des incidents plusieurs fois par jour.</p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {[
                [ClipboardList, "Inventaire discipline", "Materiel, fournisseurs, modeles et services restent lisibles dans un meme systeme."],
                [BarChart3, "Pilotage clair", "Statistiques, couts, garanties et activites recentes sont visibles au premier regard."],
                [ShieldCheck, "Controle des acces", "Roles, services et profils utilisateurs structurent l'exploitation sans confusion."],
              ].map(([Icon, title, text]) => (
                <div key={title} className="rounded-xl border border-[#dfe5d8] bg-[#fafbf8] p-6">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-[#22351f] text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-black text-[#172018]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#5b6656]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="operations" className="scroll-mt-24 bg-[#22351f] py-24 text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
            {[
              ["99%", "Visibilite parc"],
              ["24/7", "Suivi incidents"],
              ["8", "Services geres"],
              ["1", "Source de verite"],
            ].map(([number, label]) => (
              <div key={label} className="border-l border-white/20 pl-5">
                <p className="text-5xl font-black text-[#d8e7ca]">{number}</p>
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="scroll-mt-24 bg-[#f7f8f4] py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#6f7f35]">Contact</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight">Parlons de votre parc.</h2>
              <p className="mt-4 text-[#5b6656]">Une presentation courte suffit pour voir comment votre dashboard peut servir les equipes techniques et administratives.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <ContactItem icon={Mail} title="Email" value="support@gdpi.local" />
              <ContactItem icon={Phone} title="Telephone" value="+216 88 888 888" />
              <ContactItem icon={MapPin} title="Adresse" value="Mahdia, Tunisia" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#d7ddcf] bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-4 text-sm text-[#5b6656] sm:px-6 md:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} GDPI Command. Tous droits reserves.</p>
          <p className="font-semibold text-[#22351f]">Military green theme for professional operations.</p>
        </div>
      </footer>
    </div>
  );
};

const ContactItem = ({ icon: Icon, title, value }) => (
  <div className="rounded-xl border border-[#dfe5d8] bg-white p-5">
    <Icon className="h-6 w-6 text-[#6f7f35]" />
    <p className="mt-4 text-sm font-black text-[#172018]">{title}</p>
    <p className="mt-1 text-sm text-[#5b6656]">{value}</p>
  </div>
);

export default Landing;
