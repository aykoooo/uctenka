import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Receipt } from "@/types/domain";
import { CategoryBadge } from "@/components/shared/category-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { formatCZK, formatDate } from "@/lib/formatters";
import { CATEGORIES } from "@/lib/constants/categories";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface DetailRowProps {
    label: string;
    value: React.ReactNode;
}

/**
 * Structured detail row component.
 * Designed so individual rows can later be swapped for editable form fields
 * without changing the overall page layout.
 */
function DetailRow({ label, value }: DetailRowProps) {
    return (
        <div className="flex items-start justify-between py-3">
            <span className="text-sm text-muted-foreground flex-shrink-0">{label}</span>
            <span className="text-sm font-medium text-right ml-4">{value ?? "—"}</span>
        </div>
    );
}

interface ReceiptFieldsProps {
    receipt: Receipt;
    isEditing?: boolean;
    onSave?: (updates: Partial<Receipt>) => Promise<void>;
    onCancel?: () => void;
}

export function ReceiptFields({ receipt, isEditing, onSave, onCancel }: ReceiptFieldsProps) {
    const [formData, setFormData] = useState<Partial<Receipt>>({});
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = <K extends keyof Receipt>(field: K, value: Receipt[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!onSave) return;
        setIsSaving(true);
        try {
            await onSave(formData);
        } finally {
            setIsSaving(false);
        }
    };

    if (isEditing) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Upravit detaily</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Obchod / firma</label>
                        <Input
                            value={formData.merchantName ?? receipt.merchantName}
                            onChange={e => handleChange("merchantName", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Název společnosti</label>
                        <Input
                            value={formData.companyName ?? receipt.companyName ?? ""}
                            onChange={e => handleChange("companyName", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">IČO</label>
                        <Input
                            value={formData.ico ?? receipt.ico ?? ""}
                            onChange={e => handleChange("ico", e.target.value)}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">DIČ</label>
                        <Input
                            value={formData.dic ?? receipt.dic ?? ""}
                            onChange={e => handleChange("dic", e.target.value)}
                        />
                    </div>

                    {/* Simplified select for Category */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Kategorie</label>
                        <Select
                            value={formData.categoryId || receipt.categoryId || ""}
                            onValueChange={(val) => handleChange("categoryId", val as Receipt["categoryId"])}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Vyberte kategorii" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(CATEGORIES).map(cat => {
                                    const Icon = cat.icon;
                                    return (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            <div className="flex items-center gap-2">
                                                {typeof Icon === 'string' ? (
                                                    // Fallback if data is miraculously still strings in memory
                                                    <span className="h-4 w-4 inline-block" style={{ color: cat.color }} />
                                                ) : (
                                                    <Icon className="h-4 w-4" style={{ color: cat.color }} />
                                                )}
                                                {cat.label}
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Částka</label>
                        <Input
                            type="number"
                            step="0.01"
                            value={formData.amount ?? receipt.amount ?? ""}
                            onChange={e => handleChange("amount", parseFloat(e.target.value))}
                        />
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Uložit změny
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={onCancel} disabled={isSaving}>
                            Zrušit
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Detail účtenky</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="divide-y">
                    <DetailRow label="Obchod / firma" value={receipt.merchantName} />
                    <DetailRow
                        label="Název společnosti"
                        value={receipt.companyName ?? "—"}
                    />
                    <DetailRow label="IČO" value={receipt.ico ?? "—"} />
                    <DetailRow label="DIČ" value={receipt.dic ?? "—"} />
                    <DetailRow label="Datum" value={formatDate(receipt.date)} />
                    <DetailRow
                        label="Kategorie"
                        value={<CategoryBadge categoryId={receipt.categoryId} />}
                    />
                    <DetailRow label="Částka" value={formatCZK(receipt.amount)} />
                    <DetailRow label="Měna" value={receipt.currency} />
                    <DetailRow
                        label="Stav"
                        value={<StatusBadge status={receipt.status} />}
                    />
                    <DetailRow
                        label="Důvěra rozpoznání"
                        value={
                            <ConfidenceBadge
                                level={receipt.confidenceLevel}
                                showPercentage
                                percentage={receipt.confidence}
                            />
                        }
                    />
                </div>
            </CardContent>
        </Card>
    );
}
