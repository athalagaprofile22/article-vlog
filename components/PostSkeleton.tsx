// components/PostSkeleton.tsx
export default function PostSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-xs animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full h-48 bg-slate-200 dark:bg-slate-800 rounded-xl mb-4" />
      
      {/* Badge & Date Skeleton */}
      <div className="flex items-center justify-between mb-2">
        <div className="w-20 h-5 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
      </div>

      {/* Title Skeleton */}
      <div className="w-full h-6 bg-slate-200 dark:bg-slate-800 rounded-md mb-2" />
      <div className="w-3/4 h-6 bg-slate-200 dark:bg-slate-800 rounded-md mb-4" />

      {/* Button Skeleton */}
      <div className="w-32 h-9 bg-slate-200 dark:bg-slate-800 rounded-full" />
    </div>
  );
}