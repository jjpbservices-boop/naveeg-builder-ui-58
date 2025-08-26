import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
  );
};

export const FullPageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

export const ButtonLoader = ({ children, isLoading, ...props }: any) => (
  <button disabled={isLoading} {...props}>
    {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
    {children}
  </button>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-6 border rounded-lg">
          <div className="h-8 w-16 bg-muted rounded mb-2" />
          <div className="h-6 w-24 bg-muted rounded" />
        </div>
      ))}
    </div>
  </div>
);