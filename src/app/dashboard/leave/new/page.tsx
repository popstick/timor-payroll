'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { differenceInBusinessDays, parseISO } from 'date-fns';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import type { Employee } from '@/types/supabase';

export default function NewLeaveRequestPage() {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations('leave');
  const tCommon = useTranslations('common');

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type: 'annual',
    start_date: '',
    end_date: '',
    reason: '',
  });

  async function fetchEmployees() {
    const { data } = await supabase
      .from('employees')
      .select('*')
      .eq('status', 'active')
      .order('first_name');

    if (data) {
      setEmployees(data);
    }
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  function calculateDays(): number {
    if (!formData.start_date || !formData.end_date) return 0;
    const start = parseISO(formData.start_date);
    const end = parseISO(formData.end_date);
    // Simple calculation - in production, would exclude weekends and holidays
    const days = differenceInBusinessDays(end, start) + 1;
    return Math.max(0, days);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const daysRequested = calculateDays();

    if (daysRequested <= 0) {
      setError(t('form.invalidDateRange'));
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('leave_requests')
      .insert({
        employee_id: formData.employee_id,
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        days_requested: daysRequested,
        reason: formData.reason || null,
        status: 'pending',
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard/leave');
  }

  const leaveTypes = [
    { value: 'annual', label: t('types.annual'), description: t('descriptions.annual') },
    { value: 'sick', label: t('types.sick'), description: t('descriptions.sick') },
    { value: 'personal', label: t('types.personal'), description: t('descriptions.personal') },
    { value: 'maternity', label: t('types.maternity'), description: t('descriptions.maternity') },
    { value: 'paternity', label: t('types.paternity'), description: t('descriptions.paternity') },
    { value: 'unpaid', label: t('types.unpaid'), description: t('descriptions.unpaid') },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/leave">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('requestLeave')}</h1>
          <p className="text-gray-500">{t('subtitle')}</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{t('requestLeave')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Employee Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('form.employee')} *</label>
              <select
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">{t('form.selectEmployee')}</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.employee_number})
                  </option>
                ))}
              </select>
            </div>

            {/* Leave Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('form.leaveType')} *</label>
              <div className="grid gap-3 md:grid-cols-2">
                {leaveTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.leave_type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="leave_type"
                      value={type.value}
                      checked={formData.leave_type === type.value}
                      onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t('form.startDate')} *</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{t('form.endDate')} *</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  min={formData.start_date}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Days Summary */}
            {formData.start_date && formData.end_date && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">{t('form.daysRequested')}</div>
                <div className="text-2xl font-bold text-blue-600">{t('form.days', { count: calculateDays() })}</div>
              </div>
            )}

            {/* Reason */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('form.reason')} ({tCommon('optional')})</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('form.reasonPlaceholder')}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {tCommon('submitting')}
                  </>
                ) : (
                  tCommon('submit')
                )}
              </Button>
              <Link href="/dashboard/leave">
                <Button type="button" variant="outline">
                  {tCommon('cancel')}
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
