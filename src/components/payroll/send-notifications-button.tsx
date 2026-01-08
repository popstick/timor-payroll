'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { sendPayslipNotificationsBatch } from '@/app/dashboard/payroll/actions';
import { useToast } from '@/components/ui/toast';

export function SendNotificationsButton({ payrollRunId }: { payrollRunId: string }) {
    const [loading, setLoading] = useState(false);
    const { success, error } = useToast();

    const handleSend = async () => {
        if (!confirm('Send WhatsApp/SMS notifications to all employees?')) return;

        setLoading(true);
        try {
            const result = await sendPayslipNotificationsBatch(payrollRunId);
            if (result.success && result.successCount !== undefined) {
                if ((result.failCount ?? 0) > 0) {
                    error(`Sent: ${result.successCount}, Failed: ${result.failCount}`);
                } else {
                    success(`Successfully sent ${result.successCount} notifications`);
                }
            } else {
                error(result.error || 'Unknown error');
            }
        } catch (e) {
            error('Failed to send notifications');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button onClick={handleSend} disabled={loading} variant="secondary">
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Sending...' : 'Send Notifications'}
        </Button>
    );
}
