'use server';

import { createClient } from '@/lib/supabase/server';
import { renderToStream } from '@react-pdf/renderer';
import { PayslipPDF } from '@/components/payroll/payslip-pdf';
import { sendNotification } from '@/lib/notifications/twilio';
import { getPayslipSignedUrl } from '@/lib/storage/payslips';

export async function sendPayslipNotification(payrollRunId: string, employeeId: string) {
    const supabase = await createClient();

    // 1. Fetch Payroll Item & Employee Details
    const { data: item, error } = await supabase
        .from('payroll_items')
        .select(`
      *,
      employees (*),
      payroll_runs (*)
    `)
        .eq('payroll_run_id', payrollRunId)
        .eq('employee_id', employeeId)
        .single();

    if (error || !item) {
        return { success: false, error: 'Payroll item not found' };
    }

    const employee = item.employees;
    const run = item.payroll_runs;

    // Check notification preference
    if (!employee.notification_preference || employee.notification_preference === 'none') {
        return { success: false, error: 'User has no notification preference set' };
    }

    if (!employee.phone) {
        return { success: false, error: 'User has no phone number' };
    }

    const phone = employee.phone;

    // 2. Fetch Organization (for PDF header)
    const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', run.organization_id)
        .single();

    if (!org) {
        return { success: false, error: 'Organization not found' };
    }

    // 3. Generate PDF
    const pdfStream = await renderToStream(
        <PayslipPDF
            employee={{
                first_name: employee.first_name,
                last_name: employee.last_name,
                employee_number: employee.employee_number,
                position: employee.position,
                department: employee.department,
                tin: employee.tin,
                inss_number: employee.inss_number
            }}
            payrollItem={{
                base_salary: item.base_salary,
                overtime_hours: item.overtime_hours,
                overtime_pay: item.overtime_pay,
                night_shift_premium: item.night_shift_premium,
                allowances: item.allowances,
                bonuses: item.bonuses,
                gross_pay: item.gross_pay,
                tax_withheld: item.tax_withheld,
                inss_employee: item.inss_employee,
                inss_employer: item.inss_employer,
                other_deductions: item.other_deductions,
                total_deductions: item.total_deductions,
                net_pay: item.net_pay
            }}
            organization={{
                name: org.name,
                address: org.address,
                tin: org.tin
            }}
            payPeriod={{
                start: run.period_start,
                end: run.period_end,
                payDate: run.pay_date
            }}
            language="en" // Could be dynamic based on user pref
        />
    );

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of pdfStream) {
        chunks.push(chunk as Uint8Array);
    }
    const buffer = Buffer.concat(chunks);

    // 4. Upload to Storage
    const filename = `${run.period_end.slice(0, 7)}/${employee.employee_number}_${item.id}.pdf`;
    const { error: uploadError } = await supabase
        .storage
        .from('payslips')
        .upload(filename, buffer, {
            contentType: 'application/pdf',
            upsert: true
        });

    if (uploadError) {
        console.error('Upload Error', uploadError);
        return { success: false, error: 'Failed to upload PDF' };
    }

    // 5. Get Signed URL
    const signedUrl = await getPayslipSignedUrl(filename);
    if (!signedUrl) {
        return { success: false, error: 'Failed to generate link' };
    }

    // 6. Send Notification
    const monthName = new Date(run.period_end).toLocaleString('default', { month: 'long' });
    const messageBody = `Your payslip for ${monthName} is ready. View it here: ${signedUrl}`;

    const result = await sendNotification({
        to: phone,
        body: messageBody,
        type: employee.notification_preference as 'whatsapp' | 'sms'
    });

    return result;
}

export async function sendPayslipNotificationsBatch(payrollRunId: string) {
    const supabase = await createClient();

    const { data: items } = await supabase
        .from('payroll_items')
        .select('employee_id')
        .eq('payroll_run_id', payrollRunId);

    if (!items) return { success: false, error: 'No items found' };

    let successCount = 0;
    let failCount = 0;

    // Process in parallel or sequence? Sequence to avoid rate limits?
    // Twilio handles concurrency well, but let's be safe with storage
    const results = await Promise.all(
        items.map(item => sendPayslipNotification(payrollRunId, item.employee_id))
    );

    results.forEach(r => {
        if (r.success) successCount++;
        else failCount++;
    });

    return { success: true, successCount, failCount };
}
