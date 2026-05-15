import Stripe from 'stripe';
import mongoose from 'mongoose';
import Product from '../model/product.js';
import ProductSeller from '../model/productSeller.js';
import Order from '../model/order.js';

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
                // Store listing IDs and quantities for post-payment processing
                items: JSON.stringify(items.map(i => ({ listingId: i.listingId, quantity: i.quantity || 1 })))
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
        
        // Start Mongoose Session for ACID Transaction
        const mongooseSession = await mongoose.startSession();
        mongooseSession.startTransaction();

        try {
            // 1. Idempotency Check: Has this session already been processed?
            const existingOrder = await Order.findOne({ stripeSessionId: session.id }).session(mongooseSession);
            if (existingOrder) {
                console.log(`Order for session ${session.id} already exists. Skipping.`);
                await mongooseSession.commitTransaction();
                return res.json({ received: true, message: 'Already processed' });
            }

            const items = JSON.parse(session.metadata.items);
            const userId = session.metadata.userId;

            for (const item of items) {
                // 2. Atomic Stock Update with Concurrency Control
                // We only decrement IF stock is greater than or equal to quantity
                const updateResult = await ProductSeller.findOneAndUpdate(
                    { _id: item.listingId, stock: { $gte: item.quantity } },
                    { $inc: { stock: -item.quantity } },
                    { returnDocument: 'after', session: mongooseSession }
                );

                let orderStatus = 'paid';
                if (!updateResult) {
                    // Race Condition Case: Stock was taken between Checkout and Webhook
                    console.error(`CRITICAL: Stock exhausted for listing ${item.listingId} during payment processing.`);
                    orderStatus = 'refund_required';
                }

                // 3. Create Order Record
                const listing = await ProductSeller.findById(item.listingId).session(mongooseSession);
                await Order.create([{
                    user: userId,
                    listing: item.listingId,
                    product: listing.product,
                    seller: listing.seller,
                    quantity: item.quantity,
                    totalAmount: session.amount_total / 100,
                    stripeSessionId: session.id,
                    status: orderStatus,
                    paymentStatus: 'paid'
                }], { session: mongooseSession });
            }

            // Commit all changes atomically
            await mongooseSession.commitTransaction();
            console.log(`Payment and Order processed successfully for Session: ${session.id}`);

        } catch (error) {
            // If anything fails, undo everything (Rollback)
            await mongooseSession.abortTransaction();
            console.error('Transaction Aborted. Error processing webhook:', error);
            return res.status(500).json({ message: 'Internal Server Error during order processing' });
        } finally {
            mongooseSession.endSession();
        }
    }

    res.json({ received: true });
};
