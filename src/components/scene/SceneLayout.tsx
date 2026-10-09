"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import SceneErrorBoundary from "./SceneErrorBoundary";

// Client-only and split out of the main bundle. three and R3F load after the
// page is interactive, so the 3D scene never delays first paint. In Next 16,
// `ssr: false` is only allowed inside a Client Component, which is why this
// file is one.
const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });

interface IProps {
  children: ReactNode;
  /** Classes for the content container, e.g. its flex layout. */
  className?: string;
}

/**
 * Global page frame: the WebGL scene fixed behind everything at `z-0`, and a
 * `relative z-10` container that lifts the page content above it.
 *
 * Fixed-position chrome (navbar, toggles, overlays) can live inside or outside
 * the container. The container is a stacking context, so anything inside it
 * stacks within the z-10 layer.
 */
export default function SceneLayout({ children, className = "" }: IProps) {
  return (
    <>
      <SceneErrorBoundary>
        <SceneCanvas />
      </SceneErrorBoundary>
      <div className={`relative z-10 ${className}`}>{children}</div>
    </>
  );
}
