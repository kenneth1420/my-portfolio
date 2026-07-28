"use client";

import { useState, useEffect } from "react";
import { FileText, Menu, X } from "lucide-react";
import { site } from "@/src/data/site";

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "/resume", label: "Resume" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${"bg-white/10 dark:bg-black/20 backdrop-blur-md border-b border-border/50"}`}
    >
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#"
          className="font-display text-xl font-semibold tracking-wide"
        >
          <span className="text-gold-gradient">KL</span>
          <span className="text-text-dim font-light ml-1 text-sm font-body">
            &nbsp;/&nbsp;dev
          </span>
        </a>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-text-dim hover:text-gold transition-colors duration-200 text-sm font-medium tracking-wide"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={site.resumePath}
            download
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold text-ink text-sm font-semibold hover:bg-gold-light transition-all duration-200 shadow-lg shadow-gold/20"
          >
            <FileText size={14} />
            Resume
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-gold/40 text-gold text-sm font-medium hover:bg-gold/10 transition-all duration-200"
          >
            Hire Me
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-text-dim hover:text-gold transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-b border-border/50 px-6 py-4">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-text-dim hover:text-gold transition-colors text-sm font-medium"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="flex flex-wrap gap-3 pt-1">
              <a
                href={site.resumePath}
                download
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold text-ink text-sm font-semibold hover:bg-gold-light transition-all duration-200"
              >
                <FileText size={14} />
                Resume
              </a>
              <a
                href="#contact"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-gold/40 text-gold text-sm font-medium hover:bg-gold/10 transition-all duration-200"
              >
                Hire Me
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
