import { createClient } from '@/lib/supabase/server';

export async function getPayslipSignedUrl(storagePath: string, expiresIn = 60 * 60 * 24 * 7) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .storage
        .from('payslips')
        .createSignedUrl(storagePath, expiresIn);

    if (error) {
        console.error('Error creating signed URL:', error);
        return null;
    }

    return data.signedUrl;
}
