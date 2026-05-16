import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: parseInt(process.env.EMAIL_PORT) === 465, // true for 465, false for 587
    pool: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false, // Helps avoid "self-signed certificate" errors in dev
        ciphers: 'SSLv3'
    },
    connectionTimeout: 20000, // Increased to 20s
    greetingTimeout: 20000,
    socketTimeout: 30000,
});

export const sendOrderConfirmationEmail = async (email, orderDetails) => {
    const { orderId, productName, totalAmount } = orderDetails;

    const mailOptions = {
        from: `"E-COM Marketplace" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Order Confirmation - #${orderId}`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #2c5282;">Thank you for your purchase!</h2>
                <p>Hi there,</p>
                <p>We've received your order for <strong>${productName}</strong>.</p>
                <div style="background-color: #f7fafc; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0;">
                    <p style="margin: 0;"><strong>Order ID:</strong> #${orderId}</p>
                    <p style="margin: 0;"><strong>Total Amount:</strong> $${totalAmount}</p>
                </div>
                <p>Your items will be shipped shortly. You can track your order status in your profile.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 2rem 0;">
                <p style="font-size: 0.8rem; color: #718096;">If you have any questions, please reply to this email.</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${email}: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        throw error;
    }
};
