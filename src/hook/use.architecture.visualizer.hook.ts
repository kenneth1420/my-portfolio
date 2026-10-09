import { MarkerType, type Edge, type Node } from "@xyflow/react";
import { useInView } from "motion/react";
import { useTheme } from "next-themes";
import { useMemo, useRef } from "react";
import {
  architectureEdges,
  architectureLayers,
  architectureNodes,
  type ArchitectureLayerId,
} from "@/src/data/architecture";
import { useUiStore, type ArchitectureView } from "@/src/store/ui.store";

export interface IArchitectureNodeData extends Record<string, unknown> {
  title: string;
  detail: string;
  layer: ArchitectureLayerId;
  layerLabel: string;
  /** True when a single layer is selected and this node is not in it. */
  isDimmed: boolean;
  isActive: boolean;
}

export type ArchitectureFlowNode = Node<IArchitectureNodeData, "layer">;

const COLUMN_WIDTH = 250;
const ROW_HEIGHT = 104;

const layerOf = new Map(architectureNodes.map((node) => [node.id, node]));
const layerLabel = new Map(architectureLayers.map((layer) => [layer.id, layer.label]));

/**
 * State for the CliniQo visualizer's shell: which layer is selected, and
 * whether the diagram has come near the viewport yet. React Flow is only
 * downloaded once it has, so visitors who never scroll this far never pay
 * for it.
 */
export function useArchitectureVisualizer() {
  const view = useUiStore((state) => state.architectureView);
  const setView = useUiStore((state) => state.setArchitectureView);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldLoadCanvas = useInView(containerRef, { once: true, margin: "400px" });

  const activeLayer = architectureLayers.find((layer) => layer.id === view) ?? null;

  return {
    containerRef,
    shouldLoadCanvas,
    view,
    activeLayer,
    layers: architectureLayers,
    handleViewChange: setView,
  };
}

/**
 * Turns the architecture data into React Flow nodes and edges for the
 * selected view. Edges inside one column run top to bottom; edges between
 * columns run left to right.
 */
export function useArchitectureCanvas(view: ArchitectureView) {
  const { resolvedTheme } = useTheme();
  const setView = useUiStore((state) => state.setArchitectureView);

  const nodes = useMemo<ArchitectureFlowNode[]>(
    () =>
      architectureNodes.map((node) => ({
        id: node.id,
        type: "layer",
        position: { x: node.column * COLUMN_WIDTH, y: node.row * ROW_HEIGHT },
        data: {
          title: node.title,
          detail: node.detail,
          layer: node.layer,
          layerLabel: layerLabel.get(node.layer) ?? "",
          isDimmed: view !== "all" && node.layer !== view,
          isActive: view !== "all" && node.layer === view,
        },
      })),
    [view],
  );

  const edges = useMemo<Edge[]>(
    () =>
      architectureEdges.flatMap((edge) => {
        const source = layerOf.get(edge.source);
        const target = layerOf.get(edge.target);
        if (!source || !target) return [];

        const sameColumn = source.column === target.column;
        const touchesView = source.layer === view || target.layer === view;
        const isDimmed = view !== "all" && !touchesView;
        const stroke = touchesView ? "var(--primary)" : "var(--muted)";

        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: sameColumn ? "bottom" : "right",
          targetHandle: sameColumn ? "top" : "left",
          type: "smoothstep",
          label: edge.label,
          animated: touchesView,
          style: { stroke, strokeWidth: 1.5, opacity: isDimmed ? 0.2 : 1 },
          markerEnd: { type: MarkerType.ArrowClosed, color: stroke },
          labelStyle: { fill: "var(--text-dim)", fontSize: 10, opacity: isDimmed ? 0.2 : 1 },
          labelBgStyle: { fill: "var(--card)" },
          labelBgPadding: [6, 3] as [number, number],
          labelBgBorderRadius: 6,
        };
      }),
    [view],
  );

  /** Clicking a node selects its layer; clicking it again shows everything. */
  const handleNodeClick = (_: unknown, node: ArchitectureFlowNode) =>
    setView(node.data.layer === view ? "all" : node.data.layer);

  return {
    nodes,
    edges,
    colorMode: resolvedTheme === "light" ? ("light" as const) : ("dark" as const),
    handleNodeClick,
  };
}
