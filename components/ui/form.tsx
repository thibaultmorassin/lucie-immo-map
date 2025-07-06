"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { Info } from "lucide-react";
import * as React from "react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

const FormItem = ({
  className,
  ...props
}: React.ComponentPropsWithRef<"div">) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn("flex flex-col gap-2", className)} {...props} />
    </FormItemContext.Provider>
  );
};
FormItem.displayName = "FormItem";

const FormLabel = ({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof LabelPrimitive.Root>) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      className={cn(error && "text-error", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
};
FormLabel.displayName = "FormLabel";

const FormControl = ({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof Slot>) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      className={cn(className, {
        "shadow-border-error focus:shadow-focus-error": !!error,
      })}
      aria-invalid={!!error}
      {...props}
    />
  );
};
FormControl.displayName = "FormControl";

const FormDescription = ({
  className,
  children,
  hideIcon,
  ...props
}: React.ComponentPropsWithRef<"p"> & {
  hideIcon?: boolean;
}) => {
  const { formDescriptionId } = useFormField();

  return (
    <div
      id={formDescriptionId}
      className={cn(
        "text-neutral grid grid-cols-[auto_1fr] gap-1 text-sm",
        hideIcon && "grid-cols-1",
        className
      )}
      {...props}
    >
      {!hideIcon && <Info size={16} className="relative top-0.5" />}
      {children}
    </div>
  );
};
FormDescription.displayName = "FormDescription";

const FormMessage = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithRef<"p">) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      id={formMessageId}
      className={cn(
        "text-error spring-bounce-20 spring-duration-300 animate-in fade-in slide-in-from-top blur-from-1 text-sm font-medium",
        className
      )}
      {...props}
    >
      {body}
    </p>
  );
};
FormMessage.displayName = "FormMessage";

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
};
