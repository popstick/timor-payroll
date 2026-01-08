'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function approvePayrollRun(payrollRunId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('payroll_runs')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: user.id,
    })
    .eq('id', payrollRunId)
    .eq('status', 'draft');

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/payroll');
  revalidatePath(`/dashboard/payroll/${payrollRunId}`);
}

export async function markPayrollRunPaid(payrollRunId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('payroll_runs')
    .update({
      status: 'paid',
    })
    .eq('id', payrollRunId)
    .in('status', ['approved', 'processing']);

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/payroll');
  revalidatePath(`/dashboard/payroll/${payrollRunId}`);
}

