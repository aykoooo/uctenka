import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import type { Receipt } from "@/types/domain";

interface ReceiptRawDataProps {
    receipt: Receipt;
}

export function ReceiptRawData({ receipt }: ReceiptRawDataProps) {
    return (
        <Card>
            <CardContent className="p-0">
                <Accordion className="w-full">
                    <AccordionItem value="raw-text" className="border-b-0 px-6">
                        <AccordionTrigger className="text-sm font-medium py-4">
                            Získaný text
                        </AccordionTrigger>
                        <AccordionContent>
                            {receipt.rawText ? (
                                <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted/50 rounded-lg p-4 font-mono">
                                    {receipt.rawText}
                                </pre>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    OCR text není k dispozici.
                                </p>
                            )}
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="technical" className="border-b-0 px-6">
                        <AccordionTrigger className="text-sm font-medium py-4">
                            Technická data
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-4 font-mono">
                                <div className="flex justify-between">
                                    <span>ID:</span>
                                    <span>{receipt.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Telegram ID:</span>
                                    <span>{receipt.telegramMessageId ?? "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>OCR engine:</span>
                                    <span>{receipt.ocrEngine ?? "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Doba zpracování:</span>
                                    <span>
                                        {receipt.processingDurationMs
                                            ? `${receipt.processingDurationMs} ms`
                                            : "—"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Vytvořeno:</span>
                                    <span>{receipt.createdAt.toISOString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Aktualizováno:</span>
                                    <span>{receipt.updatedAt.toISOString()}</span>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
}
