"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    updateUserRole,
    toggleUserStatus
} from "@/lib/actions/admin-actions";
import { toast } from "sonner";

export function UsersTable({ initialUsers }) {
    const [users, setUsers] = useState(initialUsers);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.first_name.toLowerCase().includes(search.toLowerCase()) ||
            user.last_name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleRoleChange = async (userId, newRole) => {
        const res = await updateUserRole(userId, newRole);
        if (res.error) {
            toast.error("Greška pri promjeni uloge: " + res.error);
        } else {
            toast.success("Uloga uspješno promijenjena");
            setUsers(users.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
        }
    };

    const handleToggleStatus = async (userId, currentlyBlocked) => {
        const res = await toggleUserStatus(userId, !currentlyBlocked);
        if (res.error) {
            toast.error("Greška: " + res.error);
        } else {
            toast.success(!currentlyBlocked ? "Korisnik blokiran" : "Korisnik odblokiran");
            setUsers(users.map(u =>
                u.user_id === userId ? { ...u, is_blocked: !currentlyBlocked } : u
            ));
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <Input
                    placeholder="Traži po imenu ili emailu..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                />
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtriraj po ulozi" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Sve uloge</SelectItem>
                        <SelectItem value="TENANT">Stanar</SelectItem>
                        <SelectItem value="CONTRACTOR">Majstor</SelectItem>
                        <SelectItem value="REPRESENTATIVE">Predstavnik</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ime i Prezime</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Uloga</TableHead>
                            <TableHead className="text-center">Akcije</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.user_id} className={user.is_blocked ? "opacity-50 bg-slate-50" : ""}>
                                <TableCell className="font-medium">
                                    {user.first_name} {user.last_name}
                                    {user.is_blocked && (
                                        <Badge variant="destructive" className="ml-2 text-[10px] py-0 h-4">Blokiran</Badge>
                                    )}
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Select
                                        defaultValue={user.role}
                                        onValueChange={(val) => handleRoleChange(user.user_id, val)}
                                    >
                                        <SelectTrigger className="w-[140px] h-8 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TENANT">Stanar</SelectItem>
                                            <SelectItem value="CONTRACTOR">Majstor</SelectItem>
                                            <SelectItem value="REPRESENTATIVE">Predstavnik</SelectItem>
                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={user.is_blocked
                                            ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                                            : "text-red-600 hover:text-red-700 hover:bg-red-50"
                                        }
                                        onClick={() => handleToggleStatus(user.user_id, !!user.is_blocked)}
                                    >
                                        {user.is_blocked ? "Odblokiraj" : "Blokiraj"}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
