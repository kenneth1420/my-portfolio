import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { toast } from "sonner";
import { site } from "@/src/data/site";
import { useUiStore } from "@/src/store/ui.store";

/**
 * Behaviour for the command palette: the ⌘K / Ctrl+K shortcut, and the
 * actions its items run. Every action closes the palette first, then acts on
 * the next frame, so the dialog has released focus and scroll lock before
 * the page moves.
 */
export function useCommandMenu() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const isOpen = useUiStore((state) => state.isCommandOpen);
  const setOpen = useUiStore((state) => state.setCommandOpen);
  const toggle = useUiStore((state) => state.toggleCommand);
  const setArchitectureView = useUiStore((state) => state.setArchitectureView);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  const run = (action: () => void) => {
    setOpen(false);
    requestAnimationFrame(action);
  };

  const handleJump = (id: string) =>
    run(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));

  const handleShowArchitecture = () => {
    setArchitectureView("all");
    handleJump("cliniqo-architecture");
  };

  const handleOpenResume = () => run(() => router.push("/resume"));

  const handleToggleTheme = () =>
    run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"));

  const handleCopyEmail = () =>
    run(async () => {
      try {
        await navigator.clipboard.writeText(site.email);
        toast.success("Email copied", { description: site.email });
      } catch {
        toast.error("Copy was blocked", { description: site.email });
      }
    });

  const handleOpenLink = (href: string) =>
    run(() => window.open(href, "_blank", "noopener,noreferrer"));

  return {
    isOpen,
    handleOpenChange: setOpen,
    handleJump,
    handleShowArchitecture,
    handleOpenResume,
    handleToggleTheme,
    handleCopyEmail,
    handleOpenLink,
  };
}
