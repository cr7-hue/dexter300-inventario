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
import type { Product } from "@/types";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { MapPin, LocateFixed, ShoppingCart, Info, Edit, Copy, Sparkles, Loader2, Tag, DollarSign, Store, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/contexts/CategoryContext";
import { cn } from "@/lib/utils";

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

const inputClass = "h-11 rounded-xl bg-secondary/40 border-border/50 focus-visible:ring-primary/50 focus-visible:ring-offset-0 focus-visible:bg-secondary/60 transition-colors";
const labelClass = "text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productToEdit, initialDataForNew, categories]);

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
      latitude: values.latitude == null || isNaN(Number(values.latitude)) ? null : Number(values.latitude),
      longitude: values.longitude == null || isNaN(Number(values.longitude)) ? null : Number(values.longitude),
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
  const dialogTitleIcon = productToEdit ? <Edit className="h-4 w-4 text-white" /> : (isDuplicating ? <Copy className="h-4 w-4 text-white" /> : <Info className="h-4 w-4 text-white" />);
  const dialogTitleText = productToEdit ? "Editar Producto" : (isDuplicating ? "Duplicar Producto" : "Nuevo Producto");
  const dialogDescriptionText = productToEdit ? "Modifica los detalles del producto y su precio." : (isDuplicating ? "Revisa y ajusta los detalles del producto duplicado." : "Completa la información para registrar un nuevo precio.");
  const submitButtonText = productToEdit ? "Guardar Cambios" : (isDuplicating ? "Guardar Duplicado" : "Agregar Producto");

  return (
    <>
      <DialogHeader className="pb-2">
        <DialogTitle className="flex items-center text-base">
          <div className="h-9 w-9 rounded-xl gradient-violet flex items-center justify-center mr-3 shadow-lg shadow-primary/30 shrink-0">
            {dialogTitleIcon}
          </div>
          <span className="gradient-text font-bold text-lg">{dialogTitleText}</span>
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground pl-12">
          {dialogDescriptionText}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-3 max-h-[70vh] overflow-y-auto pr-2 -mr-2">
          {/* Nombre */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="product-name" className={cn(labelClass, "flex items-center gap-1.5")}>
                  <Tag className="h-3 w-3" /> Nombre
                </FormLabel>
                <FormControl>
                  <Input id="product-name" placeholder="Ej: Leche Entera 1L" {...field} className={inputClass} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Precio - destacado */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="product-price" className={cn(labelClass, "flex items-center gap-1.5")}>
                  <DollarSign className="h-3 w-3" /> Precio
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium pointer-events-none">$</span>
                    <Input
                      id="product-price"
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      {...field}
                      value={field.value === undefined ? '' : field.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          field.onChange(undefined);
                        } else {
                          const numValue = parseFloat(value);
                          if (!isNaN(numValue)) {
                            field.onChange(Math.round(numValue * 100) / 100);
                          }
                        }
                      }}
                      className={cn(inputClass, "pl-8 text-lg font-semibold tabular")}
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-[11px] text-muted-foreground/80">
                  Hasta 2 decimales (ej: 9.99)
                </FormDescription>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Categoría */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel htmlFor="product-category" className={cn(labelClass, "flex items-center gap-1.5")}>
                    <FileText className="h-3 w-3" /> Categoría
                  </FormLabel>
                  {productName?.trim() && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSuggestCategory}
                      disabled={isSuggestingCategory}
                      className="h-7 text-[11px] gradient-violet-gold border-0 text-white hover:opacity-90 px-2.5 rounded-lg shadow shadow-amber-500/20"
                    >
                      {isSuggestingCategory
                        ? <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        : <Sparkles className="h-3 w-3 mr-1" />}
                      Sugerir IA
                    </Button>
                  )}
                </div>
                <Select
                  name="category"
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong rounded-xl border-border/60 max-h-72">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category} className="rounded-lg">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Tienda */}
          <FormField
            control={form.control}
            name="storeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="product-store" className={cn(labelClass, "flex items-center gap-1.5")}>
                  <Store className="h-3 w-3" /> Tienda
                </FormLabel>
                <FormControl>
                  <Input id="product-store" placeholder="Opcional" {...field} className={inputClass} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Coordenadas - card interna glass */}
          <div className="glass rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className={cn(labelClass, "flex items-center gap-1.5")}>
                <MapPin className="h-3 w-3" /> Coordenadas
              </span>
              <Button
                type="button"
                size="sm"
                onClick={handleGetCurrentLocation}
                className="h-7 text-[11px] rounded-lg bg-primary/15 text-primary hover:bg-primary/25 border-0 px-2.5"
              >
                <LocateFixed className="mr-1 h-3 w-3" />
                Mi ubicación
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="product-latitude" className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">Latitud</FormLabel>
                    <FormControl>
                      <Input
                        id="product-latitude"
                        type="number"
                        step="any"
                        placeholder="—"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                        }
                        className={cn(inputClass, "h-10 text-sm tabular")}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="product-longitude" className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">Longitud</FormLabel>
                    <FormControl>
                      <Input
                        id="product-longitude"
                        type="number"
                        step="any"
                        placeholder="—"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                        }
                        className={cn(inputClass, "h-10 text-sm tabular")}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Notas */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="product-notes" className={cn(labelClass, "flex items-center gap-1.5")}>
                  <FileText className="h-3 w-3" /> Notas
                </FormLabel>
                <FormControl>
                  <Textarea
                    id="product-notes"
                    placeholder="Comentarios o detalles adicionales (opcional)"
                    {...field}
                    className={cn(inputClass, "min-h-[80px] py-2.5 resize-none")}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Comprado - card interna */}
          <FormField
            control={form.control}
            name="isPurchased"
            render={({ field }) => (
              <FormItem className={cn(
                "flex flex-row items-center gap-3 rounded-2xl p-4 transition-colors",
                field.value
                  ? "bg-primary/15 border border-primary/30"
                  : "glass"
              )}>
                <FormControl>
                  <Checkbox
                    id="product-purchased"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="h-5 w-5 rounded-md border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-white"
                  />
                </FormControl>
                <div className="flex-1 space-y-0.5">
                  <FormLabel htmlFor="product-purchased" className="flex items-center gap-1.5 text-sm font-semibold cursor-pointer">
                    <ShoppingCart className="h-3.5 w-3.5 text-primary" />
                    Marcar como comprado
                  </FormLabel>
                  <FormDescription className="text-[11px] text-muted-foreground/80">
                    Indica si ya has adquirido este producto
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <DialogFooter className="pt-4 gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="h-11 rounded-xl bg-secondary/50 hover:bg-secondary order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="h-11 rounded-xl gradient-violet glow-primary border-0 text-white font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform order-1 sm:order-2"
            >
              {submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
