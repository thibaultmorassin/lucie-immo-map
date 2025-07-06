"use client";

import { cn } from "@/lib/utils";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva } from "class-variance-authority";
import * as React from "react";

const labelVariants = cva(
  "text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithRef<typeof LabelPrimitive.Root>) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
);
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
