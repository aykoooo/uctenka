"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

export function TelegramConnect() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    Propojení s Telegramem
                </CardTitle>
                <CardDescription>
                    Propojte si účet s naším Telegram botem pro snadné nahrávání účtenek vyfocením z mobilu.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">
                        Otevřete Telegram a najděte bota <strong>@reciept_reciever_bot</strong>.
                        Přes tohoto bota můžete pohodlně nahrávat účtenky přímo z mobilu.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
