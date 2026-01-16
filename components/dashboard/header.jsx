"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_CONFIG = {
    TENANT: [
        { href: "/tickets", label: "Kvarovi" },
    ],
    CONTRACTOR: [
        { href: "/tickets", label: "Kvarovi" },
        { href: "/profile", label: "Profil" },
    ],
    REPRESENTATIVE: [
        { href: "/tickets", label: "Kvarovi" },
        { href: "/tenants", label: "Stanari" },
        { href: "/reports", label: "Izvještaji" },
    ],
};

export function DashboardHeader({ user, role, logoutAction }) {
    const pathname = usePathname();

    const currentNavItems = NAV_CONFIG[role] || [];

    return (
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center gap-8">
                        <Link
                            href="/homepage"
                            className="text-xl font-bold text-slate-900 dark:text-white"
                        >
                            HomeFix
                        </Link>

                        <nav className="flex flex-wrap gap-4">
                            {currentNavItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "text-sm font-medium transition-colors hover:text-slate-900 dark:hover:text-white",
                                            isActive
                                                ? "text-slate-900 dark:text-white"
                                                : "text-slate-600 dark:text-slate-300"
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-600 dark:text-slate-300 hidden sm:inline-block">
                            {user?.email}
                        </span>
                        <form action={logoutAction}>
                            <Button variant="outline" type="submit" size="sm">
                                Odjava
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </header>
    );
}
