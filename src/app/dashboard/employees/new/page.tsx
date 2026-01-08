import { EmployeeForm } from '@/components/employees/employee-form';

export default function NewEmployeePage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add Employee</h1>
        <p className="text-gray-500">Register a new staff member</p>
      </div>

      <EmployeeForm />
    </div>
  );
}
