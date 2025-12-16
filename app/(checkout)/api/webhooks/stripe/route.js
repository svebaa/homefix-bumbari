import { NextResponse } from 'next/server';
import { stripe } from '../../../../../lib/stripe/stripe'
import { createContractor, createMembership } from '@/lib/actions/contractor-actions';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Verifikacija s potpisom neuspješna', err.message);
    return NextResponse.json({ error: 'Krivi potpis' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
        const session = event.data.object;
        const metadata = session.metadata;
        const userId = session.metadata.user_id;

        if (metadata.contractor_data && userId) {
            let contractorData;
            try {
                contractorData = JSON.parse(metadata.contractor_data);
            } catch (err) {
                console.error("Neispavan JSON za contractorData:", err);
                return NextResponse.json({ received: true });
            }
            const contractor = await createContractor(contractorData, userId);
            if (contractor.error) {
                console.error("Neuspješna kreacija contractor-a:", contractor.error);
            } else {
                console.log("Uspješna kreacija contractor-a:", contractor.data);
            }
            const membership = await createMembership(session.amount_total, userId);
            if (membership.error) {
                console.error("Neuspjela kreacija članarine:", contractor.error);
            } else {
                console.log("Uspješna kreacija članarine:", contractor.data);
            }
        }
        break;

    default:
      console.log(`Ispunjavanje plaćene narudžbe neuspješno: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}