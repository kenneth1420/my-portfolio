"use client";

import { useEffect, useRef } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";

const contactLinks = [
  {
    icon: Mail,
    label: "Email",
    value: "kennethlariosa14@gmail.com",
    href: "mailto:kennethlariosa14@gmail.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+63 946 036 4852",
    href: "tel:+639460364852",
  },
  {
    icon: FaLinkedin,
    label: "LinkedIn",
    value: "kenneth-lariosa-dev",
    href: "https://www.linkedin.com/in/kenneth-lariosa-dev",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Davao City, Philippines",
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
