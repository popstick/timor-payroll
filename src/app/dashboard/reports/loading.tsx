import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReportsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Skeleton className="h-4 w-24 mb-4" />
      <div className="mb-6">
        <Skeleton className="h-7 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-10 w-10 rounded-lg mb-2" />
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
