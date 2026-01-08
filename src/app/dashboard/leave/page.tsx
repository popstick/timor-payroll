'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import type { LeaveRequest, Employee } from '@/types/supabase';

type LeaveRequestWithEmployee = LeaveRequest & {
  employees: Pick<Employee, 'first_name' | 'last_name' | 'employee_number'>;
};

const leaveTypeLabels: Record<string, string> = {
  annual: 'Annual Leave',
  sick: 'Sick Leave',
  personal: 'Personal Leave',
  maternity: 'Maternity Leave',
  paternity: 'Paternity Leave',
  unpaid: 'Unpaid Leave',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  cancelled: AlertCircle,
};

export default function LeavePage() {
  const supabase = createClient();
  const [requests, setRequests] = useState<LeaveRequestWithEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  async function fetchLeaveRequests() {
    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        employees (first_name, last_name, employee_number)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRequests(data as LeaveRequestWithEmployee[]);
    }
    setLoading(false);
  }

  async function updateRequestStatus(id: string, status: 'approved' | 'rejected') {
    const { error } = await supabase
      .from('leave_requests')
      .update({
        status,
        approved_at: status === 'approved' ? new Date().toISOString() : null,
      })
      .eq('id', id);

    if (!error) {
      fetchLeaveRequests();
    }
  }

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter);

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    total: requests.length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-sm sm:text-base text-gray-500">Manage employee leave requests</p>
        </div>
        <Link href="/dashboard/leave/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-4 mb-6 sm:mb-8">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('all')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Requests</CardTitle>
            <Calendar className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('pending')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
            <Clock className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('approved')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Approved</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('rejected')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Rejected</CardTitle>
            <XCircle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Leave Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {filter === 'all' ? 'No leave requests yet' : `No ${filter} requests`}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredRequests.map((request) => {
                const StatusIcon = statusIcons[request.status] || Clock;
                return (
                  <div
                    key={request.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                      <div className={`p-2 rounded-lg shrink-0 ${statusColors[request.status]}`}>
                        <StatusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 text-sm sm:text-base">
                          {request.employees?.first_name} {request.employees?.last_name}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          {leaveTypeLabels[request.leave_type] || request.leave_type} - {request.days_requested} day(s)
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400">
                          {format(new Date(request.start_date), 'MMM d, yyyy')} - {format(new Date(request.end_date), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 ml-9 sm:ml-0">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                        {request.status}
                      </span>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateRequestStatus(request.id, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateRequestStatus(request.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leave Entitlements Info */}
      <Card className="mt-4 sm:mt-6">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Timor-Leste Leave Entitlements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">12 days</div>
              <div className="text-sm text-gray-600">Annual Leave</div>
              <div className="text-xs text-gray-400">Per year (after 1 year)</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">12 weeks</div>
              <div className="text-sm text-gray-600">Maternity Leave</div>
              <div className="text-xs text-gray-400">Paid leave</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">5 days</div>
              <div className="text-sm text-gray-600">Paternity Leave</div>
              <div className="text-xs text-gray-400">Paid leave</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">30 days</div>
              <div className="text-sm text-gray-600">Sick Leave</div>
              <div className="text-xs text-gray-400">Per year (with cert)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
