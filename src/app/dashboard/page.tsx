import { getTranslations } from 'next-intl/server';
import { Users, DollarSign, Calendar, AlertCircle, ArrowRight, FileText, UserPlus, Calculator } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { FeatureCard, BentoGrid, BentoCard } from '@/components/ui/glass-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');
  const tSettings = await getTranslations('settings.reference');

  // TODO: Fetch real data from Supabase
  const stats = {
    totalEmployees: 12,
    activeEmployees: 10,
    pendingPayroll: 2,
    monthlyPayroll: 14500,
    upcomingDeadlines: 2,
  };

  // Sample sparkline data
  const employeeGrowth = [8, 9, 9, 10, 10, 11, 12];
  const payrollHistory = [12000, 12500, 13000, 13200, 14000, 14200, 14500];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          {t('title')}
        </h1>
        <p className="text-sm text-gray-500">{t('overview')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title={t('totalEmployees')}
          value={stats.totalEmployees}
          change={8}
          trend="up"
          changeLabel="from last month"
          icon={<Users className="h-4 w-4" />}
          sparklineData={employeeGrowth}
        />

        <StatCard
          title={t('activeEmployees')}
          value={stats.activeEmployees}
          trend="neutral"
          icon={<Users className="h-4 w-4" />}
        />

        <StatCard
          title={t('monthlyPayroll')}
          value={stats.monthlyPayroll}
          prefix="$"
          change={3.2}
          trend="up"
          changeLabel="vs last month"
          icon={<DollarSign className="h-4 w-4" />}
          sparklineData={payrollHistory}
        />

        <StatCard
          title={t('upcomingDeadlines')}
          value={stats.upcomingDeadlines}
          trend="down"
          changeLabel="due this month"
          icon={<AlertCircle className="h-4 w-4" />}
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-500 mb-3">{t('quickActions')}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<UserPlus className="h-5 w-5" />}
            title={t('addEmployee')}
            description="Register a new staff member"
            href="/dashboard/employees/new"
            color="primary"
          />
          <FeatureCard
            icon={<Calculator className="h-5 w-5" />}
            title={t('runPayroll')}
            description="Process monthly salaries"
            href="/dashboard/payroll"
            color="green"
          />
          <FeatureCard
            icon={<FileText className="h-5 w-5" />}
            title="Generate Report"
            description="Export payroll data"
            href="/dashboard/reports"
            color="cyan"
          />
          <FeatureCard
            icon={<Calendar className="h-5 w-5" />}
            title="Leave Requests"
            description="Review pending requests"
            href="/dashboard/leave"
            color="orange"
          />
        </div>
      </div>

      {/* Deadlines & Compliance */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">{t('upcomingDeadlines')}</CardTitle>
              <span className="text-xs text-gray-500">
                {stats.upcomingDeadlines} pending
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              <div className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-medium">15</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{t('witFiling')}</p>
                  <p className="text-xs text-gray-500">Monthly withholding tax</p>
                </div>
                <span className="text-xs text-amber-600">7 days</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-medium">15</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{t('inssFiling')}</p>
                  <p className="text-xs text-gray-500">Social security contributions</p>
                </div>
                <span className="text-xs text-amber-600">7 days</span>
              </div>
            </div>
            <div className="px-6 py-3 border-t border-gray-100">
              <Button variant="ghost" size="sm" className="w-full justify-center gap-2 text-gray-500">
                View all
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Timor-Leste Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">{tSettings('minimumWage')}</p>
                <p className="text-lg font-semibold text-gray-900">$115</p>
                <p className="text-xs text-gray-400">per month</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">{tSettings('witRate')}</p>
                <p className="text-lg font-semibold text-gray-900">10%</p>
                <p className="text-xs text-gray-400">above $500</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">INSS Rate</p>
                <p className="text-lg font-semibold text-gray-900">4% + 6%</p>
                <p className="text-xs text-gray-400">employee + employer</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Tax Exemption</p>
                <p className="text-lg font-semibold text-gray-900">$500</p>
                <p className="text-xs text-gray-400">for residents</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
