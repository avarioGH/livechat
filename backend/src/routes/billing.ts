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
    const { organizationId, plan } = req.body;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { subscription: true }
    });
    
    if (!organization) return res.status(404).json({ error: 'Organization not found' });

    // Dummy Price IDs
    const priceId = plan === 'ENTERPRISE' ? 'price_enterprise_123' : 'price_pro_123';

    // 1. Create or retrieve Stripe Customer
    let customerId = organization.subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: organization.name,
        metadata: { organizationId: organization.id }
      });
      customerId = customer.id;
      
      // Upsert Subscription record
      await prisma.subscription.upsert({
        where: { organizationId: organization.id },
        create: {
          organizationId: organization.id,
          stripeCustomerId: customerId,
          planId: 'FREE',
          status: 'TRIAL',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(new Date().setDate(new Date().getDate() + 14))
        },
        update: {
          stripeCustomerId: customerId
        }
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
      metadata: { organizationId }
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

      const existingSub = await prisma.subscription.findFirst({
        where: { stripeCustomerId: customerId }
      });

      if (existingSub) {
        await prisma.subscription.update({
          where: { id: existingSub.id },
          data: {
            stripeSubId: subscription.id,
            status: status,
            planId: 'PRO', // Can dynamically map based on subscription.items
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
          }
        });
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const existingSub = await prisma.subscription.findFirst({
        where: { stripeCustomerId: customerId }
      });

      if (existingSub) {
        await prisma.subscription.update({
          where: { id: existingSub.id },
          data: {
            status: 'CANCELED',
            planId: 'FREE'
          }
        });
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error`);
  }
});

export default router;
