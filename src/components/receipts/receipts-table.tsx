"use client";

import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { Receipt } from "@/types/domain";
import { CategoryBadge } from "@/components/shared/category-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { formatCZK, formatDate } from "@/lib/formatters";

interface ReceiptsTableProps {
    receipts: Receipt[];
}

export function ReceiptsTable({ receipts }: ReceiptsTableProps) {
    const router = useRouter();

    return (
        <div className="hidden md:block rounded-lg border bg-white dark:bg-slate-900">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Datum</TableHead>
                        <TableHead>Obchod / Firma</TableHead>
                        <TableHead>Kategorie</TableHead>
                        <TableHead className="text-right">Částka</TableHead>
                        <TableHead>Stav</TableHead>
                        <TableHead>Důvěra</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {receipts.map((receipt) => (
                        <TableRow
                            key={receipt.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => router.push(`/receipts/${receipt.id}`)}
                        >
                            <TableCell className="text-sm">
                                {formatDate(receipt.date)}
                            </TableCell>
                            <TableCell>
                                <div>
                                    <p className="text-sm font-medium">{receipt.merchantName}</p>
                                    {receipt.companyName && (
                                        <p className="text-xs text-muted-foreground">{receipt.companyName}</p>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <CategoryBadge categoryId={receipt.categoryId} />
                            </TableCell>
                            <TableCell className="text-right font-medium text-sm">
                                {formatCZK(receipt.amount, receipt.currency)}
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={receipt.status} />
                            </TableCell>
                            <TableCell>
                                <ConfidenceBadge
                                    level={receipt.confidenceLevel}
                                    showPercentage
                                    percentage={receipt.confidence}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
