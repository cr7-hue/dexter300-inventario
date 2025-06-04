
"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { Product, ProductCategory } from "@/types";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Store, MapPin, LocateFixed, ShoppingCart, Info, Edit, Copy } from "lucide-react"; // Added Copy
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre del producto debe tener al menos 2 caracteres.",
  }),
  price: z.coerce.number().positive({
    message: "El precio debe ser un número positivo.",
  }),
  category: z.string().min(1, {
    message: "Por favor selecciona una categoría válida.",
  }),
  storeName: z.string().optional(),
  latitude: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : parseFloat(String(val))),
    z.coerce.number().min(-90, "Latitud inválida").max(90, "Latitud inválida").optional().nullable()
  ),
  longitude: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : parseFloat(String(val))),
    z.coerce.number().min(-180, "Longitud inválida").max(180, "Longitud inválida").optional().nullable()
  ),
  notes: z.string().optional(),
  isPurchased: z.boolean().optional().default(false),
});

export type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  productToEdit?: Product | null;
  initialDataForNew?: ProductFormValues | null; // New prop for pre-filling new/duplicated product
  userCategories: ProductCategory[];
  onSubmit: (values: ProductFormValues, id?: string) => void;
  onCancel: () => void;
}

export function ProductForm({ productToEdit, initialDataForNew, userCategories, onSubmit, onCancel }: ProductFormProps) {
  const { toast } = useToast();
  
  const getDefaultValues = () => {
    if (productToEdit) {
      return {
        name: productToEdit.name,
        price: productToEdit.price,
        category: productToEdit.category,
        storeName: productToEdit.storeName || "",
        latitude: productToEdit.latitude ?? undefined,
        longitude: productToEdit.longitude ?? undefined,
        notes: productToEdit.notes || "",
        isPurchased: productToEdit.isPurchased || false,
      };
    }
    if (initialDataForNew) {
      return { ...initialDataForNew };
    }
    return {
      name: "",
      price: 0,
      category: userCategories.length > 0 ? userCategories[0] : "",
      storeName: "",
      latitude: undefined,
      longitude: undefined,
      notes: "",
      isPurchased: false,
    };
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });
  
  React.useEffect(() => {
    form.reset(getDefaultValues());
  }, [productToEdit, initialDataForNew, userCategories, form]); // Added form to dependencies


  const handleSubmit = (values: ProductFormValues) => {
    const processedValues = {
      ...values,
      storeName: values.storeName?.trim() === "" ? undefined : values.storeName,
      latitude: values.latitude === undefined || values.latitude === null || isNaN(Number(values.latitude)) ? undefined : Number(values.latitude),
      longitude: values.longitude === undefined || values.longitude === null || isNaN(Number(values.longitude)) ? undefined : Number(values.longitude),
    };
    // If productToEdit exists, it's an edit. Otherwise, it's a new product (could be from duplication or fresh).
    onSubmit(processedValues, productToEdit?.id);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocalización no soportada",
        description: "Tu navegador no soporta la geolocalización.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        form.setValue("latitude", parseFloat(latitude.toFixed(6)));
        form.setValue("longitude", parseFloat(longitude.toFixed(6)));
        toast({
          title: "Ubicación Obtenida",
          description: "Latitud y longitud actualizadas.",
        });
      },
      (error) => {
        let description = "Ocurrió un error al obtener la ubicación.";
        if (error.code === error.PERMISSION_DENIED) {
          description = "Permiso de geolocalización denegado. Por favor, actívalo en los ajustes de tu navegador.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          description = "Información de ubicación no disponible.";
        } else if (error.code === error.TIMEOUT) {
          description = "Se agotó el tiempo de espera para obtener la ubicación.";
        }
        toast({
          variant: "destructive",
          title: "Error de Geolocalización",
          description: description,
        });
      }
    );
  };
  
  const isDuplicating = !!initialDataForNew && !productToEdit;
  const dialogTitleIcon = productToEdit ? <Edit className="mr-2 h-5 w-5" /> : (isDuplicating ? <Copy className="mr-2 h-5 w-5" /> : <Info className="mr-2 h-5 w-5" />);
  const dialogTitleText = productToEdit ? "Editar Precio/Producto" : (isDuplicating ? "Duplicar Producto" : "Agregar Nuevo Precio/Producto");
  const dialogDescriptionText = productToEdit ? "Modifica los detalles del producto y su precio." : (isDuplicating ? "Revisa y ajusta los detalles del producto duplicado." : "Completa la información para registrar un nuevo precio.");
  const submitButtonText = productToEdit ? "Guardar Cambios" : (isDuplicating ? "Guardar Duplicado" : "Agregar Producto");


  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center">
         {dialogTitleIcon}
         {dialogTitleText}
        </DialogTitle>
        <DialogDescription>
          {dialogDescriptionText}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-3 pl-1">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Producto</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Leche Entera 1L" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio (€)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="Ej: 0.99" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {userCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-4 p-4 border rounded-lg bg-card shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground -mb-1">Tienda y Ubicación</h3>
            <FormField
              control={form.control}
              name="storeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-sm"><Store className="mr-2 h-4 w-4 text-muted-foreground" /> Nombre de la Tienda (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Supermercado Día" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                  <FormLabel className="flex items-center text-sm"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" /> Coordenadas (Lat/Lon)</FormLabel>
                  <Button type="button" variant="outline" size="sm" onClick={handleGetCurrentLocation} className="text-xs">
                    <LocateFixed className="mr-1.5 h-3.5 w-3.5" />
                    Obtener Actual
                  </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="number" step="any" placeholder="Latitud (Ej: 40.41)" {...field} onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="number" step="any" placeholder="Longitud (Ej: -3.70)" {...field} onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))} value={field.value ?? ''}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 border rounded-lg bg-card shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground -mb-1">Información Adicional</h3>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Oferta 3x2, Válido hasta fin de mes, etc."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPurchased"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm bg-background hover:bg-muted/50 transition-colors">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="isPurchased"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel htmlFor="isPurchased" className="flex items-center cursor-pointer text-sm">
                      <ShoppingCart className="mr-2 h-4 w-4 text-muted-foreground" />
                       Marcar como comprado
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">{submitButtonText}</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
