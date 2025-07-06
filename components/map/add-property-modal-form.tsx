"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const AddPropertyModalForm: React.FC<ButtonProps> = ({ ...props }) => {
  const formSchema = z.object({
    tradingName: z.string({
      required_error: "Le nom commercial est requis.",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { tradingName: "" },
  });

  const onSubmit = async (formValues: z.infer<typeof formSchema>) => {
    if (!formValues.tradingName) {
      form.setError("tradingName", {
        type: "manual",
        message: "Le nom commercial est requis.",
      });
      return;
    }

    await new Promise((resolve, reject) => {
      // commitMutation({
      //   variables: {
      //     input: {
      //       tradingName: formValues.tradingName,
      //     },
      //   },
      //   onCompleted: (data) => {
      //     toast.success(t("Émetteur créé avec succès."));
      //     router.push(`/admin/issuer/${data.createIssuer.issuer.slug}`);
      //     resolve(true);
      //   },
      //   onError: (error) => {
      //     toast.error(
      //       t(
      //         "Une erreur est survenue lors de la création de l'émetteur. Veuillez réessayer."
      //       ),
      //       {
      //         description: t(error.message),
      //         action: {
      //           label: t("Réessayer"),
      //           onClick: () => form.handleSubmit(onSubmit)(),
      //         },
      //       }
      //     );
      //     reject();
      //   },
      // });
    });
  };

  return (
    <ResponsiveDialog>
      <ResponsiveDialogTrigger asChild>
        <Button {...props} />
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            Création d&apos;un bien immobilier
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Vous vous apprétez à créer un bien immobilier à partir du compte de
            l&apos;utilisateur sélectionné.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <div className="p-4 md:p-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="tradingName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom commercial de l&apos;émetteur</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Lise"
                        type="text"
                        autoComplete="false"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <ResponsiveDialogFooter>
          <ResponsiveDialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </ResponsiveDialogClose>
          <Button
            endIcon={<ArrowUpRight />}
            isLoading={form.formState.isSubmitting}
            onClick={() => form.handleSubmit(onSubmit)()}
          >
            Confirmer
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};

export default AddPropertyModalForm;
