import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "../components/ui/ThemeProvider";
import Toaster from "../components/ui/Toaster";
import { seoDescription, seoKeywords, site } from "../data/site";

// The site's one typeface: a geometric grotesk with enough quirk in its
// terminals to carry the name as a kinetic set piece, and plain enough to
// read as body copy. Variable, so one file covers every weight in use.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s | ${site.name}`,
  },
  description: seoDescription,
  keywords: seoKeywords,
  authors: [{ name: site.name, url: site.github }],
  creator: site.name,
  applicationName: `${site.name} Portfolio`,
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    siteName: `${site.name} — ${site.role}`,
    title: `${site.name} — ${site.role}`,
    description: seoDescription,
    url: site.url,
    locale: "en_PH",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description: seoDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#090d16" },
  ],
};

/** Schema.org Person graph so search engines can read the profile directly. */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  description: seoDescription,
  email: `mailto:${site.email}`,
  telephone: site.phoneHref.replace("tel:", ""),
  url: site.url,
  sameAs: [site.linkedin, site.github],
  address: {
    "@type": "PostalAddress",
    addressLocality: site.location.city,
    addressRegion: site.location.region,
    addressCountry: "PH",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Christian Colleges of Southeast Asia",
  },
  knowsAbout: seoKeywords,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      // globals.css sets `scroll-behavior: smooth` so dock links glide. Next
      // 16 no longer switches that off for the scroll-to-top it does on a
      // route change unless this attribute asks it to. Without it, a page
      // opened from deep in another one arrives mid-glide instead of at its
      // top, and Next warns about it in development. Jumps within a page
      // are not affected: those still glide.
      data-scroll-behavior="smooth"
      className={`${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Entrances start hidden in the server HTML and are revealed by
            motion. Without JavaScript nothing would reveal them, so show
            everything at its final state instead.

            The hero's scroll track is tall only to give its camera somewhere
            to travel, and the camera needs JavaScript. Without it the track
            would be two screens of pinned poster, so it goes back to being
            an ordinary section: the same shape globals.css gives it under
            reduced motion, undoing what the media query there adds. */}
        <noscript>
          <style>{`[data-reveal-motion]{opacity:1!important;transform:none!important}.hero-track{height:auto!important;margin-bottom:0!important}.hero-stage{position:relative!important;top:auto!important;height:auto!important;align-self:stretch!important}`}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
