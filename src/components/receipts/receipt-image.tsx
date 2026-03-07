import { Card, CardContent } from "@/components/ui/card";
import { FileText, ImageIcon } from "lucide-react";

interface ReceiptImageProps {
    imageUrl: string | null;
    merchantName: string;
}

export function ReceiptImage({ imageUrl, merchantName }: ReceiptImageProps) {
    return (
        <Card>
            <CardContent className="p-0">
                {imageUrl ? (
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imageUrl}
                            alt={`uctenka – ${merchantName}`}
                            className="object-contain w-full h-full"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center aspect-[3/4] w-full rounded-lg bg-muted/50">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-3">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">Náhled není k dispozici</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Obrázek účtenky nebyl nahrán
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
