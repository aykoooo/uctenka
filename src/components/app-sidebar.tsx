"use client";

import {
    FileText,
    LayoutDashboard,
    Settings,
    ShieldCheck,
    Receipt,
    LogOut,
    GalleryVerticalEnd,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuGroup,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

const navItems = [
    {
        title: "Nástěnka",
        url: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Účtenky",
        url: "/receipts",
        icon: Receipt,
    },
    {
        title: "Ke kontrole",
        url: "/review",
        icon: ShieldCheck,
    },
    {
        title: "Nastavení",
        url: "/settings",
        icon: Settings,
    },
];

export function AppSidebar() {
    const pathname = usePathname();
    const user = getCurrentUser();

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" render={<Link href="/" />}>
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                                <Image src="/logo.svg" alt="uctenka logo" width={32} height={32} />
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="font-cascadia font-bold text-lg tracking-tight">uctenka.</span>
                                <span className="text-xs text-muted-foreground -mt-1">Klientská sekce</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton render={<Link href={item.url} />} isActive={pathname === item.url}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger render={
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                />
                            }>
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                                    <AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{user.name}</span>
                                    <span className="truncate text-xs">{user.email}</span>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel className="p-0 font-normal">
                                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                            <Avatar className="h-8 w-8 rounded-lg">
                                                <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                                                <AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="grid flex-1 text-left text-sm leading-tight">
                                                <span className="truncate font-semibold">{user.name}</span>
                                                <span className="truncate text-xs">{user.email}</span>
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem render={<Link href="/settings" className="w-full cursor-pointer" />}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Nastavení účtu
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-500 cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Odhlásit se
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
