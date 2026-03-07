import { Badge } from "@/components/ui/badge";
import type { CategoryId } from "@/types/domain";
import { getCategoryById } from "@/lib/constants/categories";

interface CategoryBadgeProps {
    categoryId: CategoryId | null;
}

export function CategoryBadge({ categoryId }: CategoryBadgeProps) {
    const category = getCategoryById(categoryId);

    if (!category) {
        return (
            <Badge variant="outline" className="text-muted-foreground">
                Bez kategorie
            </Badge>
        );
    }

    return (
        <Badge
            variant="outline"
            style={{
                borderColor: category.color,
                color: category.color,
                backgroundColor: `${category.color}10`,
            }}
        >
            {category.label}
        </Badge>
    );
}
