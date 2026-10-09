import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { ArchitectureFlowNode } from "@/src/hook/use.architecture.visualizer.hook";

const HANDLE = "!h-1 !w-1 !min-h-0 !min-w-0 !border-0 !bg-transparent";

/** One box in the CliniQo diagram: layer name, component, and what it does. */
export default function ArchitectureNode({ data }: NodeProps<ArchitectureFlowNode>) {
  return (
    <div
      className={`w-[168px] cursor-pointer rounded-xl border px-3.5 py-2.5 text-left transition-[opacity,border-color,box-shadow,background-color] duration-300 ${
        data.isActive
          ? "border-primary bg-card shadow-[0_0_0_4px] shadow-primary/15"
          : "border-border bg-card/90 hover:border-primary/50"
      } ${data.isDimmed ? "opacity-30" : ""}`}
    >
      <Handle id="left" type="target" position={Position.Left} className={HANDLE} />
      <Handle id="top" type="target" position={Position.Top} className={HANDLE} />
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-primary-strong">
        {data.layerLabel}
      </p>
      <p className="mt-0.5 text-[13px] font-semibold leading-tight text-text">
        {data.title}
      </p>
      <p className="mt-0.5 text-[11px] leading-snug text-text-dim">{data.detail}</p>
      <Handle id="right" type="source" position={Position.Right} className={HANDLE} />
      <Handle id="bottom" type="source" position={Position.Bottom} className={HANDLE} />
    </div>
  );
}
