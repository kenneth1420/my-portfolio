"use client";

import {
  Box,
  Briefcase,
  Copy,
  FileText,
  FolderGit2,
  Layers,
  type LucideIcon,
  Mail,
  Network,
  RefreshCw,
  SunMoon,
  User,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../ui/Command";
import { site } from "@/src/data/site";
import { useCommandMenu } from "@/src/hook/use.command.menu.hook";

interface ISection {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Extra words that should find the section besides its label. */
  keywords?: string[];
}

/**
 * In page order. The hero leads and is the only one with search words: it
 * has no dock tab, and "top" or "home" is what someone looking for it types.
 * Contact is left out: it already leads the quick actions.
 */
const SECTIONS: ISection[] = [
  { id: "hero", label: "3D Hero", icon: Box, keywords: ["top", "home", "intro", "desk"] },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "about", label: "About", icon: User },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "skills", label: "Skills", icon: Layers },
];

/**
 * The ⌘K palette: jump to any section, open the two live demos, reach the
 * resume, or switch theme, without scrolling for it.
 */
export default function CommandMenu() {
  const {
    isOpen,
    handleOpenChange,
    handleJump,
    handleShowArchitecture,
    handleOpenResume,
    handleToggleTheme,
    handleCopyEmail,
    handleOpenLink,
  } = useCommandMenu();

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      title="Command menu"
      description="Search for a section or an action, then press Enter."
    >
      <CommandInput placeholder="Jump to a section or run an action…" />
      <CommandList>
        <CommandEmpty>Nothing matches that.</CommandEmpty>

        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={handleOpenResume} keywords={["cv"]}>
            <FileText aria-hidden="true" size={16} />
            Resume
          </CommandItem>
          <CommandItem onSelect={() => handleJump("contact")} value="Contact me" keywords={["hire", "email", "message"]}>
            <Mail aria-hidden="true" size={16} />
            Contact
          </CommandItem>
          <CommandItem onSelect={handleShowArchitecture} keywords={["diagram", "system", "react flow"]}>
            <Network aria-hidden="true" size={16} />
            CliniQo Architecture
          </CommandItem>
          <CommandItem onSelect={() => handleJump("dar-simulator")} keywords={["commit", "report", "ai", "demo"]}>
            <RefreshCw aria-hidden="true" size={16} />
            DAR Simulator
          </CommandItem>
          <CommandItem onSelect={handleToggleTheme} keywords={["dark", "light", "mode"]}>
            <SunMoon aria-hidden="true" size={16} />
            Toggle light / dark mode
          </CommandItem>
          <CommandItem onSelect={handleCopyEmail} keywords={["mail", "address"]}>
            <Copy aria-hidden="true" size={16} />
            Copy email address
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Sections">
          {SECTIONS.map((section) => (
            <CommandItem
              key={section.id}
              onSelect={() => handleJump(section.id)}
              keywords={section.keywords}
            >
              <section.icon aria-hidden="true" size={16} />
              {section.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Links">
          <CommandItem onSelect={() => handleOpenLink(site.github)}>
            <FaGithub aria-hidden="true" size={16} />
            GitHub
          </CommandItem>
          <CommandItem onSelect={() => handleOpenLink(site.linkedin)}>
            <FaLinkedin aria-hidden="true" size={16} />
            LinkedIn
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
