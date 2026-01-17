import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

import { stripe } from '../../../../lib/stripe/stripe'
import { createClient } from "@/lib/supabase/server";
import { getMembershipPrice } from "@/lib/actions/admin-actions";

export async function POST(request) {
  try {
    const { metadata } = await request.json();

    const supabase = await createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        return NextResponse.json({ error: 'Niste autentificirani.' }, { status: 401 });
    }

    const supabaseUserId = user.id;
    
    const finalMetadata = {
        ...metadata,
        user_id: supabaseUserId,
    };

    const headersList = await headers()
    const origin = headersList.get('origin')

    const priceRes = await getMembershipPrice();
    if (priceRes.error) {
        return NextResponse.json({ error: priceRes.error }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceRes.data.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      metadata: finalMetadata,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/?canceled=true`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode }
    )
  }
}