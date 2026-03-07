"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, CheckCircle2 } from "lucide-react";

export function TelegramConnect() {
    const [code, setCode] = useState<string | null>(null);

    const generateCode = () => {
        const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
        setCode(randomCode);
    };

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
                {!code ? (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            1. Otevřete Telegram a najděte bota <strong>@reciept_reciever_bot</strong><br />
                            2. Klikněte na tlačítko níže pro vygenerování párovacího kódu<br />
                            3. Pošlete kód botovi
                        </p>
                        <Button onClick={generateCode}>Generovat párovací kód</Button>
                    </div>
                ) : (
                    <div className="rounded-lg border bg-muted/50 p-6 text-center space-y-4">
                        <p className="text-sm font-medium">Váš párovací kód:</p>
                        <div className="text-4xl font-mono font-bold tracking-wider text-primary">
                            {code}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Pošlete tento kód botovi <strong>@reciept_reciever_bot</strong> na Telegramu. Kód vyprší za 15 minut.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 mt-4">
                            <CheckCircle2 className="h-4 w-4" />
                            Čekám na spárování...
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
