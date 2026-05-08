import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "./utils";

// Status variants for button states
const statusVariants = {
    active: "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green/20 dark:bg-green-700 dark:hover:bg-green-800",
    inactive: "bg-gray-400 text-white hover:bg-gray-500 cursor-not-allowed disabled:opacity-75",
    loading: "bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber/20 dark:bg-amber-600 dark:hover:bg-amber-700 opacity-80",
};

// buttonVariants utilitaire simple (remplace cva)
function buttonVariants({ variant = "default", size = "default", status = null, className = "" } = {}) {
    const base =
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] hover:cursor-pointer data-[state=open]:bg-accent";
    const variants = {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
            "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
            "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
            "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
            "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
    };
    const sizes = {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md px-6",
        icon: "size-9 rounded-md",
    };
    
    // If status is provided, use status variant instead of variant
    const finalVariant = status && statusVariants[status] ? statusVariants[status] : (variants[variant] || variants.default);
    
    return [
        base,
        finalVariant,
        sizes[size] || sizes.default,
        className,
    ].join(" ");
}

// Button component
const Button = forwardRef(function Button(
    { className = "", variant = "default", size = "default", status = null, asChild = false, children, ...props },
    ref
) {
    const Comp = asChild ? Slot : "button";
    return (
        <Comp
            ref={ref}
            data-slot="button"
            className={cn(buttonVariants({ variant, size, status, className }))}
            {...props}
        >
            {children}
        </Comp>
    );
});

Button.displayName = "Button";

export { Button, buttonVariants };