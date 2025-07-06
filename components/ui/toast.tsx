"use client";

import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group [&[data-description]]:text-neutral"
      offset={72}
      duration={50000}
      icons={{
        success: <CircleCheck className="text-success-400" />,
        info: <Info className="text-primary-500" />,
        warning: <TriangleAlert className="text-warning-500" />,
        error: <CircleX className="text-error" />,
        loading: <span className="loading relative top-0.5 left-0.5 h-5 w-5" />,
      }}
      toastOptions={{
        classNames: {
          icon: "w-5!",
          description: "text-neutral!",
        },
      }}
      position="top-right"
      closeButton
      {...props}
    />
  );
};

export { Toaster };
