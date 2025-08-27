import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, Circle } from 'lucide-react';
import { HeroAnimation } from '@/components/HeroAnimation';

interface LoadingStep {
  name: string;
  description: string;
}

interface EnhancedLoadingProps {
  steps: LoadingStep[];
  currentStep: number;
  title: string;
  subtitle: string;
  progress: number;
  encouragementMessage?: string;
}

export const EnhancedLoading: React.FC<EnhancedLoadingProps> = ({
  steps,
  currentStep,
  title,
  subtitle,
  progress,
  encouragementMessage
}) => {
  return (
    <div className="bg-gradient-to-br from-background via-muted/30 to-background">
      <HeroAnimation />
      
      <div className="relative z-10 flex-1 flex items-center justify-center py-4 sm:py-6 md:py-8 px-3 sm:px-4">
        <div className="container mx-auto max-w-xs sm:max-w-sm md:max-w-2xl">
          <Card className="bg-card/90 backdrop-blur-sm border shadow-soft rounded-2xl sm:rounded-3xl">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {title}
                </h1>
                <p className="text-muted-foreground text-base sm:text-lg">
                  {subtitle}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6 sm:mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs sm:text-sm font-medium text-foreground">Progress</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">{progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-primary h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Current Step Highlight */}
              <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary animate-spin flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground text-sm sm:text-base truncate">
                      {steps[currentStep]?.name}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {steps[currentStep]?.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Steps List */}
              <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {steps.map((step, index) => {
                  const isCompleted = index < currentStep;
                  const isCurrent = index === currentStep;
                  const isPending = index > currentStep;

                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-2 sm:p-3 rounded-lg transition-all duration-300 ${
                        isCurrent ? 'bg-primary/5 border border-primary/20' : 
                        isCompleted ? 'bg-muted/50' : 'opacity-60'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                        ) : isCurrent ? (
                          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary animate-spin" />
                        ) : (
                          <Circle className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`font-medium text-sm sm:text-base truncate ${
                          isCurrent ? 'text-foreground' : 
                          isCompleted ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {step.name}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Encouragement Message */}
              {encouragementMessage && (
                <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {encouragementMessage}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLoading;