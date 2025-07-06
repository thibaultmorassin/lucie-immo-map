"use client";

import * as React from "react";
import { Drawer as MobileDrawerPrimitive } from "vaul";

import { cn } from "@/lib/utils";

const MobileDrawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentPropsWithRef<typeof MobileDrawerPrimitive.Root>) => (
  <MobileDrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
);
MobileDrawer.displayName = "MobileDrawer";

const MobileDrawerTrigger = MobileDrawerPrimitive.Trigger;

const MobileDrawerPortal = MobileDrawerPrimitive.Portal;

const MobileDrawerClose = MobileDrawerPrimitive.Close;

const MobileDrawerOverlay = ({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof MobileDrawerPrimitive.Overlay>) => (
  <MobileDrawerPrimitive.Overlay
    className={cn("fixed inset-0 z-50 bg-black/80 backdrop-blur-xs", className)}
    {...props}
  />
);
MobileDrawerOverlay.displayName = MobileDrawerPrimitive.Overlay.displayName;

const MobileDrawerContent = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithRef<typeof MobileDrawerPrimitive.Content>) => (
  <MobileDrawerPortal>
    <MobileDrawerOverlay />
    <MobileDrawerPrimitive.Content
      className={cn(
        "bg-background fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border",
        className
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-neutral-100" />
      {children}
    </MobileDrawerPrimitive.Content>
  </MobileDrawerPortal>
);
MobileDrawerContent.displayName = "MobileDrawerContent";

const MobileDrawerHeader = ({
  className,
  ...props
}: React.ComponentPropsWithRef<"div">) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
);
MobileDrawerHeader.displayName = "MobileDrawerHeader";

const MobileDrawerFooter = ({
  className,
  ...props
}: React.ComponentPropsWithRef<"div">) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
);
MobileDrawerFooter.displayName = "MobileDrawerFooter";

const MobileDrawerTitle = ({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof MobileDrawerPrimitive.Title>) => (
  <MobileDrawerPrimitive.Title
    className={cn(
      "text-lg leading-none font-semibold tracking-tight",
      className
    )}
    {...props}
  />
);
MobileDrawerTitle.displayName = MobileDrawerPrimitive.Title.displayName;

const MobileDrawerDescription = ({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof MobileDrawerPrimitive.Description>) => (
  <MobileDrawerPrimitive.Description
    className={cn("text-neutral text-sm", className)}
    {...props}
  />
);
MobileDrawerDescription.displayName =
  MobileDrawerPrimitive.Description.displayName;

export {
  MobileDrawer,
  MobileDrawerClose,
  MobileDrawerContent,
  MobileDrawerDescription,
  MobileDrawerFooter,
  MobileDrawerHeader,
  MobileDrawerOverlay,
  MobileDrawerPortal,
  MobileDrawerTitle,
  MobileDrawerTrigger,
};
