import { getUser, logout } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardLayout({ children }) {
    const user = await getUser();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center gap-8">
                            <Link
                                href="/dashboard"
                                className="text-xl font-bold text-slate-900 dark:text-white"
                            >
                                HomeFix
                            </Link>
                            <nav className="hidden md:flex gap-6">
                                <Link
                                    href="/dashboard"
                                    className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/dashboard/profile"
                                    className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                                >
                                    Profil
                                </Link>
                            </nav>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-600 dark:text-slate-300">
                                {user?.email}
                            </span>
                            <form action={logout}>
                                <Button variant="outline" type="submit">
                                    Odjava
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
