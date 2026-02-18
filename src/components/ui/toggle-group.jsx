import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";

import { cn } from "./utils";

function ToggleGroup({ className, ...props }) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}

function ToggleGroupItem({ className, ...props }) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        "border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-pressed:bg-accent aria-pressed:text-accent-foreground dark:bg-input/30 inline-flex h-9 w-9 items-center justify-center rounded-md border px-2 py-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };