export function BlogPostCardSkeleton() {
  return (
    <article className="flex flex-col h-full bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="relative w-full h-64 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_200%] animate-shimmer" />

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-6">
        {/* Tags Skeleton */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full" />
          <div className="h-6 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full" />
        </div>

        {/* Title Skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full" />
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4" />
        </div>

        {/* Author & Date Skeleton */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-24" />
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-20" />
          </div>
        </div>
      </div>
    </article>
  );
}
