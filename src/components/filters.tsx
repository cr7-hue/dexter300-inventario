"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter as FilterIcon, ListFilter, ArrowUpNarrowWide, ArrowDownWideNarrow, CalendarClock } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
}

interface FiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (categoryValue: string) => void;
  categoryFilterOptions: FilterOption[];
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: string;
  onSortOrderChange: (value: string) => void;
}

export function Filters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categoryFilterOptions,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: FiltersProps) {
  return (
    <div className="mb-6 glass glow-card rounded-2xl p-4 sm:p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Buscar producto o tienda..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-secondary/40 border-border/50 focus-visible:ring-primary/50 focus-visible:bg-secondary/60"
            aria-label="Buscar por nombre de producto o tienda"
          />
        </div>
        <div className="relative">
          <FilterIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="pl-10 h-11 rounded-xl bg-secondary/40 border-border/50" aria-label="Filtrar por categoría">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent className="glass-strong rounded-xl border-border/60">
              {categoryFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="rounded-lg">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="relative">
          {sortBy === 'lastPriceCheck'
            ? <CalendarClock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
            : <ListFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />}
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="pl-10 h-11 rounded-xl bg-secondary/40 border-border/50" aria-label="Ordenar por">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent className="glass-strong rounded-xl border-border/60">
              <SelectItem value="default" className="rounded-lg">Relevancia (defecto)</SelectItem>
              <SelectItem value="name" className="rounded-lg">Nombre Producto</SelectItem>
              <SelectItem value="price" className="rounded-lg">Precio</SelectItem>
              <SelectItem value="storeName" className="rounded-lg">Nombre Tienda</SelectItem>
              <SelectItem value="lastPriceCheck" className="rounded-lg">Última Revisión</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative">
          {sortBy !== 'default' && (
            sortOrder === 'asc'
              ? <ArrowUpNarrowWide className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              : <ArrowDownWideNarrow className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
          )}
          <Select value={sortOrder} onValueChange={onSortOrderChange} disabled={sortBy === "default"}>
            <SelectTrigger className="pl-10 h-11 rounded-xl bg-secondary/40 border-border/50 disabled:opacity-50" disabled={sortBy === "default"} aria-label="Orden de clasificación">
              <SelectValue placeholder="Orden" />
            </SelectTrigger>
            <SelectContent className="glass-strong rounded-xl border-border/60">
              <SelectItem value="asc" className="rounded-lg">Ascendente</SelectItem>
              <SelectItem value="desc" className="rounded-lg">Descendente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
