export async function POST(req) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { jobId, plan } = session.metadata;

    await connectDB();

    // Update job to featured if paid for featured plan
    if (plan === 'featured') {
      await Job.findByIdAndUpdate(jobId, {
        featured: true,
        status: 'active',
      });
    } else {
      await Job.findByIdAndUpdate(jobId, {
        status: 'active',
      });
    }
  }

  return NextResponse.json({ received: true });
}