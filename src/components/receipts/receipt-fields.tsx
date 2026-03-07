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
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

type EditableReceiptField = keyof Pick<Receipt, "merchantName" | "companyName" | "ico" | "dic" | "date" | "categoryId" | "amount">;

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
    onSkip?: () => Promise<void> | void;
    visibleFields?: EditableReceiptField[];
    title?: string;
    saveLabel?: string;
    cancelLabel?: string;
    skipLabel?: string;
}

export function ReceiptFields({
    receipt,
    isEditing,
    onSave,
    onCancel,
    onSkip,
    visibleFields,
    title = "Upravit detaily",
    saveLabel = "Uložit změny",
    cancelLabel = "Zrušit",
    skipLabel = "Přeskočit pole",
}: ReceiptFieldsProps) {
    const [formData, setFormData] = useState<Partial<Receipt>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData({});
    }, [receipt.id, isEditing, visibleFields]);

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

    const showField = (field: EditableReceiptField) => {
        if (!visibleFields || visibleFields.length === 0) {
            return true;
        }

        return visibleFields.includes(field);
    };

    const formattedDateValue =
        formData.date instanceof Date
            ? `${formData.date.getFullYear()}-${String(formData.date.getMonth() + 1).padStart(2, "0")}-${String(formData.date.getDate()).padStart(2, "0")}`
            : receipt.date
                ? `${receipt.date.getFullYear()}-${String(receipt.date.getMonth() + 1).padStart(2, "0")}-${String(receipt.date.getDate()).padStart(2, "0")}`
                : "";

    if (isEditing) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <form
                        className="space-y-4"
                        onSubmit={async (event) => {
                            event.preventDefault();
                            await handleSave();
                        }}
                    >
                    {showField("merchantName") && (
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Obchod / firma</label>
                            <Input
                                value={formData.merchantName ?? receipt.merchantName}
                                onChange={e => handleChange("merchantName", e.target.value)}
                            />
                        </div>
                    )}
                    {showField("companyName") && (
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Název společnosti</label>
                            <Input
                                value={formData.companyName ?? receipt.companyName ?? ""}
                                onChange={e => handleChange("companyName", e.target.value)}
                            />
                        </div>
                    )}
                    {showField("ico") && (
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">IČO</label>
                            <Input
                                value={formData.ico ?? receipt.ico ?? ""}
                                onChange={e => handleChange("ico", e.target.value)}
                            />
                        </div>
                    )}
                    {showField("dic") && (
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">DIČ</label>
                            <Input
                                value={formData.dic ?? receipt.dic ?? ""}
                                onChange={e => handleChange("dic", e.target.value)}
                            />
                        </div>
                    )}

                    {showField("date") && (
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Datum</label>
                            <Input
                                type="date"
                                value={formattedDateValue}
                                onChange={e => handleChange("date", e.target.value ? new Date(e.target.value) : null)}
                            />
                        </div>
                    )}

                    {/* Simplified select for Category */}
                    {showField("categoryId") && (
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
                                                    {typeof Icon === "string" ? (
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
                    )}

                    {showField("amount") && (
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Částka</label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.amount ?? receipt.amount ?? ""}
                                onChange={e => handleChange("amount", e.target.value === "" ? null : parseFloat(e.target.value))}
                            />
                        </div>
                    )}

                    <div className="flex gap-2 pt-4">
                        <Button className="flex-1" type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {saveLabel}
                        </Button>
                        {onSkip && (
                            <Button
                                variant="secondary"
                                className="flex-1"
                                type="button"
                                onClick={() => {
                                    void onSkip();
                                }}
                                disabled={isSaving}
                            >
                                {skipLabel}
                            </Button>
                        )}
                        <Button variant="outline" className="flex-1" type="button" onClick={onCancel} disabled={isSaving}>
                            {cancelLabel}
                        </Button>
                    </div>
                    </form>
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
                    <DetailRow label="Částka" value={formatCZK(receipt.amount, receipt.currency)} />
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
