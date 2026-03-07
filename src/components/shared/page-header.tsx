import { ThemeToggle } from "@/components/shared/theme-toggle";

interface PageHeaderProps {
    title: string;
    subtitle: string;
    showThemeToggle?: boolean;
}

export function PageHeader({ title, subtitle, showThemeToggle = false }: PageHeaderProps) {
    return (
        <div className="flex items-start justify-between gap-4 mb-8">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                <p className="text-muted-foreground mt-1">{subtitle}</p>
            </div>
            {showThemeToggle && <ThemeToggle />}
        </div>
    );
}
