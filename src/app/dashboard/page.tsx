import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Users, DollarSign, Calendar, AlertCircle, FileText, UserPlus, Calculator } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { FeatureCard } from '@/components/ui/glass-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeadlineList } from '@/components/deadlines';
import { EmptyState } from '@/components/ui/empty-state';
import { createClient } from '@/lib/supabase/server';
import { getUpcomingDeadlines } from '@/lib/deadlines';
import { formatCurrency, formatDate } from '@/lib/utils';

function getMonthRange(monthOffset: number) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 0, 23, 59, 59, 999);
  return { monthStart, monthEnd };
}

function getCumulativeMonthlyCounts(
  isoDates: string[],
  months: number
): number[] {
  const sorted = isoDates
    .map((d) => new Date(d).getTime())
    .filter((t) => !Number.isNaN(t))
    .sort((a, b) => a - b);

  if (sorted.length === 0) return [];

  return Array.from({ length: months }).map((_, i) => {
    const monthOffset = i - (months - 1);
    const { monthEnd } = getMonthRange(monthOffset);
    const endTime = monthEnd.getTime();

    let count = 0;
    for (const t of sorted) {
      if (t <= endTime) count++;
      else break;
    }
    return count;
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const t = await getTranslations('dashboard');
  const tCommon = await getTranslations('common');

  const [
    { data: organization },
    { data: employees, error: employeesError },
    { data: payrollRuns, error: payrollRunsError },
    { count: pendingLeaveCount, error: leaveRequestsError },
  ] = await Promise.all([
    supabase.from('organizations').select('id').limit(1).maybeSingle(),
    supabase.from('employees').select('id, status, base_salary, created_at'),
    supabase
      .from('payroll_runs')
      .select('id, status, total_net, period_start, period_end, employee_count, created_at')
      .order('period_end', { ascending: false })
      .limit(12),
    supabase
      .from('leave_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ]);

  const totalEmployees = employees?.length ?? 0;
  const activeEmployees =
    employees?.filter((e) => (e.status ?? 'active') === 'active').length ?? 0;

  const monthlyPayroll =
    employees?.reduce((sum, e) => {
      const isActive = (e.status ?? 'active') === 'active';
      return isActive ? sum + (e.base_salary || 0) : sum;
    }, 0) ?? 0;

  const pendingPayroll =
    payrollRuns?.filter((r) => r.status === 'draft' || r.status === 'processing').length ??
    0;

  const deadlines = getUpcomingDeadlines();
  const urgentDeadlines = deadlines.filter(
    (d) => d.urgency === 'overdue' || d.urgency === 'urgent' || d.urgency === 'warning'
  ).length;

  const employeeGrowth = getCumulativeMonthlyCounts(
    employees?.map((e) => e.created_at) ?? [],
    7
  );

  const payrollHistory = (payrollRuns ?? [])
    .slice(0, 7)
    .map((r) => r.total_net || 0)
    .reverse();

  const hasSetupIssue = !organization || totalEmployees === 0;
  const needsFirstPayroll = totalEmployees > 0 && (payrollRuns?.length ?? 0) === 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {(employeesError || payrollRunsError || leaveRequestsError) && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {tCommon('error')}: {(employeesError || payrollRunsError || leaveRequestsError)?.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          {t('title')}
        </h1>
        <p className="text-sm text-gray-500">{t('overview')}</p>
      </div>

      {hasSetupIssue && (
        <Card className="mb-6">
          <CardContent>
            {!organization ? (
              <EmptyState
                illustration="folder"
                title="Finish setup to get started"
                description="Add your organization details, then start by creating your first employee."
                action={{ label: 'Go to Settings', href: '/dashboard/settings' }}
                secondaryAction={{ label: 'Add Employee', href: '/dashboard/employees/new' }}
                className="py-10"
              />
            ) : (
              <EmptyState
                illustration="employees"
                title="Add your first employee"
                description="Once employees are added, you can run payroll and generate payslips."
                action={{ label: 'Add Employee', href: '/dashboard/employees/new' }}
                secondaryAction={{ label: 'Run Payroll', href: '/dashboard/payroll/new' }}
                className="py-10"
              />
            )}
          </CardContent>
        </Card>
      )}

      {needsFirstPayroll && (
        <Card className="mb-6">
          <CardContent>
            <EmptyState
              illustration="payroll"
              title="Run your first payroll"
              description="Create a payroll run, review totals, then generate payslips."
              action={{ label: 'Run Payroll', href: '/dashboard/payroll/new' }}
              secondaryAction={{ label: 'View Employees', href: '/dashboard/employees' }}
              className="py-10"
            />
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title={t('totalEmployees')}
          value={totalEmployees}
          trend={totalEmployees > 0 ? 'up' : 'neutral'}
          icon={<Users className="h-4 w-4" />}
          sparklineData={employeeGrowth.length > 1 ? employeeGrowth : undefined}
          href="/dashboard/employees"
        />

        <StatCard
          title={t('activeEmployees')}
          value={activeEmployees}
          trend={activeEmployees > 0 ? 'up' : 'neutral'}
          icon={<Users className="h-4 w-4" />}
          href="/dashboard/employees"
        />

        <StatCard
          title={t('monthlyPayroll')}
          value={monthlyPayroll}
          prefix="$"
          trend={monthlyPayroll > 0 ? 'up' : 'neutral'}
          icon={<DollarSign className="h-4 w-4" />}
          sparklineData={payrollHistory.length > 1 ? payrollHistory : undefined}
          href="/dashboard/payroll"
        />

        <StatCard
          title={t('upcomingDeadlines')}
          value={urgentDeadlines}
          trend={urgentDeadlines > 0 ? 'down' : 'neutral'}
          icon={<AlertCircle className="h-4 w-4" />}
          href="/dashboard/settings"
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
            description={
              pendingPayroll > 0
                ? `${pendingPayroll} run${pendingPayroll === 1 ? '' : 's'} pending`
                : 'Process monthly salaries'
            }
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
            description={
              (pendingLeaveCount ?? 0) > 0
                ? `${pendingLeaveCount} pending request${pendingLeaveCount === 1 ? '' : 's'}`
                : 'Review requests'
            }
            href="/dashboard/leave"
            color="orange"
          />
        </div>
      </div>

      {/* Deadlines & Compliance */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Upcoming Deadlines */}
        <DeadlineList maxItems={4} showViewAll={true} />

        {/* Recent Payroll */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Recent Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            {(payrollRuns?.length ?? 0) === 0 ? (
              <EmptyState
                illustration="payroll"
                title="No payroll runs yet"
                description="Create your first payroll run to see history here."
                action={{ label: 'Run Payroll', href: '/dashboard/payroll/new' }}
                className="py-10"
              />
            ) : (
              <div className="space-y-3">
                {payrollRuns?.slice(0, 5).map((run) => {
                  const status = (run.status ?? 'draft') as string;
                  const statusStyles: Record<string, string> = {
                    draft: 'bg-gray-100 text-gray-700',
                    processing: 'bg-amber-100 text-amber-800',
                    approved: 'bg-blue-100 text-blue-800',
                    paid: 'bg-emerald-100 text-emerald-800',
                  };

                  return (
                    <Link
                      key={run.id}
                      href={`/dashboard/payroll/${run.id}`}
                      className="block rounded-lg border border-gray-200 bg-white p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {formatDate(run.period_start)} – {formatDate(run.period_end)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(run.employee_count ?? 0).toLocaleString()} employees · {formatCurrency(run.total_net || 0)} net
                          </p>
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] ?? statusStyles.draft}`}>
                          {status}
                        </span>
                      </div>
                    </Link>
                  );
                })}

                <div className="pt-2">
                  <Link href="/dashboard/payroll" className="text-sm text-gray-500 hover:text-gray-900">
                    {t('viewAll')}
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
