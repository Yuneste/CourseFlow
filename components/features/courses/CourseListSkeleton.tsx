import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CourseListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <Card 
          key={i} 
          className="overflow-hidden animate-in fade-in duration-500"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="h-1 shimmer" />
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-10 w-10 rounded-lg shimmer animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 rounded shimmer" />
                  <div className="h-4 w-20 rounded shimmer" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="h-4 w-24 rounded shimmer" />
              <div className="flex items-center justify-between">
                <div className="h-4 w-16 rounded shimmer" />
                <div className="h-4 w-20 rounded shimmer" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}