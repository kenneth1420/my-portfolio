"use client";

import { motion } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Briefcase,
  FileText,
  FolderGit2,
  Layers,
  Mail,
  Search,
  User,
} from "lucide-react";
import DockTab from "./nav/DockTab";
import ThemeToggle from "../ui/ThemeToggle";
import { REVEAL_ATTR } from "../ui/Reveal";
import { site } from "@/src/data/site";
import { useActiveSection } from "@/src/hook/use.active.section.hook";
import { useUiStore } from "@/src/store/ui.store";

// Client-only and in its own chunk: cmdk and the dialog load after the page
// is interactive. The ⌘K listener lives inside it, so the shortcut comes
// alive when the chunk does; the dock button works either way, because it
// only flips a flag in the store.
const CommandMenu = dynamic(() => import("./nav/CommandMenu"), { ssr: false });

const tabs = [
  { href: "#projects", label: "Projects", icon: FolderGit2 },
  { href: "#about", label: "About", icon: User },
  { href: "#experience", label: "Experience", icon: Briefcase },
  { href: "#skills", label: "Skills", icon: Layers },
  { href: "#contact", label: "Contact", icon: Mail },
];

// Module scope keeps the array identity stable for the hook's effect.
const sectionIds = tabs.map((tab) => tab.href.slice(1));

const ICON_BUTTON =
  "grid size-8 min-[380px]:size-9 place-items-center rounded-full text-text-dim transition-colors duration-200 hover:bg-primary/10 hover:text-primary-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong";

function Divider({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`mx-0.5 h-5 w-px bg-border min-[380px]:mx-1 ${className}`}
    />
  );
}

/**
 * The floating dock: one glass pill, bottom centre, on every screen size.
 *
 * Tabs follow the reader. `useActiveSection` reports the section under the
 * middle of the viewport, and the shared `activeTab` pill glides beneath
 * that tab. Over the hero nothing is active. The search button opens the
 * command palette, which ⌘K / Ctrl+K also does.
 *
 * The dock rises in once the splash loader has lifted. A reading-progress
 * hairline runs along its bottom edge, driven by a CSS scroll timeline
 * where supported.
 */
export default function Navbar() {
  const activeId = useActiveSection(sectionIds);
  const openCommandMenu = useUiStore((state) => state.setCommandOpen);

  return (
    <>
      <motion.nav
        {...REVEAL_ATTR}
        aria-label="Primary"
        initial={{ y: 96, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.3, type: "spring", stiffness: 260, damping: 26 }}
        // The wrapper spans the width only to centre the dock; it must not
        // swallow clicks on the page either side of it.
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-2 min-[380px]:px-3 sm:bottom-6 print:hidden"
      >
        <div className="pointer-events-auto relative flex items-center rounded-full border border-border/70 bg-white/65 p-1 min-[380px]:p-1.5 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.45)] backdrop-blur-xl dark:bg-black/45">
          <a
            href="#"
            aria-label={`${site.name}, back to top`}
            className="hidden h-9 items-center rounded-full px-3 font-serif text-lg italic text-primary-gradient focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong sm:flex"
          >
            {site.initials}
          </a>
          <Divider className="hidden sm:block" />

          <ul className="flex items-center">
            {tabs.map((tab) => (
              <li key={tab.href}>
                <DockTab
                  href={tab.href}
                  label={tab.label}
                  icon={tab.icon}
                  isActive={tab.href === `#${activeId}`}
                />
              </li>
            ))}
          </ul>

          <Divider />
          <button
            type="button"
            onClick={() => openCommandMenu(true)}
            aria-label="Open command menu"
            aria-keyshortcuts="Meta+K Control+K"
            title="Command menu (⌘K / Ctrl+K)"
            className={ICON_BUTTON}
          >
            <Search aria-hidden="true" size={16} />
          </button>
          <Link
            href="/resume"
            aria-label="Resume"
            title="Resume"
            className={ICON_BUTTON}
          >
            <FileText aria-hidden="true" size={16} />
          </Link>
          <ThemeToggle className={ICON_BUTTON} />

          <span
            aria-hidden="true"
            className="scroll-progress pointer-events-none absolute inset-x-8 -bottom-px h-px bg-linear-to-r from-primary/0 via-primary to-primary/0"
          />
        </div>
      </motion.nav>
      <CommandMenu />
    </>
  );
}
