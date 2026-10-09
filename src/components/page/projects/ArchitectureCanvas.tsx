"use client";

import "@xyflow/react/dist/style.css";

import { Background, ReactFlow, type NodeTypes } from "@xyflow/react";
import ArchitectureNode from "./ArchitectureNode";
import { useArchitectureCanvas } from "@/src/hook/use.architecture.visualizer.hook";
import type { ArchitectureView } from "@/src/store/ui.store";

// Module scope: React Flow re-registers node types whenever this object's
// identity changes.
const nodeTypes: NodeTypes = { layer: ArchitectureNode };

interface IProps {
  view: ArchitectureView;
}

/**
 * The React Flow surface. It is a fixed diagram rather than an editor, so
 * dragging, zooming, and panning are off: the page keeps its scroll, and a
 * touch that starts on the diagram still scrolls the page.
 */
export default function ArchitectureCanvas({ view }: IProps) {
  const { nodes, edges, colorMode, handleNodeClick } = useArchitectureCanvas(view);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      colorMode={colorMode}
      onNodeClick={handleNodeClick}
      fitView
      fitViewOptions={{ padding: 0.08 }}
      minZoom={0.3}
      nodesDraggable={false}
      nodesConnectable={false}
      nodesFocusable={false}
      edgesFocusable={false}
      elementsSelectable={false}
      panOnDrag={false}
      zoomOnScroll={false}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      preventScrolling={false}
      style={{ background: "transparent" }}
    >
      <Background gap={22} size={1} color="var(--border)" bgColor="transparent" />
    </ReactFlow>
  );
}
