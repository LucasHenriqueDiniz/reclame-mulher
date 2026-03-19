export function BlogPostDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      {/* Back Button Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="h-6 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded" />
        <div className="h-10 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg" />
      </div>

      {/* Post Header Skeleton */}
      <div className="mb-8">
        {/* Tags */}
        <div className="flex gap-3 mb-4">
          <div className="h-8 w-24 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded-full" />
          <div className="h-8 w-32 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded-full" />
        </div>
        
        {/* Title */}
        <div className="space-y-3 mb-6">
          <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full" />
          <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-4/5" />
        </div>
        
        {/* Date */}
        <div className="h-5 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded" />
      </div>

      {/* Featured Image Skeleton */}
      <div className="mb-12 rounded-2xl overflow-hidden shadow-lg">
        <div className="w-full h-[400px] bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_200%] animate-shimmer" />
      </div>

      {/* Content Skeleton */}
      <div className="space-y-6">
        {/* Paragraph 1 */}
        <div className="space-y-3">
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full" />
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full" />
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-5/6" />
        </div>

        {/* Heading */}
        <div className="h-8 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded w-2/3 mt-8" />

        {/* Paragraph 2 */}
        <div className="space-y-3">
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full" />
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full" />
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-4/5" />
        </div>

        {/* Quote */}
        <div className="bg-gray-50 border-l-4 border-gray-300 p-6 my-8 rounded-r-lg">
          <div className="space-y-3">
            <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full" />
            <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4" />
          </div>
        </div>

        {/* Paragraph 3 */}
        <div className="space-y-3">
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full" />
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full" />
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full" />
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}
