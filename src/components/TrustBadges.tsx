import React from 'react';
import { Shield, Lock, Calendar } from 'lucide-react';

interface TrustBadgesProps {
  variant?: 'horizontal' | 'vertical';
  className?: string;
}

const TrustBadges: React.FC<TrustBadgesProps> = ({ 
  variant = 'horizontal', 
  className = '' 
}) => {
  const badges = [
    {
      icon: Shield,
      text: 'GDPR',
      subtext: 'Compliant'
    },
    {
      icon: Lock,
      text: 'SSL',
      subtext: 'Secure'
    },
    {
      icon: Calendar,
      text: 'Cancel',
      subtext: 'Anytime'
    }
  ];

  const containerClass = variant === 'horizontal' 
    ? 'flex items-center justify-center gap-6 flex-wrap'
    : 'flex flex-col items-center gap-4';

  return (
    <div className={`${containerClass} ${className}`}>
      {badges.map((badge, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
            <badge.icon className="h-4 w-4 text-success" />
          </div>
          <div className="text-muted-foreground">
            <span className="font-medium text-foreground">{badge.text}</span>{' '}
            {badge.subtext}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrustBadges;