import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const loaderVariants = cva("loading h-full w-5", {
  variants: {
    size: {
      icon: "h-5 w-5",
      xs: "h-4 w-4",
      sm: "h-4 w-4",
      default: "h-5 w-5",
      lg: "h-6 w-6",
    },
  },
});

const buttonVariants = cva(
  "relative font-sans inline-flex gap-2 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:border-transparent disabled:bg-disabled-200 disabled:text-disabled focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ring",
  {
    variants: {
      variant: {
        default:
          "bg-slate-900 text-background shadow-[0_0_0_1px_var(--slate-900)] hover:bg-slate-800 hover:shadow-[0_0_0_1px_var(--slate-800)] disabled:shadow-border-disabled",
        primary: "bg-primary text-white hover:bg-primary/90",
        outline:
          "border-none bg-slate-50 shadow-border hover:bg-slate-100 focus-visible:shadow-focus focus-visible:outline-0 disabled:bg-disabled-200/50 disabled:text-disabled-500 disabled:shadow-border-disabled data-open:shadow-focus",
        ghost:
          "hover:bg-slate-100 focus-visible:outline-0 focus-visible:shadow-focus",
        link: "text-primary underline-offset-4 hover:underline",
        error:
          "bg-error shadow-[0_0_0_1px_var(--error-600)] dark:shadow-[0_0_0_1px_var(--error-500)] text-background hover:bg-error-500 dark:hover:bg-error-500/90 dark:bg-error-500 hover:shadow-[0_0_0_1px_var(--error-500)]",
      },
      size: {
        icon: "h-10 w-10 [&_svg:not([class*='size-'])]:size-5",
        xs: "h-8 rounded-md px-2 [&_svg:not([class*='size-'])]:size-4",
        sm: "h-9 rounded-md px-3 [&_svg:not([class*='size-'])]:size-4",
        default: "h-10 px-4 py-2 [&_svg:not([class*='size-'])]:size-5",
        lg: "h-11 rounded-lg px-5 [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonProps = React.ComponentPropsWithRef<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    isLoading?: boolean;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
  };

const Button = ({
  className,
  variant,
  startIcon,
  endIcon,
  size,
  asChild = false,
  isLoading,
  children,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot : "button";

  const iconArrowUpRightAnimationClassname =
    "[&_svg.tabler-icon-arrow-up-right]:spring-bounce-60 [&_svg.tabler-icon-arrow-up-right]:spring-duration-300 hover:[&_svg.tabler-icon-arrow-up-right]:translate-x-[3px] hover:[&_svg.tabler-icon-arrow-up-right]:translate-y-[-3px]";

  return (
    <Comp
      className={cn(
        iconArrowUpRightAnimationClassname,
        buttonVariants({ variant, size, className })
      )}
      data-slot="button"
      {...props}
      disabled={isLoading || props.disabled}
      aria-busy={isLoading}
    >
      <span
        className={cn(
          "grid place-items-center transition-[width]",
          isLoading ? loaderVariants({ size }) : startIcon ? "" : "-ml-2 w-0"
        )}
        aria-hidden={!startIcon && !isLoading}
      >
        {startIcon}
      </span>
      <Slottable>{children}</Slottable>
      {endIcon}
    </Comp>
  );
};

Button.displayName = "Button";

export { Button, buttonVariants };
