"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { site } from "@/src/data/site";
import { useCopyEmail } from "@/src/hook/use.copy.email.hook";
import ContactForm from "./contact/ContactForm";
import SectionHeading from "../ui/SectionHeading";
import { Reveal, Stagger, StaggerItem } from "../ui/Reveal";

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
    icon: FaGithub,
    label: "GitHub",
    value: "kenneth1420",
    href: site.github,
  },
  {
    icon: MapPin,
    label: "Location",
    value: site.location.label,
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      site.location.label,
    )}`,
  },
];

const copyLabel = {
  idle: "Copy email",
  copied: "Copied",
  failed: "Copy blocked — use the Email link",
} as const;

export default function Contact() {
  const { handleCopyEmail, copyStatus } = useCopyEmail();

  return (
    <section
      id="contact"
      className="py-32 px-6"
      style={{
        // A pool of sky light under the closing line, painted as part of the
        // section's own background so the last screen of the page has the
        // same glow as the first without an extra positioned layer.
        backgroundImage:
          "radial-gradient(48rem 26rem at 50% 12rem, color-mix(in oklab, var(--primary) 11%, transparent), transparent 70%)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Closing statement — the ask, made once, after the work. */}
        <Reveal className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-subtle/80 backdrop-blur border border-border text-primary text-xs font-mono tracking-wider">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Available for new work
          </span>
        </Reveal>

        <SectionHeading
          index="05"
          eyebrow="Contact"
          title="Got something"
          accent="to build?"
          align="center"
        >
          <p className="text-text-dim mt-6 max-w-lg mx-auto">
            Hiring for a full-stack role, or need a web or mobile app built?
            Write to me by email, phone, or the form below.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#contact-form"
              className="btn-shine group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-ink font-semibold hover:bg-primary-light transition-colors duration-200 shadow-xl shadow-primary/25"
            >
              Write to me
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
            <button
              type="button"
              onClick={handleCopyEmail}
              className={`inline-flex items-center gap-2 px-6 py-4 rounded-full border text-sm font-medium transition-colors duration-200 ${
                copyStatus === "failed"
                  ? "border-red-400/50 text-red-500 dark:text-red-400"
                  : "border-primary/40 text-primary hover:bg-primary/10"
              }`}
            >
              {copyStatus === "copied" ? <Check size={15} /> : <Copy size={15} />}
              <span aria-live="polite">{copyLabel[copyStatus]}</span>
            </button>
            <a
              href={site.resumePath}
              download
              className="inline-flex items-center gap-2 px-6 py-4 rounded-full text-text-dim text-sm font-medium hover:text-primary transition-colors duration-200"
            >
              <Download size={15} />
              Resume
            </a>
          </div>
        </SectionHeading>

        <div className="mt-24 grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-12 lg:gap-16 items-start">
          {/* Direct lines, as a ruled list: quicker to scan than a row of tiles. */}
          <Stagger className="border-t border-border">
            {contactLinks.map((item, i) => (
              <StaggerItem key={item.label} index={i}>
                <a
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    item.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="group flex items-center gap-5 py-6 border-b border-border"
                >
                  <span className="w-11 h-11 shrink-0 rounded-2xl bg-subtle border border-border flex items-center justify-center text-primary transition-colors duration-300 group-hover:border-primary/40 group-hover:bg-primary/10">
                    <item.icon size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-muted text-[11px] font-mono uppercase tracking-wider mb-0.5">
                      {item.label}
                    </span>
                    <span className="block text-text truncate transition-colors duration-300 group-hover:text-primary">
                      {item.value}
                    </span>
                  </span>
                  <ArrowUpRight
                    size={18}
                    aria-hidden="true"
                    className="text-muted transition-all duration-300 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              </StaggerItem>
            ))}
          </Stagger>

          {/* Message form — opens the visitor's mail app with it pre-written. */}
          <Reveal delay={100}>
            <div
              id="contact-form"
              className="scroll-mt-28 glow-border bg-card/80 backdrop-blur-sm border border-border rounded-3xl p-8 md:p-10"
            >
              <h3 className="font-serif text-3xl md:text-4xl text-text mb-1">
                Send a <em className="text-primary-gradient pr-1">message</em>
              </h3>
              <p className="text-muted text-xs mb-8">
                Checked here, then opened in your email app already written.
                Nothing is sent until you hit send there.
              </p>
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
