import Link from "next/link";
import {
  Users,
  DollarSign,
  Calendar,
  FileText,
  Settings,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Timor Payroll
              </span>
            </div>
            <nav className="flex gap-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Dashboard
              </Link>
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Payroll Made Simple for
            <span className="text-blue-600"> Timor-Leste</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Compliant payroll processing with built-in WIT tax calculations,
            INSS contributions, and multilingual support in English, Portuguese,
            and Tetum.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Get Started <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition font-medium"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Users className="h-8 w-8" />}
            title="Employee Management"
            description="Track employee details, contracts, TIN, and INSS numbers. Handle all employment types."
          />
          <FeatureCard
            icon={<DollarSign className="h-8 w-8" />}
            title="Payroll Processing"
            description="Automatic tax calculations with $500 exemption, INSS contributions (4%+6%), overtime rates."
          />
          <FeatureCard
            icon={<Calendar className="h-8 w-8" />}
            title="Leave Management"
            description="Track annual leave (12 days), sick leave, maternity (12 weeks), paternity (5 days), and more."
          />
          <FeatureCard
            icon={<FileText className="h-8 w-8" />}
            title="Compliance Reports"
            description="Generate monthly WIT and INSS filings, annual reports, and employee tax certificates."
          />
          <FeatureCard
            icon={<Settings className="h-8 w-8" />}
            title="Timor-Leste Compliant"
            description="Built for Labour Code Law No. 4/2012. Minimum wage validation, holiday pay rates, severance."
          />
          <FeatureCard
            icon={<FileText className="h-8 w-8" />}
            title="Multilingual"
            description="Full support for English, Portuguese, and Tetum. Generate payslips in any language."
          />
        </div>

        {/* Compliance Stats */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Built for Timor-Leste Compliance
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatCard value="$115" label="Minimum Wage" sublabel="/month" />
            <StatCard value="10%" label="WIT Tax Rate" sublabel=">$500" />
            <StatCard value="10%" label="INSS Total" sublabel="4% + 6%" />
            <StatCard value="12" label="Annual Leave" sublabel="days/year" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 dark:text-gray-400">
          <p>Timor Payroll - Payroll Management for Timor-Leste</p>
          <p className="text-sm mt-2">
            Compliant with Labour Code Law No. 4/2012 and INSS Law No. 12/2016
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
      <div className="text-blue-600 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

function StatCard({
  value,
  label,
  sublabel,
}: {
  value: string;
  label: string;
  sublabel: string;
}) {
  return (
    <div>
      <div className="text-3xl font-bold text-blue-600">{value}</div>
      <div className="text-gray-900 dark:text-white font-medium">{label}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{sublabel}</div>
    </div>
  );
}
