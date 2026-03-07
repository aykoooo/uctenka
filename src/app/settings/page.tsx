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
import { User, Palette, Database, CheckCircle2 } from "lucide-react";
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

                    {/* Data / Supabase status */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ring/10 dark:bg-ring/20">
                                    <Database className="h-5 w-5 text-ring" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Datové připojení</CardTitle>
                                    <CardDescription>Připojeno k Supabase</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                                <CheckCircle2 className="h-4 w-4" />
                                Připojení je aktivní
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
