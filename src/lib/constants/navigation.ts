import { LayoutDashboard, Receipt, ClipboardCheck, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
    {
        label: "Přehled",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        label: "Účtenky",
        href: "/receipts",
        icon: Receipt,
    },
    {
        label: "Ke kontrole",
        href: "/review",
        icon: ClipboardCheck,
    },
    {
        label: "Nastavení",
        href: "/settings",
        icon: Settings,
    },
];
