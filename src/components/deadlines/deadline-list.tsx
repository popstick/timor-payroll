'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { AlertCircle, AlertTriangle, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUpcomingDeadlines, formatDaysUntil, type Deadline } from '@/lib/deadlines';

interface DeadlineListProps {
  maxItems?: number;
  showViewAll?: boolean;
}

export function DeadlineList({ maxItems = 4, showViewAll = true }: DeadlineListProps) {
  const t = useTranslations('dashboard');
  const deadlines = getUpcomingDeadlines().slice(0, maxItems);

  const getUrgencyStyles = (urgency: Deadline['urgency']) => {
    switch (urgency) {
      case 'overdue':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: AlertCircle,
          iconColor: 'text-red-500',
          textColor: 'text-red-600',
          dateBg: 'bg-red-100',
        };
      case 'urgent':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          icon: AlertTriangle,
          iconColor: 'text-orange-500',
          textColor: 'text-orange-600',
          dateBg: 'bg-orange-100',
        };
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: Clock,
          iconColor: 'text-amber-500',
          textColor: 'text-amber-600',
          dateBg: 'bg-amber-100',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: CheckCircle,
          iconColor: 'text-gray-400',
          textColor: 'text-gray-500',
          dateBg: 'bg-gray-100',
        };
    }
  };

  const urgentCount = deadlines.filter(d => d.urgency === 'overdue' || d.urgency === 'urgent' || d.urgency === 'warning').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{t('upcomingDeadlines')}</CardTitle>
          {urgentCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
              <AlertTriangle className="h-3 w-3" />
              {urgentCount} attention
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {deadlines.map((deadline) => {
            const styles = getUrgencyStyles(deadline.urgency);
            const IconComponent = styles.icon;

            return (
              <div
                key={deadline.id}
                className={`flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors ${
                  deadline.urgency === 'overdue' ? 'bg-red-50/50' : ''
                }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${styles.dateBg} flex flex-col items-center justify-center`}>
                  <span className={`text-sm font-bold ${styles.urgency === 'overdue' ? 'text-red-600' : 'text-gray-700'}`}>
                    {deadline.dueDate.getDate()}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase">
                    {deadline.dueDate.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{deadline.name}</p>
                    {(deadline.urgency === 'overdue' || deadline.urgency === 'urgent') && (
                      <IconComponent className={`h-4 w-4 ${styles.iconColor}`} />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {deadline.period ? `For ${deadline.period}` : deadline.description}
                  </p>
                </div>
                <span className={`text-xs font-medium ${styles.textColor}`}>
                  {formatDaysUntil(deadline.daysUntilDue)}
                </span>
              </div>
            );
          })}

          {deadlines.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500 text-sm">
              No upcoming deadlines
            </div>
          )}
        </div>

        {showViewAll && deadlines.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100">
            <Link
              href="/dashboard/settings"
              className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-900"
            >
              {t('viewAll')}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
