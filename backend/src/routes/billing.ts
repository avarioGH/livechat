import { Router } from 'express';
import Stripe from 'stripe';
import { prisma } from '../index';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_for_now', {
  apiVersion: '2025-01-27.acacia' as any,
});

// Create Stripe Checkout Session
router.post('/create-checkout', async (req, res) => {
  try {
    const { tenantId, plan } = req.body;

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

    // Dummy Price IDs
    const priceId = plan === 'ENTERPRISE' ? 'price_enterprise_123' : 'price_pro_123';

    // 1. Create or retrieve Stripe Customer
    let customerId = tenant.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: tenant.name,
        metadata: { tenantId: tenant.id }
      });
      customerId = customer.id;
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { stripeCustomerId: customerId }
      });
    }

    // 2. Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/billing?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/billing?canceled=true`,
      metadata: { tenantId }
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stripe Webhook handler
router.post('/webhook', async (req, res) => {
  // In a real app, you MUST verify the Stripe signature here using raw body
  // const sig = req.headers['stripe-signature'];
  // const event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);

  const event = req.body; // Mocked for this demo without raw body parsing

  try {
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const status = subscription.status === 'active' ? 'ACTIVE' : 
                     subscription.status === 'past_due' ? 'PAST_DUE' : 'CANCELED';

      await prisma.tenant.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: status,
          plan: 'PRO' // Can dynamically map based on subscription.items
        }
      });
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await prisma.tenant.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          subscriptionStatus: 'CANCELED',
          plan: 'FREE'
        }
      });
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error`);
  }
});

export default router;
