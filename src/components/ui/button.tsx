import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary CTA - красная кнопка (pill-форма)
        default:
          "bg-accent text-accent-foreground hover:bg-accent-hover rounded-pill font-semibold uppercase tracking-wide",
        // Secondary - контурная красная
        outline:
          "border-2 border-accent bg-transparent text-accent hover:bg-accent-light rounded-pill font-semibold uppercase tracking-wide",
        // Ghost для навигации
        ghost:
          "hover:bg-accent/10 hover:text-accent rounded-md",
        // Link style
        link:
          "text-accent underline-offset-4 hover:underline",
        // Secondary filled
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-pill",
        // Destructive
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-pill",
        // Primary blue - для второстепенных действий
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 rounded-pill font-semibold",
      },
      size: {
        default: "h-11 px-6 py-2 text-sm",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
