'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Save, Building2, Globe, Calendar, Shield, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import type { Organization } from '@/types/supabase';

export default function SettingsPage() {
  const supabase = createClient();
  const t = useTranslations('settings');
  const tMonths = useTranslations('months');
  const tCommon = useTranslations('common');

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    tin: '',
    address: '',
    default_currency: 'USD',
    fiscal_year_start: 1,
    timorese_employee_percentage: 0,
  });

  const months = [
    tMonths('january'), tMonths('february'), tMonths('march'), tMonths('april'),
    tMonths('may'), tMonths('june'), tMonths('july'), tMonths('august'),
    tMonths('september'), tMonths('october'), tMonths('november'), tMonths('december')
  ];

  useEffect(() => {
    fetchOrganization();
  }, []);

  async function fetchOrganization() {
    const { data } = await supabase
      .from('organizations')
      .select('*')
      .limit(1)
      .single();

    if (data) {
      setOrganization(data);
      setFormData({
        name: data.name || '',
        tin: data.tin || '',
        address: data.address || '',
        default_currency: data.default_currency || 'USD',
        fiscal_year_start: data.fiscal_year_start || 1,
        timorese_employee_percentage: data.timorese_employee_percentage || 0,
      });
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    const qualifiesForReduction = formData.timorese_employee_percentage >= 80;

    if (organization) {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: formData.name,
          tin: formData.tin,
          address: formData.address,
          default_currency: formData.default_currency,
          fiscal_year_start: formData.fiscal_year_start,
          timorese_employee_percentage: formData.timorese_employee_percentage,
          qualifies_for_inss_reduction: qualifiesForReduction,
        })
        .eq('id', organization.id);

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: t('savedSuccess') });
      }
    } else {
      const { error } = await supabase
        .from('organizations')
        .insert({
          name: formData.name,
          tin: formData.tin,
          address: formData.address,
          default_currency: formData.default_currency,
          fiscal_year_start: formData.fiscal_year_start,
          timorese_employee_percentage: formData.timorese_employee_percentage,
          qualifies_for_inss_reduction: qualifiesForReduction,
        });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: t('savedSuccess') });
        fetchOrganization();
      }
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12 text-gray-500">{tCommon('loading')}</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-sm sm:text-base text-gray-500">{t('subtitle')}</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('saving')}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t('saveChanges')}
            </>
          )}
        </Button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Organization Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-gray-400" />
              <CardTitle>{t('organization.title')}</CardTitle>
            </div>
            <CardDescription>{t('organization.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('organization.name')} *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('organization.namePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('organization.tin')}</label>
              <input
                type="text"
                value={formData.tin}
                onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('organization.tinPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('organization.address')}</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('organization.addressPlaceholder')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payroll Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-gray-400" />
              <CardTitle>{t('payroll.title')}</CardTitle>
            </div>
            <CardDescription>{t('payroll.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('payroll.currency')}</label>
              <select
                value={formData.default_currency}
                onChange={(e) => setFormData({ ...formData, default_currency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD - US Dollar</option>
              </select>
              <p className="text-xs text-gray-500">{t('payroll.currencyNote')}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('payroll.fiscalYear')}</label>
              <select
                value={formData.fiscal_year_start}
                onChange={(e) => setFormData({ ...formData, fiscal_year_start: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map((month, idx) => (
                  <option key={idx + 1} value={idx + 1}>{month}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* INSS Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-400" />
              <CardTitle>{t('inss.title')}</CardTitle>
            </div>
            <CardDescription>{t('inss.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t('inss.timoresePercentage')}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.timorese_employee_percentage}
                  onChange={(e) => setFormData({ ...formData, timorese_employee_percentage: parseFloat(e.target.value) || 0 })}
                  className="w-24 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500">{t('inss.qualificationNote')}</p>
            </div>

            <div className={`p-4 rounded-lg ${formData.timorese_employee_percentage >= 80 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="flex items-center gap-2">
                <Shield className={`h-5 w-5 ${formData.timorese_employee_percentage >= 80 ? 'text-green-600' : 'text-gray-400'}`} />
                <div>
                  <div className={`font-medium ${formData.timorese_employee_percentage >= 80 ? 'text-green-800' : 'text-gray-700'}`}>
                    {formData.timorese_employee_percentage >= 80 ? t('inss.qualifies') : t('inss.standard')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formData.timorese_employee_percentage >= 80
                      ? t('inss.qualifiesDesc')
                      : t('inss.standardDesc', { percent: (80 - formData.timorese_employee_percentage).toFixed(0) })}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <div className="text-xl font-bold text-blue-600">4%</div>
                <div className="text-xs text-gray-600">{t('inss.employeeRate')}</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <div className="text-xl font-bold text-blue-600">6%</div>
                <div className="text-xs text-gray-600">{t('inss.employerRate')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <CardTitle>{t('compliance.title')}</CardTitle>
            </div>
            <CardDescription>{t('compliance.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{t('compliance.witMonthly')}</div>
                  <div className="text-sm text-gray-500">{t('compliance.witDesc')}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-orange-600">15th</div>
                  <div className="text-xs text-gray-500">{t('compliance.ofEachMonth')}</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{t('compliance.inssMonthly')}</div>
                  <div className="text-sm text-gray-500">{t('compliance.inssDesc')}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-orange-600">15th</div>
                  <div className="text-xs text-gray-500">{t('compliance.ofEachMonth')}</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{t('compliance.annualTax')}</div>
                  <div className="text-sm text-gray-500">{t('compliance.annualTaxDesc')}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-orange-600">March 31</div>
                  <div className="text-xs text-gray-500">{t('compliance.annually')}</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{t('compliance.employeeDeclarations')}</div>
                  <div className="text-sm text-gray-500">{t('compliance.employeeDeclarationsDesc')}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-orange-600">January 31</div>
                  <div className="text-xs text-gray-500">{t('compliance.annually')}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timor-Leste Compliance Reference */}
      <Card className="mt-4 sm:mt-6">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">{t('reference.title')}</CardTitle>
          <CardDescription>{t('reference.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-500 mb-1">{t('reference.minimumWage')}</div>
              <div className="text-xl font-bold text-gray-900">$115/month</div>
              <div className="text-xs text-gray-400">{t('reference.minimumWageNote')}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-500 mb-1">{t('reference.witRate')}</div>
              <div className="text-xl font-bold text-gray-900">10%</div>
              <div className="text-xs text-gray-400">{t('reference.witRateNote')}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-500 mb-1">{t('reference.overtimeRate')}</div>
              <div className="text-xl font-bold text-gray-900">+50%</div>
              <div className="text-xs text-gray-400">{t('reference.overtimeRateNote')}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-500 mb-1">{t('reference.annualLeave')}</div>
              <div className="text-xl font-bold text-gray-900">12 days</div>
              <div className="text-xs text-gray-400">{t('reference.annualLeaveNote')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
