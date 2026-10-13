/**
 * AGB von Pageblitz (eine Marke von Schau und Horch, Christian Nießing).
 * Text und Fassung kommen aus shared/agb.ts — hier nur die Darstellung im
 * Stil von Impressum/Datenschutz.
 */

import React from "react";
import { Zap } from "lucide-react";
import { Link } from "wouter";
import {
  AGB_SECTIONS,
  AGB_STAND,
  AGB_VERSION,
  agbSectionNumber,
} from "@shared/agb";

export default function PageblitzAGB() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navbar */}
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold tracking-tight">Pageblitz</span>
          </Link>
          <Link href="/" className="text-sm text-white/40 hover:text-white/80 transition-colors">
            ← Zurück
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Allgemeine Geschäftsbedingungen</h1>
        <p className="text-white/40 text-sm mb-12">
          Fassung {AGB_VERSION} · Stand: {AGB_STAND}
        </p>

        <div className="space-y-10 text-white/80 leading-relaxed">
          {AGB_SECTIONS.map((section, i) => (
            <section key={section.id} id={section.id} aria-labelledby={`agb-${section.id}`}>
              <h2
                id={`agb-${section.id}`}
                className="text-lg font-semibold text-white mb-3 pb-2 border-b border-white/10"
              >
                {agbSectionNumber(i)} {section.title}
              </h2>
              {section.paragraphs.length > 1 ? (
                <ol className="space-y-2 list-none">
                  {section.paragraphs.map((p, j) => (
                    <li key={j}>
                      <span className="text-white/50">({j + 1})</span> {p}
                    </li>
                  ))}
                </ol>
              ) : (
                <p>{section.paragraphs[0]}</p>
              )}
            </section>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/30">
          <span>© 2026 Pageblitz – eine Marke von Schau und Horch</span>
          <div className="flex gap-6">
            <Link href="/impressum" className="hover:text-white/80 transition-colors">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-white/80 transition-colors">Datenschutz</Link>
            <span className="text-white/60">AGB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
