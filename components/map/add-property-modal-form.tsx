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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface AddPropertyModalFormProps extends ButtonProps {
  presetCoordinates?: {
    lat: number;
    lng: number;
  };
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddPropertyModalForm: React.FC<AddPropertyModalFormProps> = ({
  presetCoordinates,
  isOpen,
  onOpenChange,
  ...props
}) => {
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const formSchema = z.object({
    title: z.string().min(1, "Le titre est requis"),
    description: z.string().optional(),

    addressLine: z.string().min(1, "L'adresse est obligatoire."),
    city: z.string().min(1, "La ville est obligatoire."),
    postalCode: z.string().min(1, "Le code postal est obligatoire."),
    suburb: z.string().optional(),

    price: z.coerce.number().min(1, "Le prix est requis"),
    bedrooms: z.coerce.number().min(0).optional(),
    bathrooms: z.coerce.number().min(0).optional(),
    area_sqm: z.coerce.number().min(1, "La surface est requise"),
    property_type: z.string().min(1, "Le type de bien est requis"),
    latitude: z.coerce.number(),
    longitude: z.coerce.number(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      addressLine: "",
      city: "",
      postalCode: "",
      suburb: "",
      price: 0,
      bedrooms: 0,
      bathrooms: 0,
      area_sqm: 0,
      property_type: "",
      latitude: presetCoordinates?.lat || 0,
      longitude: presetCoordinates?.lng || 0,
    },
  });

  // Function to reverse geocode coordinates to address
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setIsLoadingAddress(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      const {
        house_number,
        road,
        town,
        village,
        suburb,
        postcode,
        neighbourhood,
      } = data.address;

      form.setValue(
        "addressLine",
        house_number ? `${house_number} ${road}` : road
      );
      form.setValue("city", town || village);
      form.setValue("postalCode", postcode);
      form.setValue("suburb", suburb || neighbourhood || "");
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Set coordinates and fetch address when preset coordinates are provided
  useEffect(() => {
    if (presetCoordinates && isOpen) {
      form.setValue("latitude", presetCoordinates.lat);
      form.setValue("longitude", presetCoordinates.lng);
      reverseGeocode(presetCoordinates.lat, presetCoordinates.lng);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetCoordinates, isOpen]);

  const onSubmit = async (formValues: z.infer<typeof formSchema>) => {
    try {
      // TODO: Implement actual property creation
      console.log("Creating property with values:", formValues);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Close modal and reset form
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error creating property:", error);
    }
  };

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onOpenChange}>
      <ResponsiveDialogTrigger asChild>
        <Button {...props} />
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            Création d&apos;un bien immobilier
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Remplissez les informations pour créer un nouveau bien immobilier.
            {presetCoordinates && (
              <div className="flex items-center gap-2 mt-2 text-emerald-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">
                  Position: {presetCoordinates.lat.toFixed(4)},{" "}
                  {presetCoordinates.lng.toFixed(4)}
                </span>
              </div>
            )}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <div className="p-4 md:p-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre du bien</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bel appartement T3 avec terrasse"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="addressLine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123 Rue de la Paix, 75001 Paris"
                          {...field}
                          disabled={isLoadingAddress}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="suburb"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quartier</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isLoadingAddress} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code postal</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isLoadingAddress} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isLoadingAddress} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix (€)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="450000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="area_sqm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Surface (m²)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="85" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="property_type"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Type de bien</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionnez un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="maison">Maison</SelectItem>
                          <SelectItem value="appartement">
                            Appartement
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Décrivez les caractéristiques du bien..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hidden coordinate fields */}
              <div className="hidden">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="hidden" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="hidden" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
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
            Créer le bien
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};

export default AddPropertyModalForm;
