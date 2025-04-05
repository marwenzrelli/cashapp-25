
import { Skeleton } from "@/components/ui/skeleton";

export function ClientSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2 w-full">
          <Skeleton className="h-10 w-32 mb-2" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-40 mt-2" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
    </div>
  );
}
