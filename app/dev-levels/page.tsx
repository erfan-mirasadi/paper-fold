"use client";

// TEMPORARY level-verification harness. Delete.

import { useEffect, useState } from "react";
import { SyncedRecitation } from "@/app/_components/dom/recitation/SyncedRecitation";
import { RecitationChainProvider } from "@/app/_components/dom/recitation/RecitationChain";
import { ALAK_RECITATIONS } from "@/app/data/recitations/alak";

declare global {
  interface Window {
    __gains?: { node: GainNode; at: number }[];
    __srcNodes?: number;
  }
}

export default function DevLevels() {
  const [readout, setReadout] = useState("");

  useEffect(() => {
    window.__gains = [];
    window.__srcNodes = 0;
    const realGain = AudioContext.prototype.createGain;
    AudioContext.prototype.createGain = function (this: AudioContext) {
      const g = realGain.call(this);
      window.__gains!.push({ node: g, at: Date.now() });
      return g;
    };
    const realSrc = AudioContext.prototype.createMediaElementSource;
    AudioContext.prototype.createMediaElementSource = function (
      this: AudioContext,
      el: HTMLMediaElement,
    ) {
      window.__srcNodes = (window.__srcNodes ?? 0) + 1;
      return realSrc.call(this, el);
    };

    const t = window.setInterval(() => {
      setReadout(
        JSON.stringify(
          {
            sourceNodes: window.__srcNodes,
            gains: (window.__gains ?? []).map((g) =>
              +g.node.gain.value.toFixed(4),
            ),
          },
          null,
          1,
        ),
      );
    }, 200);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div style={{ padding: 24, color: "#ddd", maxWidth: 620 }}>
      <RecitationChainProvider>
        <SyncedRecitation
          transcript={ALAK_RECITATIONS.vahiy}
          units={["Allah'ın konuşması vahiy olarak isimlendirilir."]}
        >
          {(ink) => <p style={{ lineHeight: 1.9 }}>{ink(0)}</p>}
        </SyncedRecitation>
      </RecitationChainProvider>
      <pre id="readout" style={{ marginTop: 24, fontFamily: "monospace" }}>
        {readout}
      </pre>
    </div>
  );
}
