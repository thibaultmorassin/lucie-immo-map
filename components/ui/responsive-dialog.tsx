"use client";

import {
  DialogContent as DesktopDialogContent,
  DialogDescription as DesktopDialogDescription,
  DialogFooter as DesktopDialogFooter,
  DialogHeader as DesktopDialogHeader,
  DialogTitle as DesktopDialogTitle,
  Dialog,
  DialogClose,
  DialogOverlay,
} from "@/components/ui/dialog";
import {
  MobileDrawer,
  MobileDrawerContent,
  MobileDrawerDescription,
  MobileDrawerFooter,
  MobileDrawerHeader,
  MobileDrawerOverlay,
  MobileDrawerTitle,
} from "@/components/ui/mobile-drawer";
import useMediaQuery from "@/hooks/use-media-query";
import { DialogPortal, DialogTrigger } from "@radix-ui/react-dialog";
import * as React from "react";

const DEFAULT_DESKTOP_MEDIA_QUERY = "(min-width: 768px)";

const ResponsiveDialogContext = React.createContext<{ isDesktop: boolean }>({
  isDesktop: true,
});

const ResponsiveDialog: React.FC<
  React.ComponentPropsWithRef<typeof Dialog> & {
    mediaQuery?: string;
  }
> = ({ children, mediaQuery = DEFAULT_DESKTOP_MEDIA_QUERY, ...props }) => {
  const isDesktop = useMediaQuery(mediaQuery);
  const DialogComponent = isDesktop ? Dialog : MobileDrawer;

  return (
    <ResponsiveDialogContext.Provider value={{ isDesktop }}>
      <DialogComponent {...props}>{children}</DialogComponent>
    </ResponsiveDialogContext.Provider>
  );
};

const ResponsiveDialogContent = ({
  ...props
}: React.ComponentPropsWithRef<typeof DesktopDialogContent>) => {
  const { isDesktop } = React.useContext(ResponsiveDialogContext);

  if (isDesktop) {
    return <DesktopDialogContent {...props} />;
  }
  return <MobileDrawerContent {...props} />;
};
ResponsiveDialogContent.displayName = "ResponsiveDialogContent";

const ResponsiveDialogOverlay = ({
  ...props
}: React.ComponentPropsWithRef<typeof DialogOverlay>) => {
  const { isDesktop } = React.useContext(ResponsiveDialogContext);

  if (isDesktop) {
    return <DialogOverlay {...props} />;
  }
  return <MobileDrawerOverlay {...props} />;
};
ResponsiveDialogOverlay.displayName = "ResponsiveDialogOverlay";

const ResponsiveDialogHeader = (props: React.ComponentPropsWithRef<"div">) => {
  const { isDesktop } = React.useContext(ResponsiveDialogContext);

  if (isDesktop) {
    return <DesktopDialogHeader {...props} />;
  }
  return <MobileDrawerHeader {...props} />;
};
ResponsiveDialogHeader.displayName = "ResponsiveDialogHeader";

const ResponsiveDialogFooter = (props: React.ComponentPropsWithRef<"div">) => {
  const { isDesktop } = React.useContext(ResponsiveDialogContext);

  if (isDesktop) {
    return <DesktopDialogFooter {...props} />;
  }
  return <MobileDrawerFooter {...props} />;
};
ResponsiveDialogFooter.displayName = "ResponsiveDialogFooter";

const ResponsiveDialogTitle = ({
  ...props
}: React.ComponentPropsWithRef<typeof DesktopDialogTitle>) => {
  const { isDesktop } = React.useContext(ResponsiveDialogContext);

  if (isDesktop) {
    return <DesktopDialogTitle {...props} />;
  }
  return <MobileDrawerTitle {...props} />;
};
ResponsiveDialogTitle.displayName = "ResponsiveDialogTitle";

const ResponsiveDialogDescription = ({
  ...props
}: React.ComponentPropsWithRef<typeof DesktopDialogDescription>) => {
  const { isDesktop } = React.useContext(ResponsiveDialogContext);

  if (isDesktop) {
    return <DesktopDialogDescription {...props} />;
  }
  return <MobileDrawerDescription {...props} />;
};
ResponsiveDialogDescription.displayName = "ResponsiveDialogDescription";

const ResponsiveDialogClose = DialogClose;
const ResponsiveDialogPortal = DialogPortal;
const ResponsiveDialogTrigger = DialogTrigger;

export {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogOverlay,
  ResponsiveDialogPortal,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
};
