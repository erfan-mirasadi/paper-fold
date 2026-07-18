import { useEffect } from "react";
import { useElevatedStore } from "@/app/stores/useElevatedStore";
import { useSideInfoStore } from "@/app/stores/useSideInfoStore";
import { useSurahScriptStore } from "@/app/stores/useSurahScriptStore";

/**
 * Auto-collapses the tafsir (SideInfoPanel) and Quran script
 * (SurahScriptSidebar) panels whenever the user elevates a verse/section
 * (zoom-in) or enters all-sections mode, then restores them on exit —
 * but only the ones we closed ourselves.
 *
 * - Panel already closed when elevation starts → left untouched.
 * - Panel open when elevation starts → closed, and reopened once elevation
 *   ends.
 * - If the user manually reopens a panel while still elevated, it's no
 *   longer "ours" to restore — we drop the reopen-on-exit for it.
 */
export function useAutoCollapsePanelsOnElevate() {
  useEffect(() => {
    const autoClosed = { tafsir: false, script: false };

    const unsubElevated = useElevatedStore.subscribe((state, prevState) => {
      const wasElevated = prevState.phase === "elevated";
      const isElevated = state.phase === "elevated";

      if (isElevated && !wasElevated) {
        const tafsirOpen = useSideInfoStore.getState().isOpen;
        autoClosed.tafsir = tafsirOpen;
        if (tafsirOpen) useSideInfoStore.getState().setOpen(false);

        const scriptOpen = useSurahScriptStore.getState().isOpen;
        autoClosed.script = scriptOpen;
        if (scriptOpen) useSurahScriptStore.getState().setOpen(false);
      } else if (!isElevated && wasElevated) {
        if (autoClosed.tafsir) useSideInfoStore.getState().setOpen(true);
        if (autoClosed.script) useSurahScriptStore.getState().setOpen(true);
        autoClosed.tafsir = false;
        autoClosed.script = false;
      }
    });

    // If the user manually reopens a panel while still elevated, it's no
    // longer ours to restore on exit.
    const unsubTafsir = useSideInfoStore.subscribe((state) => {
      if (state.isOpen) autoClosed.tafsir = false;
    });
    const unsubScript = useSurahScriptStore.subscribe((state) => {
      if (state.isOpen) autoClosed.script = false;
    });

    return () => {
      unsubElevated();
      unsubTafsir();
      unsubScript();
    };
  }, []);
}
