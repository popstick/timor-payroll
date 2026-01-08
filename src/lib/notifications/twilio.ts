import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

type NotificationType = 'whatsapp' | 'sms';

interface SendNotificationParams {
    to: string;
    body: string;
    type: NotificationType;
}

export async function sendNotification({ to, body, type }: SendNotificationParams) {
    if (!client) {
        console.warn('Twilio client not initialized. Missing credentials.');
        return { success: false, error: 'Missing credentials' };
    }

    try {
        const from = type === 'whatsapp' ? `whatsapp:${fromPhoneNumber}` : fromPhoneNumber;
        const toFormatted = type === 'whatsapp' && !to.startsWith('whatsapp:') ? `whatsapp:${to}` : to;

        const message = await client.messages.create({
            body,
            from,
            to: toFormatted,
        });

        return { success: true, messageId: message.sid };
    } catch (error) {
        console.error('Error sending notification:', error);
        return { success: false, error };
    }
}
