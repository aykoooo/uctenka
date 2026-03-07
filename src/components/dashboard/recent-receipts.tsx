import Link from "next/link";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Receipt } from "@/types/domain";
import { CategoryBadge } from "@/components/shared/category-badge";
import { formatCZK, formatDate } from "@/lib/formatters";

interface RecentReceiptsProps {
    receipts: Receipt[];
}

export function RecentReceipts({ receipts }: RecentReceiptsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Poslední nahrané</CardTitle>
                <CardDescription>
                    Nahráli jste {receipts.length} účtenek za poslední měsíc.
                </CardDescription>
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
                                <Avatar className="hidden h-9 w-9 sm:flex">
                                    <AvatarFallback>{fallback}</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1 flex-1">
                                    <p className="text-sm font-medium leading-none">
                                        {receipt.merchantName}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <CategoryBadge categoryId={receipt.categoryId} />
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(receipt.date)}
                                        </span>
                                    </div>
                                </div>
                                <div className="ml-auto font-medium">
                                    {formatCZK(receipt.amount, receipt.currency)}
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
