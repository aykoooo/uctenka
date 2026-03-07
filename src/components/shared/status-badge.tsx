import { Badge } from "@/components/ui/badge";
import type { ReceiptStatus } from "@/types/domain";

const STATUS_CONFIG: Record<ReceiptStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    processed: { label: "Zpracováno", variant: "default" },
    pending: { label: "Čeká", variant: "secondary" },
    error: { label: "Chyba", variant: "destructive" },
};

interface StatusBadgeProps {
    status: ReceiptStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status];
    return (
        <Badge variant={config.variant}>
            {config.label}
        </Badge>
    );
}
