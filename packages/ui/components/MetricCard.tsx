import { Icon, type IconName } from './Icon';
import { cn } from '../utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: IconName;
  className?: string;
  children?: React.ReactNode;
}

export function MetricCard({
  title,
  value,
  change,
  icon,
  className,
  children,
}: MetricCardProps) {
  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          
          {change && (
            <div className="flex items-center mt-2">
              <Icon
                name={change.type === 'increase' ? 'trending-up' : 'trending-down'}
                className={cn(
                  'w-4 h-4 mr-1',
                  change.type === 'increase' ? 'text-green-500' : 'text-red-500'
                )}
              />
              <span
                className={cn(
                  'text-sm font-medium',
                  change.type === 'increase' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {change.value}%
              </span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon name={icon} className="w-6 h-6 text-blue-600" />
          </div>
        )}
      </div>
      
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
