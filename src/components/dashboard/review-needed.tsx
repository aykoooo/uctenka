import Link from "next/link";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Receipt } from "@/types/domain";
import { IssueBadges } from "@/components/shared/issue-badges";
import { formatCZK, formatDate } from "@/lib/formatters";
import { ArrowRight, AlertTriangle } from "lucide-react";

interface ReviewNeededProps {
    receipts: Receipt[];
}

export function ReviewNeeded({ receipts }: ReviewNeededProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-base">Vyžaduje kontrolu</CardTitle>
                    <CardDescription>Účtenky čekající na manuální revizi.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/review" />} className="text-xs">
                    Zobrazit vše
                    <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-6">
                    {receipts.map((receipt) => {
                        const fallback = receipt.merchantName.substring(0, 2).toUpperCase();
                        return (
                            <Link
                                key={receipt.id}
                                href={`/receipts/${receipt.id}`}
                                className="flex items-center gap-4 hover:bg-muted/50 p-2 -m-2 rounded-md transition-colors"
                            >
                                <Avatar className="hidden h-9 w-9 sm:flex bg-destructive/10 text-destructive">
                                    <AvatarFallback className="bg-destructive/10 text-destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1 flex-1">
                                    <p className="text-sm font-medium leading-none">
                                        {receipt.merchantName}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <IssueBadges issues={receipt.reviewIssues} />
                                    </div>
                                </div>
                                <div className="ml-auto flex flex-col items-end gap-1">
                                    <span className="font-medium text-sm">{formatCZK(receipt.amount)}</span>
                                    <span className="text-xs text-muted-foreground">{formatDate(receipt.date)}</span>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
