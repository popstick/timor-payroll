'use client';

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  DollarSign,
  Calendar,
  FileText,
  Settings,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <DollarSign className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" />
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Timor Payroll
              </span>
            </div>

            {/* Desktop nav */}
            <nav className="hidden sm:flex items-center gap-4">
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

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile nav */}
          {mobileMenuOpen && (
            <nav className="sm:hidden pt-4 pb-2 border-t border-gray-200 dark:border-gray-700 mt-4 flex flex-col gap-3">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-10 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Payroll Made Simple for
            <span className="text-blue-600"> Timor-Leste</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
            Compliant payroll processing with built-in WIT tax calculations,
            INSS contributions, and multilingual support in English, Portuguese,
            and Tetum.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Get Started <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition font-medium"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
        <div className="mt-10 sm:mt-16 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">
            Built for Timor-Leste Compliance
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center">
            <StatCard value="$115" label="Minimum Wage" sublabel="/month" />
            <StatCard value="10%" label="WIT Tax Rate" sublabel=">$500" />
            <StatCard value="10%" label="INSS Total" sublabel="4% + 6%" />
            <StatCard value="12" label="Annual Leave" sublabel="days/year" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-10 sm:mt-16 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm sm:text-base">Timor Payroll - Payroll Management for Timor-Leste</p>
          <p className="text-xs sm:text-sm mt-2">
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
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
      <div className="text-blue-600 mb-3 sm:mb-4 [&>svg]:h-6 [&>svg]:w-6 sm:[&>svg]:h-8 sm:[&>svg]:w-8">{icon}</div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{description}</p>
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
    <div className="p-2 sm:p-0">
      <div className="text-2xl sm:text-3xl font-bold text-blue-600">{value}</div>
      <div className="text-sm sm:text-base text-gray-900 dark:text-white font-medium">{label}</div>
      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{sublabel}</div>
    </div>
  );
}
