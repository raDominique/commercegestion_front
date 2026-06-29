import { cn } from "./utils";

const sizeMap = {
  sm: "h-4 w-4 border-2",
  default: "h-8 w-8 border-[3px]",
  lg: "h-12 w-12 border-4",
};

function Loader({ className, size = "default", message, fullPage = false }) {
  const spinner = (
    <div
      className={cn(
        "rounded-full border-primary border-t-transparent animate-spin",
        sizeMap[size] || sizeMap.default,
        className
      )}
    />
  );

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          {spinner}
          {message && <p className="text-sm text-neutral-500">{message}</p>}
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="flex flex-col items-center gap-2 py-8">
        {spinner}
        <p className="text-sm text-neutral-500">{message}</p>
      </div>
    );
  }

  return spinner;
}

export { Loader };
