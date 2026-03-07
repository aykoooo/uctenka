import type { Category, CategoryId } from "@/types/domain";
import {
    UtensilsCrossed,
    Car,
    Building2,
    Wrench,
    Monitor,
    Heart,
    Music,
    Shirt,
    Package
} from "lucide-react";

export const CATEGORIES: Record<CategoryId, Category> = {
    food: {
        id: "food",
        label: "Jídlo a nápoje",
        color: "#f97316", // orange
        icon: UtensilsCrossed,
    },
    transport: {
        id: "transport",
        label: "Doprava",
        color: "#3b82f6", // blue
        icon: Car,
    },
    office: {
        id: "office",
        label: "Kancelář",
        color: "#8b5cf6", // violet
        icon: Building2,
    },
    services: {
        id: "services",
        label: "Služby",
        color: "#06b6d4", // cyan
        icon: Wrench,
    },
    electronics: {
        id: "electronics",
        label: "Elektronika",
        color: "#ec4899", // pink
        icon: Monitor,
    },
    health: {
        id: "health",
        label: "Zdraví",
        color: "#10b981", // emerald
        icon: Heart,
    },
    entertainment: {
        id: "entertainment",
        label: "Zábava",
        color: "#f59e0b", // amber
        icon: Music,
    },
    clothing: {
        id: "clothing",
        label: "Oblečení",
        color: "#6366f1", // indigo
        icon: Shirt,
    },
    other: {
        id: "other",
        label: "Ostatní",
        color: "#6b7280", // gray
        icon: Package,
    },
};

export const CATEGORY_LIST: Category[] = Object.values(CATEGORIES);

export function getCategoryById(id: CategoryId | null): Category | null {
    if (!id) return null;
    return CATEGORIES[id] ?? null;
}
