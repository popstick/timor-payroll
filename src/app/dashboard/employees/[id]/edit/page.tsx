import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmployeeForm } from '@/components/employees/employee-form';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations('employees');
  const { id } = await params;
  const supabase = await createClient();

  const { data: employee, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !employee) {
    notFound();
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/dashboard/employees/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('editEmployee')}</h1>
          <p className="text-gray-500">
            {employee.first_name} {employee.last_name}
          </p>
        </div>
      </div>

      <EmployeeForm
        employee={employee}
        organizationId={employee.organization_id}
      />
    </div>
  );
}
