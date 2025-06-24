export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div className="w-8 h-8 border-4 border-blue-200 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-8 h-8 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
        <div className="absolute top-1 left-1 w-6 h-6 bg-blue-100 rounded-full animate-pulse"></div>
      </div>
    </div>
  )
}
