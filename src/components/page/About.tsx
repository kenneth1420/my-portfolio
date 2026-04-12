"use client";

import { useEffect, useRef } from "react";
import { MapPin, GraduationCap, Building } from "lucide-react";

const stats = [
  { value: "6+", label: "Years Experience" },
  { value: "15+", label: "Projects Delivered" },
  { value: "5", label: "Companies Served" },
  { value: "3", label: "Tech Stacks" },
];

export default function About() {
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
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" ref={ref} className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="section-reveal mb-16">
          <p className="text-gold font-mono text-sm tracking-widest mb-3">
            01. ABOUT
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-text">
            Who I Am
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left – text */}
          <div className="section-reveal space-y-6">
            <p className="text-text-dim leading-relaxed text-lg">
              I&apos;m a passionate and detail-oriented Full-Stack Developer who
              enjoys building reliable, high-quality web and mobile applications.
              I&apos;ve worked across the full stack using modern tools and
              frameworks, and I thrive in collaborative environments where I can
              learn from others and share ideas.
            </p>
            <p className="text-text-dim leading-relaxed">
              I&apos;m looking for a role where I can help build meaningful
              products, grow with new technologies, and make a positive impact
              through clean, maintainable, and thoughtful code.
            </p>

            {/* Quick facts */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-3 text-text-dim">
                <MapPin size={15} className="text-gold flex-shrink-0" />
                <span>Davao City, Philippines</span>
              </div>
              <div className="flex items-center gap-3 text-text-dim">
                <GraduationCap size={15} className="text-gold flex-shrink-0" />
                <span>
                  BS Computer Science &mdash; Christian Colleges of Southeast
                  Asia (2014–2018)
                </span>
              </div>
              <div className="flex items-center gap-3 text-text-dim">
                <Building size={15} className="text-gold flex-shrink-0" />
                <span>
                  Currently: Senior Computer Services Programmer @ Davao City
                  Water District
                </span>
              </div>
            </div>
          </div>

          {/* Right – stats */}
          <div className="section-reveal grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="hover-card bg-card border border-border rounded-2xl p-6"
              >
                <p className="font-display text-4xl font-bold text-gold mb-1">
                  {stat.value}
                </p>
                <p className="text-text-dim text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
