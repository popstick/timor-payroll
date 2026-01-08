'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { MINIMUM_WAGE_MONTHLY } from '@/lib/payroll/constants';
import type { Employee } from '@/types/supabase';

interface EmployeeFormProps {
  employee?: Employee;
  organizationId?: string;
}

export function EmployeeForm({ employee, organizationId }: EmployeeFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations('employees');
  const tCommon = useTranslations('common');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: employee?.first_name || '',
    last_name: employee?.last_name || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    date_of_birth: employee?.date_of_birth || '',
    gender: employee?.gender || '',
    nationality: employee?.nationality || 'Timorese',
    address: employee?.address || '',
    employee_number: employee?.employee_number || '',
    position: employee?.position || '',
    department: employee?.department || '',
    employment_type: employee?.employment_type || 'full_time',
    start_date: employee?.start_date || new Date().toISOString().split('T')[0],
    base_salary: employee?.base_salary?.toString() || '',
    tin: employee?.tin || '',
    inss_number: employee?.inss_number || '',
    is_resident: employee?.is_resident ?? true,
    status: employee?.status || 'active',
    notification_preference: employee?.notification_preference || 'none',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate minimum wage
    const salary = parseFloat(formData.base_salary);
    if (salary < MINIMUM_WAGE_MONTHLY) {
      setError(t('compensation.belowMinimum', { amount: MINIMUM_WAGE_MONTHLY }));
      setLoading(false);
      return;
    }

    try {
      // For now, we'll create a default organization if none exists
      // In production, this would come from auth context
      let orgId = organizationId;

      if (!orgId) {
        // Check if org exists, if not create one
        const { data: orgs } = await supabase
          .from('organizations')
          .select('id')
          .limit(1);

        if (orgs && orgs.length > 0) {
          orgId = orgs[0].id;
        } else {
          // Create default organization
          const { data: newOrg, error: orgError } = await supabase
            .from('organizations')
            .insert({ name: 'My Company' })
            .select()
            .single();

          if (orgError) throw orgError;
          orgId = newOrg.id;
        }
      }

      const employeeData = {
        ...formData,
        base_salary: parseFloat(formData.base_salary),
        organization_id: orgId,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        department: formData.department || null,
        tin: formData.tin || null,
        inss_number: formData.inss_number || null,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        notification_preference: formData.notification_preference,
      };

      if (employee) {
        // Update existing employee
        const { error: updateError } = await supabase
          .from('employees')
          .update(employeeData)
          .eq('id', employee.id);

        if (updateError) throw updateError;
      } else {
        // Create new employee
        const { error: insertError } = await supabase
          .from('employees')
          .insert(employeeData);

        if (insertError) throw insertError;
      }

      router.push('/dashboard/employees');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('personal.title')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={`${t('personal.firstName')} *`}
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
              <Input
                label={`${t('personal.lastName')} *`}
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
            <Input
              label={t('personal.email')}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <Input
              label={t('personal.phone')}
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t('personal.dateOfBirth')}
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
              />
              <Select
                label={t('personal.gender')}
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={[
                  { value: '', label: tCommon('selectPlaceholder') },
                  { value: 'male', label: t('personal.male') },
                  { value: 'female', label: t('personal.female') },
                  { value: 'other', label: t('personal.other') },
                ]}
              />
            </div>
            <Input
              label={t('personal.nationality')}
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
            />
            <Input
              label={t('personal.address')}
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>{t('notifications.title')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Select
              label={t('notifications.preference')}
              name="notification_preference"
              value={formData.notification_preference}
              onChange={handleChange}
              options={[
                { value: 'none', label: t('notifications.none') },
                { value: 'whatsapp', label: t('notifications.whatsapp') },
                { value: 'sms', label: t('notifications.sms') },
              ]}
            />
          </CardContent>
        </Card>

        {/* Employment Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('employment.title')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Input
              label={`${t('employment.employeeNumber')} *`}
              name="employee_number"
              value={formData.employee_number}
              onChange={handleChange}
              required
              placeholder="e.g., EMP001"
            />
            <Input
              label={`${t('employment.position')} *`}
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
            />
            <Input
              label={t('employment.department')}
              name="department"
              value={formData.department}
              onChange={handleChange}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label={t('employment.employmentType')}
                name="employment_type"
                value={formData.employment_type}
                onChange={handleChange}
                options={[
                  { value: 'full_time', label: t('employment.fullTime') },
                  { value: 'part_time', label: t('employment.partTime') },
                  { value: 'contract', label: t('employment.contract') },
                ]}
              />
              <Select
                label={t('employment.status')}
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={[
                  { value: 'active', label: t('employment.active') },
                  { value: 'inactive', label: t('employment.inactive') },
                  { value: 'terminated', label: t('employment.terminated') },
                ]}
              />
            </div>
            <Input
              label={`${t('employment.startDate')} *`}
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </CardContent>
        </Card>

        {/* Compensation */}
        <Card>
          <CardHeader>
            <CardTitle>{t('compensation.title')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Input
              label={`${t('compensation.baseSalary')} * - ${t('compensation.minimumWage', { amount: MINIMUM_WAGE_MONTHLY })}`}
              name="base_salary"
              type="number"
              step="0.01"
              min={MINIMUM_WAGE_MONTHLY}
              value={formData.base_salary}
              onChange={handleChange}
              required
              error={
                formData.base_salary && parseFloat(formData.base_salary) < MINIMUM_WAGE_MONTHLY
                  ? t('compensation.belowMinimum', { amount: MINIMUM_WAGE_MONTHLY })
                  : undefined
              }
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_resident"
                name="is_resident"
                checked={formData.is_resident}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_resident: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_resident" className="text-sm text-gray-700">
                {t('tax.residentHelp')}
              </label>
            </div>
            <p className="text-sm text-gray-500">
              {t('tax.residentBenefit')}
            </p>
          </CardContent>
        </Card>

        {/* Government IDs */}
        <Card>
          <CardHeader>
            <CardTitle>{t('govIds.title')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Input
              label={t('tax.tin')}
              name="tin"
              value={formData.tin}
              onChange={handleChange}
              placeholder={t('govIds.tinPlaceholder')}
            />
            <Input
              label={t('tax.inssNumber')}
              name="inss_number"
              value={formData.inss_number}
              onChange={handleChange}
              placeholder={t('govIds.inssPlaceholder')}
            />
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          {tCommon('cancel')}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? tCommon('saving') : employee ? tCommon('save') : t('addEmployee')}
        </Button>
      </div>
    </form>
  );
}
