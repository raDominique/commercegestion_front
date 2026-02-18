import { cn } from "./utils";

// Composant Squelette (Skeleton) pour afficher un effet de chargement
function Squelette({ className, ...props }) {
  return (
    <div
      data-slot="squelette"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Squelette };