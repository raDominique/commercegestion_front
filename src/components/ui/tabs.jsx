"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "./utils";

function Tabs({ className, ...props }) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-[#1a1625] h-9 w-fit items-center justify-center rounded-xl p-1 flex gap-0.5",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // Base
        "inline-flex items-center justify-center px-3 py-1 text-sm font-medium whitespace-nowrap rounded-lg transition-all duration-150",
        // Default (inactive)
        "text-[#8b7fa8] hover:text-[#c4b5d9]",
        // Active: white text + visible ring outline (pill border)
        "data-[state=active]:text-white data-[state=active]:ring-1 data-[state=active]:ring-[#6d4fa0] data-[state=active]:ring-offset-1 data-[state=active]:ring-offset-[#1a1625]",
        // Focus
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-1 focus-visible:ring-offset-[#1a1625]",
        // Disabled
        "disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };