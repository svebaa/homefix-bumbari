import { getAllUsers } from "@/lib/actions/admin-actions";
import { UsersTable } from "./users-table";

export const metadata = {
    title: "Upravljanje Korisnicima - HomeFix Administracija",
};

export default async function AdminUsersPage() {
    const { data: users, error } = await getAllUsers();

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                Greška pri učitavanju korisnika: {error}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Korisnici sustava
            </h2>
            <UsersTable initialUsers={users || []} />
        </div>
    );
}
