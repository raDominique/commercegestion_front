import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "./utils";

function Tabs({ className, ...props }) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-0", className)}
      {...props}
    />
  );
}

function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "flex items-end gap-0 px-2",
        "border-b-2 border-violet-300",
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
        // Base — onglet inactif
        "relative -mb-0.5 min-w-22.5 rounded-t-md px-4 py-1.5",
        "text-sm font-normal whitespace-nowrap text-center",
        "bg-gray-100 text-gray-700",
        "border border-b-2 border-gray-200 border-b-violet-300",
        "transition-colors duration-100",
        // Hover
        "hover:bg-gray-200 hover:text-gray-900",
        // Actif — fond panel, bordure colorée, bas masqué
        "data-[state=active]:z-10 data-[state=active]:bg-white",
        "data-[state=active]:text-gray-900 data-[state=active]:font-medium",
        "data-[state=active]:border-2 data-[state=active]:border-b-2",
        "data-[state=active]:border-violet-300 data-[state=active]:border-b-white",
        // Focus
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
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
      className={cn(
        "bg-white border border-t-0 border-gray-200",
        "rounded-b-md p-4 outline-none",
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };