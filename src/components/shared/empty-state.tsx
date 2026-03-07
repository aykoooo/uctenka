import { FileQuestion } from "lucide-react";

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                {icon ?? <FileQuestion className="h-8 w-8 text-muted-foreground" />}
            </div>
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="text-muted-foreground mt-1 max-w-sm">{description}</p>
        </div>
    );
}
