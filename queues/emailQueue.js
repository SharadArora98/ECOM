import { Queue, Worker } from 'bullmq';
import { createQueueConnection } from '../utils/redis.js';
import { sendOrderConfirmationEmail } from '../utils/mail.js';

const connection = createQueueConnection();

// 1. Create the Queue
export const emailQueue = new Queue('email-queue', { 
    connection,
    defaultJobOptions: {
        removeOnComplete: {
            age: 3600, // keep for 1 hour
            count: 100, // keep only the last 100 jobs
        },
        removeOnFail: {
            age: 24 * 3600, // keep failed jobs for 24 hours for debugging
        },
    }
});

// 2. Create the Worker to process jobs
const emailWorker = new Worker('email-queue', async (job) => {
    const { email, orderDetails } = job.data;
    console.log(`Processing email job ${job.id} for ${email}`);
    
    try {
        await sendOrderConfirmationEmail(email, orderDetails);
    } catch (error) {
        console.error(`Job ${job.id} failed:`, error);
        throw error;
    }
}, {
    connection,
    limiter: {
        max: 10,
        duration: 10000,
    }
});

emailWorker.on('completed', (job) => {
    console.log(`Email job ${job.id} has completed!`);
});

emailWorker.on('failed', (job, err) => {
    console.error(`Email job ${job.id} has failed with ${err.message}`);
});

export default emailQueue;
