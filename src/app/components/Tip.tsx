/**
 * Tip — lightweight Radix tooltip wrapper for action buttons and icons.
 *
 * Usage:
 *   <Tip label="Edit workstream">
 *     <button ...><Edit /></button>
 *   </Tip>
 *
 * The TooltipProvider is already mounted at the root (RootLayout), so
 * this component does NOT wrap a second provider.
 */
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import React from "react";

interface TipProps {
  label: string;
  side?: "top" | "right" | "bottom" | "left";
  children: React.ReactNode;
}

export function Tip({ label, side = "top", children }: TipProps) {
  return (
    <TooltipPrimitive.Root delayDuration={300}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className="z-50 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-md
                     animate-in fade-in-0 zoom-in-95
                     data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
                     data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2
                     data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2"
        >
          {label}
          <TooltipPrimitive.Arrow className="fill-gray-900" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
