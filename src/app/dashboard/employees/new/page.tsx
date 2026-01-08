import { EmployeeForm } from '@/components/employees/employee-form';
import { getTranslations } from 'next-intl/server';

export default async function NewEmployeePage() {
  const t = await getTranslations('employees');

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('addEmployee')}</h1>
        <p className="text-gray-500">{t('subtitle')}</p>
      </div>

      <EmployeeForm />
    </div>
  );
}
