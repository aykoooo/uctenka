"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CATEGORY_LIST } from "@/lib/constants/categories";
import { Search, X } from "lucide-react";
import type { ReceiptFilters } from "@/lib/data";
import { UploadReceiptDialog } from "./upload-receipt-dialog";

interface ReceiptsToolbarProps {
    filters: ReceiptFilters;
    onFiltersChange: (filters: ReceiptFilters) => void;
}

export function ReceiptsToolbar({ filters, onFiltersChange }: ReceiptsToolbarProps) {
    const hasActiveFilters = filters.search || filters.categoryId || filters.status;

    const updateFilter = (key: keyof ReceiptFilters, value: string | null | undefined) => {
        onFiltersChange({ ...filters, [key]: value || undefined });
    };

    const resetFilters = () => {
        onFiltersChange({});
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Hledat obchod nebo firmu…"
                    value={filters.search ?? ""}
                    onChange={(e) => updateFilter("search", e.target.value)}
                    className="pl-9"
                />
            </div>

            <Select
                value={filters.categoryId ?? "all"}
                onValueChange={(v) => updateFilter("categoryId", v === "all" ? undefined : v)}
            >
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Kategorie" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Všechny kategorie</SelectItem>
                    {CATEGORY_LIST.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                            {cat.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={filters.status ?? "all"}
                onValueChange={(v) => updateFilter("status", v === "all" ? undefined : v)}
            >
                <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Stav" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Všechny stavy</SelectItem>
                    <SelectItem value="processed">Zpracováno</SelectItem>
                    <SelectItem value="pending">Čeká</SelectItem>
                    <SelectItem value="error">Chyba</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={filters.sortBy ?? "date"}
                onValueChange={(v) => updateFilter("sortBy", v)}
            >
                <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Řazení" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="date">Datum</SelectItem>
                    <SelectItem value="amount">Částka</SelectItem>
                    <SelectItem value="merchant">Obchod</SelectItem>
                </SelectContent>
            </Select>

            {hasActiveFilters && (
                <Button variant="ghost" size="icon" onClick={resetFilters} className="flex-shrink-0">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Resetovat filtry</span>
                </Button>
            )}

            <div className="flex-1 sm:flex-none flex justify-end">
                <UploadReceiptDialog />
            </div>
        </div>
    );
}
