import Link from 'next/link';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { EmployeeStatusBadge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { DropdownMenu, DropdownItem, DropdownDivider } from '@/components/ui/dropdown-menu';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';

export default async function EmployeesPage() {
  const supabase = await createClient();
  const t = await getTranslations('employees');
  const tCommon = await getTranslations('common');

  const { data: employees, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[{ label: t('title') }]}
        className="mb-4"
      />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-sm sm:text-base text-gray-500">{t('subtitle')}</p>
        </div>
        <Link href="/dashboard/employees/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            {t('addEmployee')}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle>{tCommon('all')} {t('title')}</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                className="w-full sm:w-64 pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                aria-label={t('searchPlaceholder')}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-red-500 p-4 bg-red-50 rounded-lg" role="alert">
              {tCommon('error')}: {error.message}
            </div>
          )}

          {employees && employees.length === 0 && (
            <EmptyState
              illustration="employees"
              title={t('noEmployees')}
              description={t('addFirst')}
              action={{
                label: t('addEmployee'),
                onClick: () => {},
              }}
            />
          )}

          {employees && employees.length > 0 && (
            <Table stickyHeader>
              <TableHeader sticky>
                <TableRow>
                  <TableHead>{t('personal.fullName')}</TableHead>
                  <TableHead>{t('employment.position')}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('employment.department')}</TableHead>
                  <TableHead>{tCommon('status')}</TableHead>
                  <TableHead className="hidden sm:table-cell">{t('compensation.baseSalary')}</TableHead>
                  <TableHead className="text-right">{tCommon('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={`${employee.first_name} ${employee.last_name}`}
                          size="sm"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {employee.first_name} {employee.last_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {employee.employee_number}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {employee.department || '-'}
                    </TableCell>
                    <TableCell>
                      <EmployeeStatusBadge
                        status={employee.status as 'active' | 'inactive' | 'terminated'}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {formatCurrency(employee.base_salary)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu
                        trigger={
                          <Button variant="ghost" size="icon" aria-label="Actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      >
                        <DropdownItem
                          icon={<Eye className="h-4 w-4" />}
                          onClick={() => {}}
                        >
                          <Link href={`/dashboard/employees/${employee.id}`}>
                            {tCommon('view')}
                          </Link>
                        </DropdownItem>
                        <DropdownItem
                          icon={<Pencil className="h-4 w-4" />}
                          onClick={() => {}}
                        >
                          <Link href={`/dashboard/employees/${employee.id}/edit`}>
                            {tCommon('edit')}
                          </Link>
                        </DropdownItem>
                        <DropdownDivider />
                        <DropdownItem
                          icon={<Trash2 className="h-4 w-4" />}
                          destructive
                          onClick={() => {}}
                        >
                          {tCommon('delete')}
                        </DropdownItem>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
