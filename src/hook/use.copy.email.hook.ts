import { useEffect, useRef, useState } from "react";
import { site } from "@/src/data/site";

type CopyStatus = "idle" | "copied" | "failed";

const COPY_RESET_MS = 2500;

/** Copies the contact address and reports honestly whether it worked. */
export function useCopyEmail() {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const handleCopyEmail = async () => {
    clearTimeout(resetTimer.current);

    try {
      await navigator.clipboard.writeText(site.email);
      setCopyStatus("copied");
    } catch {
      // Clipboard access is refused on insecure origins and by some browser
      // settings. Say so, rather than claiming a copy that did not happen.
      setCopyStatus("failed");
    }

    resetTimer.current = setTimeout(() => setCopyStatus("idle"), COPY_RESET_MS);
  };

  return { handleCopyEmail, copyStatus };
}
