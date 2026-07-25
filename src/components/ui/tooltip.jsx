"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "./utils";

function TooltipProvider({ delayDuration = 0, ...props }) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({ ...props }) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({ ...props }) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({ className, sideOffset = 6, children, ...props }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin)",
          "rounded-lg px-3 py-1.5 text-xs font-medium text-balance",
          // Palette violet/indigo
          "bg-violet-700 text-white shadow-lg shadow-violet-900/30 ring-1 ring-violet-500/40",
          // Animations entrée
          "animate-in fade-in-0 zoom-in-95",
          // Animations sortie
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          // Slide selon côté
          "data-[side=bottom]:slide-in-from-top-1.5",
          "data-[side=left]:slide-in-from-right-1.5",
          "data-[side=right]:slide-in-from-left-1.5",
          "data-[side=top]:slide-in-from-bottom-1.5",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="fill-violet-700 z-50 size-2.5 translate-y-[calc(-50%-1px)] rotate-45 rounded-[1px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };