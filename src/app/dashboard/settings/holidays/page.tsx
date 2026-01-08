'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft, Calendar, ChevronDown, Flag, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PUBLIC_HOLIDAYS_2025 } from '@/lib/payroll/constants';

type Holiday = {
  date: string;
  name_en: string;
  name_pt: string;
  name_tet: string;
};

// Generate 2026 holidays (shift dates by 1 year, keep recurring ones same date)
const PUBLIC_HOLIDAYS_2026: Holiday[] = PUBLIC_HOLIDAYS_2025.map((h): Holiday => ({
  ...h,
  date: h.date.replace('2025', '2026'),
}));

const HOLIDAYS_BY_YEAR: Record<number, readonly Holiday[]> = {
  2025: PUBLIC_HOLIDAYS_2025,
  2026: PUBLIC_HOLIDAYS_2026,
};

export default function HolidaysPage() {
  const t = useTranslations('settings.holidays');
  const locale = useLocale();

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const holidays: readonly Holiday[] = HOLIDAYS_BY_YEAR[selectedYear] || PUBLIC_HOLIDAYS_2025;

  const getHolidayName = (holiday: Holiday) => {
    switch (locale) {
      case 'pt':
        return holiday.name_pt;
      case 'tet':
        return holiday.name_tet;
      default:
        return holiday.name_en;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'tet' ? 'pt-PT' : locale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getMonthName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'tet' ? 'pt-PT' : locale, {
      month: 'long',
    });
  };

  // Group holidays by month
  const holidaysByMonth = holidays.reduce((acc, holiday) => {
    const month = new Date(holiday.date).getMonth();
    if (!acc[month]) acc[month] = [];
    acc[month].push(holiday);
    return acc;
  }, {} as Record<number, Holiday[]>);

  // Count total holidays
  const totalHolidays = holidays.length;

  // Upcoming holidays (from today)
  const today = new Date();
  const upcomingHolidays = holidays.filter(h => new Date(h.date) >= today).slice(0, 3);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Breadcrumb */}
      <Link
        href="/dashboard/settings"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        {t('backToSettings')}
      </Link>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-sm sm:text-base text-gray-500">{t('subtitle')}</p>
        </div>

        {/* Year Selector */}
        <div className="relative">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#F86037]"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F86037]/10 rounded-lg">
                <Calendar className="h-5 w-5 text-[#F86037]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalHolidays}</div>
                <div className="text-sm text-gray-500">{t('totalHolidays')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Flag className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">4</div>
                <div className="text-sm text-gray-500">{t('nationalDays')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">5</div>
                <div className="text-sm text-gray-500">{t('religiousHolidays')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Holidays */}
      {upcomingHolidays.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">{t('upcomingHolidays')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {upcomingHolidays.map((holiday) => (
                <div
                  key={holiday.date}
                  className="flex items-center gap-3 px-4 py-2 bg-[#F86037]/5 border border-[#F86037]/20 rounded-lg"
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#F86037]">
                      {new Date(holiday.date).getDate()}
                    </div>
                    <div className="text-xs text-gray-500 uppercase">
                      {new Date(holiday.date).toLocaleDateString(locale === 'tet' ? 'pt-PT' : locale, { month: 'short' })}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {getHolidayName(holiday)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Holiday Calendar by Month */}
      <Card>
        <CardHeader>
          <CardTitle>{t('holidayCalendar')} {selectedYear}</CardTitle>
          <CardDescription>{t('holidayCalendarDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(holidaysByMonth).map(([monthIndex, monthHolidays]) => (
              <div key={monthIndex}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {getMonthName(monthHolidays[0].date)}
                </h3>
                <div className="space-y-2">
                  {monthHolidays.map((holiday) => {
                    const date = new Date(holiday.date);
                    const isPast = date < today;

                    return (
                      <div
                        key={holiday.date}
                        className={`flex items-center gap-4 p-3 rounded-lg border ${
                          isPast
                            ? 'bg-gray-50 border-gray-100 opacity-60'
                            : 'bg-white border-gray-200 hover:border-[#F86037]/30 hover:bg-[#F86037]/5'
                        } transition-colors`}
                      >
                        <div className={`w-12 h-12 flex flex-col items-center justify-center rounded-lg ${
                          isPast ? 'bg-gray-100' : 'bg-[#F86037]/10'
                        }`}>
                          <span className={`text-lg font-bold ${isPast ? 'text-gray-400' : 'text-[#F86037]'}`}>
                            {date.getDate()}
                          </span>
                          <span className="text-xs text-gray-500 uppercase">
                            {date.toLocaleDateString(locale === 'tet' ? 'pt-PT' : locale, { weekday: 'short' })}
                          </span>
                        </div>

                        <div className="flex-1">
                          <div className={`font-medium ${isPast ? 'text-gray-500' : 'text-gray-900'}`}>
                            {getHolidayName(holiday)}
                          </div>
                          <div className="text-sm text-gray-400">
                            {formatDate(holiday.date)}
                          </div>
                        </div>

                        {!isPast && (
                          <div className="text-xs text-gray-400">
                            {Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))} {t('daysAway')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Note */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>{t('note')}:</strong> {t('noteText')}
        </p>
      </div>
    </div>
  );
}
