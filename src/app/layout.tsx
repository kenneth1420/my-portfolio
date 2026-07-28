import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "../components/ui/ThemeProvider";
import { seoDescription, seoKeywords, site } from "../data/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
