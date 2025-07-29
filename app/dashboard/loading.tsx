import { Skeleton } from '@/components/ui/skeleton'
import { UnifiedBackground, UnifiedSection } from '@/components/ui/unified-background'

export default function DashboardLoading() {
  return (
    <UnifiedBackground>
      <UnifiedSection>
      {/* Welcome Message Skeleton */}
      <div className="mb-8 text-center px-4">
        <Skeleton className="h-10 sm:h-12 w-64 sm:w-96 mx-auto mb-3" />
        <Skeleton className="h-5 w-48 mx-auto" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-card/95 backdrop-blur-sm shadow-lg rounded-lg">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Features Grid Skeleton */}
      <div>
        <Skeleton className="h-7 w-64 mx-auto mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card/80 backdrop-blur-sm shadow-xl rounded-lg p-6">
              <Skeleton className="w-14 h-14 rounded-lg mb-4" />
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <div className="flex items-center">
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
      </UnifiedSection>
    </UnifiedBackground>
  )
}