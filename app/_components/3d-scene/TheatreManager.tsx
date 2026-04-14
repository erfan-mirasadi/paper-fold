"use client";

import { getProject } from "@theatre/core";
import { SheetProvider } from "@theatre/r3f";
import { useEffect, ReactNode } from "react";
import projectState from "./state.json";

// import studio from "@theatre/studio";
// import extension from "@theatre/r3f/dist/extension";

const project = getProject("QuranFold", { state: projectState });
export const mainSheet = project.sheet("Main");

export default function TheatreManager({ children }: { children: ReactNode }) {
  useEffect(() => {
    // if (process.env.NODE_ENV === "development") {
    //   studio.initialize();
    //   studio.extend(extension);
    // }
  }, []);

  return <SheetProvider sheet={mainSheet}>{children}</SheetProvider>;
}
