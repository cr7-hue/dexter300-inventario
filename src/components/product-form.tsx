"use client";

import * as React from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Store, MapPin, LocateFixed, ShoppingCart, Info, Edit, Copy, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/contexts/CategoryContext";

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  price: z.number({
    required_error: "El precio es requerido",
    invalid_type_error: "El precio debe ser un número",
  })
  .min(0.01, "El precio debe ser mayor a 0")
  .multipleOf(0.01, "El precio debe tener máximo 2 decimales"),
  category: z.string().min(1, "La categoría es requerida"),
  storeName: z.string().optional(),
  notes: z.string().optional(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  isPurchased: z.boolean().default(false),
});

export type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  productToEdit?: Product | null;
  initialDataForNew?: ProductFormValues | null;
  onSubmit: (values: ProductFormValues, id?: string) => void;
  onCancel: () => void;
}

export function ProductForm({
  productToEdit,
  initialDataForNew,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const { toast } = useToast();
  const { categories } = useCategories();
  const [isSuggestingCategory, setIsSuggestingCategory] = React.useState(false);
  
  const getDefaultValues = () => {
    if (productToEdit) {
      return {
        name: productToEdit.name,
        price: productToEdit.price,
        category: productToEdit.category,
        storeName: productToEdit.storeName || "",
        notes: productToEdit.notes || "",
        latitude: productToEdit.latitude || null,
        longitude: productToEdit.longitude || null,
        isPurchased: productToEdit.isPurchased || false,
      };
    }
    if (initialDataForNew) {
      return { ...initialDataForNew };
    }
    return {
      name: "",
      price: undefined,
      category: categories.length > 0 ? categories[0] : "",
      storeName: "",
      notes: "",
      latitude: null,
      longitude: null,
      isPurchased: false,
    };
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });
  
  React.useEffect(() => {
    form.reset(getDefaultValues());
  }, [productToEdit, initialDataForNew, categories, form]);

  const productName = form.watch("name");

  const handleSuggestCategory = async () => {
    const name = form.getValues("name");
    if (!name?.trim()) return;
    setIsSuggestingCategory(true);
    try {
      const res = await fetch("/api/ai/suggest-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: name }),
      });
      if (res.ok) {
        const { category } = await res.json();
        form.setValue("category", category);
        toast({ title: "Categoría sugerida", description: category });
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "No se pudo sugerir la categoría." });
    } finally {
      setIsSuggestingCategory(false);
    }
  };

  const handleSubmit = (values: ProductFormValues) => {
    const processedValues: ProductFormValues = {
      ...values,
      price: Number(values.price) || 0,
      storeName: values.storeName?.trim() === "" ? undefined : values.storeName,
      latitude: values.latitude === undefined || values.latitude === null || isNaN(Number(values.latitude)) ? null : Number(values.latitude),
      longitude: values.longitude === undefined || values.longitude === null || isNaN(Number(values.longitude)) ? null : Number(values.longitude),
    };
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
                <FormLabel htmlFor="product-name">Nombre</FormLabel>
                <FormControl>
                  <Input id="product-name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="product-price">Precio</FormLabel>
                <FormControl>
                  <Input
                    id="product-price"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0.01"
                    placeholder="Ingresa el precio"
                    {...field}
                    value={field.value === undefined ? '' : field.value}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        field.onChange(undefined);
                      } else {
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue)) {
                          // Redondear a 2 decimales
                          field.onChange(Math.round(numValue * 100) / 100);
                        }
                      }
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Ingresa el precio con hasta 2 decimales (ejemplo: 9.99)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel htmlFor="product-category">Categoría</FormLabel>
                  {productName?.trim() && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleSuggestCategory}
                      disabled={isSuggestingCategory}
                      className="h-6 text-xs text-primary hover:bg-primary/10 px-2"
                    >
                      {isSuggestingCategory
                        ? <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        : <Sparkles className="h-3 w-3 mr-1" />}
                      Sugerir con IA
                    </Button>
                  )}
                </div>
                <Select
                  name="category"
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
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
          <FormField
            control={form.control}
            name="storeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="product-store">Tienda</FormLabel>
                <FormControl>
                  <Input id="product-store" {...field} />
                </FormControl>
                <FormDescription>
                  Opcional: Nombre de la tienda o mercado
                </FormDescription>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="product-latitude">Latitud</FormLabel>
                    <FormControl>
                      <Input
                        id="product-latitude"
                        type="number"
                        step="any"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                        }
                      />
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
                    <FormLabel htmlFor="product-longitude">Longitud</FormLabel>
                    <FormControl>
                      <Input
                        id="product-longitude"
                        type="number"
                        step="any"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="product-notes">Notas</FormLabel>
                <FormControl>
                  <Textarea id="product-notes" {...field} />
                </FormControl>
                <FormDescription>
                  Opcional: Agrega notas o comentarios sobre el producto
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isPurchased"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    id="product-purchased"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel htmlFor="product-purchased">
                    Marcar como comprado
                  </FormLabel>
                  <FormDescription>
                    Indica si ya has comprado este producto
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
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
