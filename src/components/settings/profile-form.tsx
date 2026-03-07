"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function ProfileForm() {
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaved(false);
        // Mock save
        await new Promise(res => setTimeout(res, 1000));
        setIsSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Osobní údaje</CardTitle>
                <CardDescription>
                    Tyto údaje se použijí pro kontrolu účtenek (např. automatické vyřazení vašich vystavených faktur).
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSave} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Jméno</label>
                        <Input defaultValue="Jan" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Příjmení</label>
                        <Input defaultValue="Novák" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">IČO</label>
                        <Input defaultValue="12345678" />
                    </div>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {saved ? "Uloženo!" : "Uložit změny"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
