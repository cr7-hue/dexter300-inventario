
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
  selectedCategory: string; // This is the 'value' of the selected option
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
    <div className="mb-8 p-6 bg-card rounded-lg shadow">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por producto o tienda..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            aria-label="Buscar por nombre de producto o tienda"
          />
        </div>
        <div className="relative">
           <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="pl-10" aria-label="Filtrar por categoría">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              {categoryFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="relative">
          {sortBy === 'lastPriceCheck' ? 
            <CalendarClock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" /> :
            <ListFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          }
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="pl-10" aria-label="Ordenar por">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Relevancia (defecto)</SelectItem>
              <SelectItem value="name">Nombre Producto</SelectItem>
              <SelectItem value="price">Precio</SelectItem>
              <SelectItem value="storeName">Nombre Tienda</SelectItem>
              <SelectItem value="lastPriceCheck">Última Revisión</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative">
          {sortBy !== 'default' && (
            sortOrder === 'asc' ? 
              <ArrowUpNarrowWide className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" /> :
              <ArrowDownWideNarrow className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          )}
          <Select value={sortOrder} onValueChange={onSortOrderChange} disabled={sortBy === "default"}>
            <SelectTrigger className="pl-10" disabled={sortBy === "default"} aria-label="Orden de clasificación">
              <SelectValue placeholder="Orden" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascendente</SelectItem>
              <SelectItem value="desc">Descendente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
