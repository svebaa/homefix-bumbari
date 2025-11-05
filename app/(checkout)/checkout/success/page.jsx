import { redirect } from 'next/navigation'
import { stripe } from '../../../../lib/stripe/stripe'

export default async function Success({ searchParams }) {
  const { session_id } = await searchParams

  if (!session_id)
    throw new Error('Nedostaje session_id')

  const {
    status,
    customer_details: { email: customerEmail }
  } = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ['line_items', 'payment_intent']
  })

  if (status === 'open') {
    return redirect('/')
  }

  if (status === 'complete') {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-semibold mb-4 text-green-600">
            Uplata uspješna!
          </h1>
          <p className="text-gray-700 mb-2">
            Zahvaljujemo na uplati Vaše članarine! Vaš račun je sada aktivan.
          </p>
          <p className="mt-6 text-sm text-gray-500">
            Preusmjeravanje na Homefix Dashboard za{' '}
            <span id="countdown" className="font-semibold">10</span> sekundi...
          </p>

          <RedirectScript />
        </div>
      </section>
    )
  }
}
function RedirectScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          let seconds = 10;
          const countdown = document.getElementById('countdown');
          const interval = setInterval(() => {
            seconds--;
            if (countdown) countdown.textContent = seconds;
            if (seconds <= 0) {
              clearInterval(interval);
              window.location.href = '/dashboard';
            }
          }, 1000);
        `
      }}
    />
  )
}