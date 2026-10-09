"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/src/lib/utils";

/**
 * Command palette pieces in the shadcn/ui pattern: cmdk does the filtering
 * and keyboard navigation, Radix Dialog the focus trap and Escape handling.
 */

interface ICommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Read by screen readers; the palette has no visible heading. */
  title: string;
  description: string;
  children: ReactNode;
}

export function CommandDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: ICommandDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-1/2 top-[14vh] z-[61] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-3xl border border-border bg-card shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] outline-none">
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {description}
          </DialogPrimitive.Description>
          <CommandPrimitive loop className="flex flex-col">
            {children}
          </CommandPrimitive>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export function CommandInput({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-5">
      <Search aria-hidden="true" size={16} className="shrink-0 text-muted" />
      <CommandPrimitive.Input
        className={cn(
          "h-14 w-full bg-transparent text-sm text-text placeholder:text-muted outline-none",
          className,
        )}
        {...props}
      />
      <kbd className="hidden shrink-0 rounded-md border border-border bg-subtle px-1.5 py-0.5 font-mono text-[10px] text-text-dim sm:block">
        Esc
      </kbd>
    </div>
  );
}

export function CommandList({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      className={cn("max-h-[min(22rem,55vh)] overflow-y-auto overscroll-contain p-2", className)}
      {...props}
    />
  );
}

export function CommandEmpty(props: ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      className="px-4 py-10 text-center text-sm text-text-dim"
      {...props}
    />
  );
}

export function CommandGroup({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      className={cn(
        "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.2em] [&_[cmdk-group-heading]]:text-text-dim",
        className,
      )}
      {...props}
    />
  );
}

export function CommandItem({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      className={cn(
        "flex cursor-pointer select-none items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-dim data-[selected=true]:bg-primary/12 data-[selected=true]:text-text [&_svg]:shrink-0 [&_svg]:text-primary-strong",
        className,
      )}
      {...props}
    />
  );
}
