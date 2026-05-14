import Stripe from 'stripe';
import Product from '../model/product.js';
import ProductSeller from '../model/productSeller.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
    try {
        const { items } = req.body; // Expecting [{ listingId: '...', quantity: 1 }]

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items provided' });
        }

        const lineItems = await Promise.all(items.map(async (item) => {
            const listing = await ProductSeller.findById(item.listingId).populate('product');
            if (!listing) {
                throw new Error(`Listing ${item.listingId} not found`);
            }
            if (listing.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${listing.product.name}`);
            }

            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: listing.product.name,
                        description: listing.product.description,
                        images: listing.product.images.map(img => img.url),
                    },
                    unit_amount: Math.round(listing.price * 100), // Use listing price
                },
                quantity: item.quantity,
            };
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
            metadata: {
                userId: req.user.userId,
                // Store listing IDs for post-payment processing
                listingIds: JSON.stringify(items.map(i => i.listingId))
            }
        });

        res.status(200).json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Stripe Session Error:', error);
        res.status(500).json({ message: 'Error creating checkout session', error: error.message });
    }
};

export const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook Signature Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        console.log('Payment Successful for Session:', session.id);
        const listingIds = JSON.parse(session.metadata.listingIds);
        
        // Decrement stock for each listing bought
        for (const listingId of listingIds) {
            await ProductSeller.findByIdAndUpdate(listingId, { $inc: { stock: -1 } });
        }
    }

    res.json({ received: true });
};
