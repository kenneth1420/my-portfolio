"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Download, FileText, Mail, Phone, MapPin, Send } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { site } from "@/src/data/site";

const contactLinks = [
  {
    icon: Mail,
    label: "Email",
    value: site.email,
    href: `mailto:${site.email}`,
  },
  {
    icon: Phone,
    label: "Phone",
    value: site.phone,
    href: site.phoneHref,
  },
  {
    icon: FaLinkedin,
    label: "LinkedIn",
    value: "kenneth-lariosa-dev",
    href: site.linkedin,
  },
  {
    icon: MapPin,
    label: "Location",
    value: site.location.label,
    href: "#",
  },
];

export default function Contact() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target
              .querySelectorAll(".section-reveal")
              .forEach((el) => el.classList.add("visible"));
          }
        });
      },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="contact" ref={ref} className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="section-reveal mb-16">
          <p className="text-gold font-mono text-sm tracking-widest mb-3">
            05. CONTACT
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-text">
            Let&apos;s Talk
          </h2>
          <p className="text-text-dim mt-4 max-w-lg">
            Open to new opportunities, collaborations, or just a good
            conversation about tech. Reach out anytime.
          </p>

          {/* Availability + resume CTA */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-subtle border border-border text-gold text-xs font-mono tracking-wider">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Available for opportunities
            </span>
            <a
              href={site.resumePath}
              download
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gold text-ink font-semibold text-sm hover:bg-gold-light transition-colors duration-200 shadow-lg shadow-gold/20"
            >
              <Download size={14} />
              Download Resume
            </a>
            <Link
              href="/resume"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-gold/40 text-gold font-medium text-sm hover:bg-gold/10 transition-colors duration-200"
            >
              <FileText size={14} />
              View Resume
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact cards */}
          <div className="section-reveal grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contactLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  item.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="hover-card bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-subtle border border-border flex items-center justify-center group-hover:border-gold/40 transition-colors">
                  <item.icon size={16} className="text-gold" />
                </div>
                <div>
                  <p className="text-muted text-xs font-mono mb-0.5">
                    {item.label}
                  </p>
                  <p className="text-text-dim text-sm truncate">{item.value}</p>
                </div>
              </a>
            ))}
          </div>

          {/* Message form */}
          <div className="section-reveal bg-card border border-border rounded-2xl p-8">
            <h3 className="font-display text-xl font-semibold text-text mb-6">
              Send a Message
            </h3>
            <form
              action="mailto:kennethlariosa14@gmail.com"
              method="get"
              className="space-y-4"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted text-xs font-mono mb-2">
                    NAME
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your name"
                    className="w-full bg-subtle border border-border rounded-xl px-4 py-3 text-text text-sm placeholder-muted focus:outline-none focus:border-gold/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-muted text-xs font-mono mb-2">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    className="w-full bg-subtle border border-border rounded-xl px-4 py-3 text-text text-sm placeholder-muted focus:outline-none focus:border-gold/50 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-muted text-xs font-mono mb-2">
                  MESSAGE
                </label>
                <textarea
                  name="body"
                  rows={4}
                  placeholder="Tell me about your project..."
                  className="w-full bg-subtle border border-border rounded-xl px-4 py-3 text-text text-sm placeholder-muted focus:outline-none focus:border-gold/50 transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gold text-ink font-semibold text-sm hover:bg-gold-light transition-colors duration-200 shadow-lg shadow-gold/20"
              >
                <Send size={15} />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
