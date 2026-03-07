"use client";

import { useState } from "react";
import type { Receipt } from "@/types/domain";
import { ReceiptDetailHeader } from "./receipt-detail-header";
import { ReceiptImage } from "./receipt-image";
import { ReceiptFields } from "./receipt-fields";
import { ReceiptRawData } from "./receipt-raw-data";
import { useRouter } from "next/navigation";

interface ReceiptDetailInteractiveProps {
    initialReceipt: Receipt;
}

export function ReceiptDetailInteractive({ initialReceipt }: ReceiptDetailInteractiveProps) {
    const router = useRouter();
    const [receipt, setReceipt] = useState<Receipt>(initialReceipt);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (updates: Partial<Receipt>) => {
        setIsSaving(true);
        try {
            // Note: In a real app we would call a Server Action here.
            // Since we're using a MockRepository singleton on the server/client, 
            // we will simulate an API call by using fetch to a Route Handler, or for now just 
            // pretending it saved and updating local state (Mock API isn't exposed via REST yet).
            // Actually, we can just update the local state for this MVP since we don't have an API route.
            const newReceipt = { ...receipt, ...updates };
            if (newStatusMatches(newReceipt.status)) {
                newReceipt.reviewIssues = [];
            }
            setReceipt(newReceipt);
            setIsEditing(false);
            router.refresh(); // Refresh the server components if any
        } finally {
            setIsSaving(false);
        }
    };

    function newStatusMatches(status?: string) {
        return status === "processed";
    }

    return (
        <>
            <ReceiptDetailHeader
                receipt={receipt}
                isEditing={isEditing}
                onEditToggle={() => setIsEditing(!isEditing)}
                isSaving={isSaving}
            />

            <div className="grid gap-6 lg:grid-cols-2 mb-6">
                <ReceiptImage
                    imageUrl={receipt.imageUrl}
                    merchantName={receipt.merchantName}
                />
                <ReceiptFields
                    receipt={receipt}
                    isEditing={isEditing}
                    onSave={handleSave}
                    onCancel={() => setIsEditing(false)}
                />
            </div>

            <ReceiptRawData receipt={receipt} />
        </>
    );
}
