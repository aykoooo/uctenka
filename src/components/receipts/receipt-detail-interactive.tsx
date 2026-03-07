"use client";

import { useMemo, useState } from "react";
import type { Receipt } from "@/types/domain";
import { ReceiptDetailHeader } from "./receipt-detail-header";
import { ReceiptImage } from "./receipt-image";
import { ReceiptFields } from "./receipt-fields";
import { ReceiptRawData } from "./receipt-raw-data";
import { useRouter } from "next/navigation";
import { updateReceiptAction } from "@/app/actions";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/shared/toast-provider";

type ReviewEditableField = "merchantName" | "date" | "amount" | "categoryId";

interface ReceiptDetailInteractiveProps {
    initialReceipt: Receipt;
    startInReviewMode?: boolean;
}

function getReviewFields(receipt: Receipt): ReviewEditableField[] {
    const fields: ReviewEditableField[] = [];

    for (const issue of receipt.reviewIssues) {
        switch (issue.type) {
            case "missing_merchant":
                if (!fields.includes("merchantName")) fields.push("merchantName");
                break;
            case "missing_date":
                if (!fields.includes("date")) fields.push("date");
                break;
            case "missing_amount":
                if (!fields.includes("amount")) fields.push("amount");
                break;
            case "missing_category":
                if (!fields.includes("categoryId")) fields.push("categoryId");
                break;
            case "low_confidence":
                if (!fields.includes("merchantName")) fields.push("merchantName");
                if (!fields.includes("date")) fields.push("date");
                if (!fields.includes("amount")) fields.push("amount");
                break;
        }
    }

    return fields;
}

const FIELD_LABELS: Record<ReviewEditableField, string> = {
    merchantName: "Obchod / firma",
    date: "Datum",
    amount: "Částka",
    categoryId: "Kategorie",
};

export function ReceiptDetailInteractive({ initialReceipt, startInReviewMode = false }: ReceiptDetailInteractiveProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [receipt, setReceipt] = useState<Receipt>(initialReceipt);
    const [isEditing, setIsEditing] = useState(startInReviewMode);
    const [isSaving, setIsSaving] = useState(false);
    const [reviewQueue, setReviewQueue] = useState<ReviewEditableField[]>(
        startInReviewMode ? getReviewFields(initialReceipt) : []
    );

    const isReviewMode = startInReviewMode;
    const currentReviewField = isReviewMode ? reviewQueue[0] : null;
    const totalReviewFields = useMemo(() => getReviewFields(initialReceipt).length, [initialReceipt]);
    const doneReviewFields = isReviewMode ? totalReviewFields - reviewQueue.length : 0;

    const handleSave = async (updates: Partial<Receipt>) => {
        setIsSaving(true);
        try {
            let payload = updates;

            if (isReviewMode && currentReviewField) {
                const hasCurrentField = Object.prototype.hasOwnProperty.call(updates, currentReviewField);
                if (!hasCurrentField) {
                    payload = {
                        ...updates,
                        [currentReviewField]: receipt[currentReviewField],
                    };
                }
            }

            const updated = await updateReceiptAction(receipt.id, payload);
            setReceipt(updated);
            showToast("Uloženo", "success");

            if (isReviewMode) {
                const nextQueue = getReviewFields(updated);
                setReviewQueue(nextQueue);

                if (nextQueue.length === 0) {
                    router.push("/review");
                    return;
                }

                setIsEditing(true);
                return;
            }

            setIsEditing(false);
            router.refresh();
        } catch (error) {
            console.error("Uložení účtenky selhalo", error);
            showToast("Uložení se nepovedlo. Zkuste to prosím znovu.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSkipField = async () => {
        if (!isReviewMode || !currentReviewField || isSaving) {
            return;
        }

        showToast(`Pole „${FIELD_LABELS[currentReviewField]}“ přeskočeno`, "info");
        setReviewQueue((previous) => previous.slice(1));

        if (reviewQueue.length <= 1) {
            router.push("/review");
        }
    };

    const reviewTitle = currentReviewField
        ? `Kontrola pole: ${FIELD_LABELS[currentReviewField]}`
        : "Kontrola účtenky";

    return (
        <>
            <ReceiptDetailHeader
                receipt={receipt}
                isEditing={isEditing}
                onEditToggle={() => setIsEditing(!isEditing)}
                isSaving={isSaving}
                backHref={isReviewMode ? "/review" : "/receipts"}
                backLabel={isReviewMode ? "Zpět ke kontrole" : "Zpět na účtenky"}
                hideEditButton={isReviewMode}
            />

            {isReviewMode && currentReviewField && (
                <Card className="mb-6">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Kontrola problematických polí</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Krok {doneReviewFields + 1} z {Math.max(totalReviewFields, 1)} · upravte nebo potvrďte pole a pokračujte dál.
                    </CardContent>
                </Card>
            )}

            {isReviewMode && !currentReviewField && (
                <Card className="mb-6">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Kontrola dokončena</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Tato účtenka už nemá pole k ruční kontrole.
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-2 mb-6">
                <ReceiptImage
                    imageUrl={receipt.imageUrl}
                    merchantName={receipt.merchantName}
                />
                <ReceiptFields
                    receipt={receipt}
                    isEditing={isEditing}
                    onSave={handleSave}
                    onCancel={() => {
                        if (isReviewMode) {
                            router.push("/review");
                            return;
                        }

                        setIsEditing(false);
                    }}
                    visibleFields={currentReviewField ? [currentReviewField] : undefined}
                    title={isReviewMode ? reviewTitle : "Upravit detaily"}
                    saveLabel={isReviewMode ? (reviewQueue.length === 1 ? "Dokončit kontrolu" : "Uložit a pokračovat") : "Uložit změny"}
                    cancelLabel={isReviewMode ? "Přerušit kontrolu" : "Zrušit"}
                    onSkip={isReviewMode ? handleSkipField : undefined}
                    skipLabel="Přeskočit pole"
                />
            </div>

            <ReceiptRawData receipt={receipt} />
        </>
    );
}
