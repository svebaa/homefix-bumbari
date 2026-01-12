"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTicket(formData) {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
        return { error: "Not authenticated" };
    }

    const { data: tenant, error: tenantError } = await supabase
        .from("tenant")
        .select("unit_id")
        .eq("user_id", user.id)
        .single();
    if (tenantError || !tenant) {
        return { error: "User is not a tenant" };
    }

    const title = formData.get("title");
    const description = formData.get("description");
    const issue_category = formData.get("issue_category");
    const photo = formData.get("photo");
    if (!title || !description || !issue_category) {
        return { error: "Required fields missing: title or description or issue_category" };
    }

    const { data: ticket, error: ticketError } = await supabase
        .from("ticket")
        .insert({
            unit_id: tenant.unit_id,
            title,
            description,
            issue_category,
            created_by: user.id,
            status: "OPEN",
        })
        .select()
        .single();
    if (ticketError) {
        return { error: ticketError.message };
    }

    if (photo && photo.size > 0) {
        const fileExt = photo.name.split(".").at(-1);
        const fileName = `${ticket.ticket_id}_${Date.now()}.${fileExt}`;
        const filePath = `tickets/${ticket.ticket_id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from("ticket-photos")
            .upload(filePath, photo);

        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
                .from("ticket-photos")
                .getPublicUrl(filePath);

            await supabase
                .from("photo")
                .insert({
                    ticket_id: ticket.ticket_id,
                    photo_url: publicUrl,
                });
        }
    }

    revalidatePath("/tickets", "page");
    return { data: ticket };
}

export async function getActiveTickets() {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
        return { error: "Not authenticated" };
    }

    const { data: tenant, error: tenantError } = await supabase
        .from("tenant")
        .select("unit_id")
        .eq("user_id", user.id)
        .single();
    if (tenantError || !tenant) {
        return { error: "User is not a tenant" };
    }

    const { data: tickets, error: ticketsError } = await supabase
        .from("ticket")
        .select(`
            ticket_id,
            title,
            description,
            issue_category,
            status,
            created_at,
            unit_id
        `)
        .eq("created_by", user.id)
        .in("status", ["OPEN", "IN_PROGRESS"])
        .order("created_at", { ascending: false });
    if (ticketsError) {
        return { error: ticketsError.message };
    }

    if (tickets && tickets.length > 0) {
        const buildingUnitIds = tickets.map((t) => t.unit_id);
        const { data: buildingUnits } = await supabase
            .from("building_unit")
            .select(`
                unit_id,
                label,
                floor,
                building_id
            `)
            .in("unit_id", buildingUnitIds);

        const buildingUnitsMap = {};
        const buildingIds = [];
        buildingUnits.forEach((buildingUnit) => {
            buildingUnitsMap[buildingUnit.unit_id] = buildingUnit;
            if (buildingUnit.building_id && !buildingIds.includes(buildingUnit.building_id)) {
                buildingIds.push(buildingUnit.building_id);
            }
        });

        const buildingsMap = {};
        if (buildingIds.length > 0) {
            const { data: buildings } = await supabase
                .from("building")
                .select("building_id, address")
                .in("building_id", buildingIds);

            if (buildings) {
                buildings.forEach((building) => {
                    buildingsMap[building.building_id] = building;
                });
            }
        }

        tickets.forEach((ticket) => {
            const buildingUnit = buildingUnitsMap[ticket.unit_id] || null;
            ticket.building_unit = buildingUnit;
            if (buildingUnit && buildingUnit.building_id) {
                ticket.building = buildingsMap[buildingUnit.building_id] || null;
            } else {
                ticket.building = null;
            }
        });
    }

    return { data: tickets || [] };
}

export async function getResolvedTickets() {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
        return { error: "Not authenticated" };
    }

    const { data: tenant, error: tenantError } = await supabase
        .from("tenant")
        .select("unit_id")
        .eq("user_id", user.id)
        .single();
    if (tenantError || !tenant) {
        return { error: "User is not registered as a tenant" };
    }

    const { data: tickets, error: ticketsError } = await supabase
        .from("ticket")
        .select(`
            ticket_id,
            title,
            description,
            issue_category,
            status,
            created_at,
            resolved_at,
            assigned_to,
            unit_id
        `)
        .eq("created_by", user.id)
        .eq("status", "RESOLVED")
        .order("resolved_at", { ascending: false });
    if (ticketsError) {
        return { error: ticketsError.message };
    }


    if (tickets && tickets.length > 0) {
        const buildingUnitIds = tickets.map((t) => t.unit_id);
        const ticketIds = tickets.map((t) => t.ticket_id);

        const [buildingUnitsResult, ratingsResult] = await Promise.all([
            supabase
                .from("building_unit")
                .select("unit_id, label, floor, building_id")
                .in("unit_id", buildingUnitIds),
            supabase
                .from("rating")
                .select("ticket_id, rating_id, rating, comment")
                .in("ticket_id", ticketIds),
        ]);

        const buildingUnitsMap = {};
        const buildingIds = [];
        if (buildingUnitsResult.data) {
            buildingUnitsResult.data.forEach((buildingUnit) => {
                buildingUnitsMap[buildingUnit.unit_id] = buildingUnit;
                if (buildingUnit.building_id && !buildingIds.includes(buildingUnit.building_id)) {
                    buildingIds.push(buildingUnit.building_id);
                }
            });
        }

        const buildingsMap = {};
        if (buildingIds.length > 0) {
            const { data: buildings } = await supabase
                .from("building")
                .select("building_id, address")
                .in("building_id", buildingIds);

            if (buildings) {
                buildings.forEach((building) => {
                    buildingsMap[building.building_id] = building;
                });
            }
        }

        const ratingsMap = {};
        if (ratingsResult.data) {
            ratingsResult.data.forEach((rating) => {
                ratingsMap[rating.ticket_id] = [rating];
            });
        }

        tickets.forEach((ticket) => {
            const buildingUnit = buildingUnitsMap[ticket.unit_id] || null;
            ticket.building_unit = buildingUnit;
            if (buildingUnit && buildingUnit.building_id) {
                ticket.building = buildingsMap[buildingUnit.building_id] || null;
            } else {
                ticket.building = null;
            }
            ticket.rating = ratingsMap[ticket.ticket_id] || [];
        });
    }

    return { data: tickets || [] };
}

export async function createRating(formData) {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
        return { error: "Not authenticated" };
    }

    const ticketId = formData.get("ticket_id");
    const rating = parseInt(formData.get("rating"));
    const comment = formData.get("comment");
    if (!ticketId || !rating) {
        return { error: "Required fields missing: ticket_id or rating" };
    }

    const { data: ticket, error: ticketError } = await supabase
        .from("ticket")
        .select("ticket_id, assigned_to, unit_id, created_by, status")
        .eq("ticket_id", ticketId)
        .single();
    if (ticketError || !ticket) {
        return { error: "Ticket not found" };
    }

    if (ticket.created_by !== user.id) {
        return { error: "You can only rate tickets created by you" };
    }
    if (ticket.status !== "RESOLVED") {
        return { error: "You can only rate tickets that have been resolved" };
    }
    if (rating < 1 || rating > 5) {
        return { error: "Rating must be between 1 and 5" };
    }
    const { data: existingRating } = await supabase
        .from("rating")
        .select("rating_id")
        .eq("ticket_id", ticketId)
        .single();
    if (existingRating) {
        return { error: "Rating already exists for this ticket" };
    }

    const { data: ratingData } = await supabase
        .from("rating")
        .insert({
            ticket_id: parseInt(ticketId),
            rating,
            comment: comment || null,
        })
        .select()
        .single();

    revalidatePath("/tickets", "page");
    return { data: ratingData };
}
