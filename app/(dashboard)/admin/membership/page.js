import { getMembershipPrice } from "@/lib/actions/admin-actions";
import { MembershipPriceForm } from "./membership-form";

export const metadata = {
    title: "Postavke Članstva - HomeFix Administracija",
};

export default async function AdminMembershipPage() {
    const { data: price, error } = await getMembershipPrice();

    if (error && error !== "Nije pronađena aktivna cijena na Stripe-u.") {
        return (
            <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                Greška pri dohvaćanju cijene: {error}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Upravljanje Članstvom
            </h2>
            <MembershipPriceForm currentPrice={price} />
        </div>
    );
}
