import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Calendar, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  // TODO: Fetch real data from Supabase
  const stats = {
    totalEmployees: 0,
    activeEmployees: 0,
    pendingPayroll: 0,
    upcomingDeadlines: 2,
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome to Timor Payroll</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Employees
            </CardTitle>
            <Users className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.activeEmployees} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pending Payroll
            </CardTitle>
            <DollarSign className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingPayroll}</div>
            <p className="text-xs text-gray-500 mt-1">
              runs to process
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Next Pay Date
            </CardTitle>
            <Calendar className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">--</div>
            <p className="text-xs text-gray-500 mt-1">
              No payroll scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Compliance Deadlines
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">
              {stats.upcomingDeadlines}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              due this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <a
              href="/dashboard/employees/new"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">Add Employee</div>
                <div className="text-sm text-gray-500">Register a new staff member</div>
              </div>
            </a>
            <a
              href="/dashboard/payroll/new"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium">Run Payroll</div>
                <div className="text-sm text-gray-500">Process monthly salaries</div>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">WIT Monthly Filing</div>
                  <div className="text-sm text-gray-500">Due: 15th of month</div>
                </div>
                <span className="text-sm font-medium text-orange-600">7 days</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">INSS Monthly Filing</div>
                  <div className="text-sm text-gray-500">Due: 15th of month</div>
                </div>
                <span className="text-sm font-medium text-orange-600">7 days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Timor-Leste Compliance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 text-center">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">$115</div>
              <div className="text-sm text-gray-500">Minimum Wage</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">10%</div>
              <div className="text-sm text-gray-500">WIT Tax Rate</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">4% + 6%</div>
              <div className="text-sm text-gray-500">INSS Contributions</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">$500</div>
              <div className="text-sm text-gray-500">Tax Exemption</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
