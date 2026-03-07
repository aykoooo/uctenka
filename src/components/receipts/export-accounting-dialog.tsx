"use client";

import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";

import { exportAccountingCsvAction } from "@/app/actions";
import type { ReceiptFilters } from "@/lib/data";
import type { AccountingDocumentType } from "@/lib/exports/accounting-csv";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface ExportAccountingDialogProps {
    filters: ReceiptFilters;
}

function triggerCsvDownload(fileName: string, mimeType: string, content: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

export function ExportAccountingDialog({ filters }: ExportAccountingDialogProps) {
    const [open, setOpen] = useState(false);
    const [documentType, setDocumentType] = useState<AccountingDocumentType>("tax-evidence");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [isExporting, setIsExporting] = useState(false);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);

    const canExport = useMemo(() => !isExporting, [isExporting]);

    const handleExport = async () => {
        setIsExporting(true);
        setInfoMessage(null);

        try {
            const result = await exportAccountingCsvAction(documentType, {
                search: filters.search,
                categoryId: filters.categoryId,
                status: filters.status,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
            });

            triggerCsvDownload(result.fileName, result.mimeType, result.content);
            setInfoMessage(`Hotovo: ${result.label} (${result.rowCount} řádků).`);
        } catch (error) {
            console.error("CSV export failed", error);
            setInfoMessage("Export se nepodařil. Zkuste to prosím znovu.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button variant="outline">
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Export pro účetní
                    </Button>
                }
            />

            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Export podkladů pro účetnictví (CSV)</DialogTitle>
                    <DialogDescription>
                        Generuje buď daňovou evidenci výdajů, nebo podklad pro kontrolní hlášení a přiznání k DPH.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <label htmlFor="documentType" className="text-sm font-medium">Typ podkladu</label>
                        <Select value={documentType} onValueChange={(value) => setDocumentType(value as AccountingDocumentType)}>
                            <SelectTrigger id="documentType" className="w-full">
                                <SelectValue className="truncate" placeholder="Vyberte typ podkladu" />
                            </SelectTrigger>
                            <SelectContent className="w-[--anchor-width] min-w-[22rem] max-w-[min(92vw,32rem)]">
                                <SelectItem className="whitespace-normal" value="tax-evidence">Daňová evidence výdajů</SelectItem>
                                <SelectItem className="whitespace-normal" value="vat-report">Podklad pro kontrolní hlášení a přiznání k DPH</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <label htmlFor="fromDate" className="text-sm font-medium">Od data</label>
                            <Input id="fromDate" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="toDate" className="text-sm font-medium">Do data</label>
                            <Input id="toDate" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Sloupce: Datum dokladu, Dodavatel, IČO/DIČ, Číslo dokladu, Základ daně, Sazba DPH, Částka DPH, Cena celkem s DPH, Kategorie výdaje.
                    </p>

                    {infoMessage && (
                        <p className="text-xs text-muted-foreground">{infoMessage}</p>
                    )}
                </div>

                <div className="mt-2 flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setOpen(false)} disabled={isExporting}>
                        Zavřít
                    </Button>
                    <Button onClick={handleExport} disabled={!canExport}>
                        {isExporting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generuji...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Stáhnout CSV
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
