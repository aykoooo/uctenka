import { DashboardHeader } from "@/components/shared/dashboard-header";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { getCurrentUser } from "@/lib/auth";
import { User, Palette, Database } from "lucide-react";
import { ProfileForm } from "@/components/settings/profile-form";
import { TelegramConnect } from "@/components/settings/telegram-connect";

export default function SettingsPage() {
    const user = getCurrentUser();

    return (
        <>
            <DashboardHeader
                breadcrumbs={[{ title: "Nastavení" }]}
            />

            <div className="flex flex-1 flex-col p-4 md:p-8">
                <div className="grid gap-6 max-w-2xl">
                    {/* Theme */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent dark:bg-accent/50">
                                    <Palette className="h-5 w-5 text-primary dark:text-primary-foreground" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Vzhled</CardTitle>
                                    <CardDescription>Přepněte mezi světlým a tmavým režimem</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Motiv aplikace</span>
                                <ThemeToggle />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account / Profile Form */}
                    <ProfileForm />

                    {/* Telegram Integration */}
                    <TelegramConnect />

                    {/* Data / Supabase placeholder */}
                    <Card className="opacity-60">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ring/10 dark:bg-ring/20">
                                    <Database className="h-5 w-5 text-ring" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Datové připojení</CardTitle>
                                    <CardDescription>Brzy k dispozici – napojení na Supabase</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </>
    );
}
