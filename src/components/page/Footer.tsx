import { ArrowUp } from "lucide-react";
import { Reveal } from "../ui/Reveal";
import { site } from "@/src/data/site";

const footerLinks = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

const socialLinks = [
  { href: site.linkedin, label: "LinkedIn" },
  { href: site.github, label: "GitHub" },
  { href: `mailto:${site.email}`, label: "Email" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border px-6 pt-16 pb-8 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10">
          <div>
            <p className="font-serif text-3xl text-text">
              {site.name.split(" ")[0]}{" "}
              <em className="text-primary-gradient pr-1">{site.name.split(" ")[1]}</em>
            </p>
            <p className="text-muted text-sm mt-2">
              {site.role} · {site.location.label}
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-14 gap-y-2 text-sm">
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-text-dim hover:text-primary transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <ul className="space-y-2">
              {socialLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-text-dim hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* The sign-off: the surname set at the width of the page, rising
            into view as the reader reaches the end. Decorative — the name is
            already in the heading above. */}
        <Reveal
          as="p"
          aria-hidden="true"
          className="mt-14 font-serif italic leading-[0.8] text-center select-none text-[clamp(5rem,22vw,19rem)] bg-gradient-to-b from-primary/35 to-primary/0 bg-clip-text text-transparent pr-[0.05em]"
        >
          Lariosa
        </Reveal>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-muted text-xs font-mono">
          <p>
            © {new Date().getFullYear()} {site.name} · Built with Next.js and
            Tailwind CSS
          </p>
          <a
            href="#"
            className="group inline-flex items-center gap-2 tracking-widest hover:text-primary transition-colors"
          >
            BACK TO TOP
            <ArrowUp
              size={13}
              className="transition-transform duration-300 group-hover:-translate-y-0.5"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
