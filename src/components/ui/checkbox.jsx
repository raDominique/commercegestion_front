import { cn } from "./utils";

function Checkbox({
  className,
  checked,
  onCheckedChange,
  onChange,
  ...props
}) {
  return (
    <input
      type="checkbox"
      data-slot="checkbox"
      checked={checked}
      onChange={(event) => {
        onChange?.(event);
        onCheckedChange?.(event.target.checked);
      }}
      className={cn(
        "size-4 shrink-0 rounded-sm border border-neutral-300 accent-violet-600",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Checkbox };
