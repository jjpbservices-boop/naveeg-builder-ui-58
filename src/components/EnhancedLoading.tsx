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
      
      <div className="relative z-10 flex-1 flex items-center justify-center py-6 sm:py-8 md:py-12 px-4 sm:px-6 md:px-8">
        <div className="container mx-auto max-w-md sm:max-w-lg md:max-w-3xl lg:max-w-4xl">
          <Card className="bg-card/90 backdrop-blur-sm border shadow-soft rounded-2xl sm:rounded-3xl">
            <CardContent className="p-6 sm:p-8 md:p-10 lg:p-12">
              <div className="text-center mb-8 sm:mb-10 md:mb-12">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                  {title}
                </h1>
                <p className="text-muted-foreground text-lg sm:text-xl md:text-2xl">
                  {subtitle}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-8 sm:mb-10 md:mb-12">
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
              <div className="mb-8 sm:mb-10 md:mb-12 p-4 sm:p-5 md:p-6 bg-primary/10 rounded-lg border border-primary/20">
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
              <div className="space-y-3 sm:space-y-4 md:space-y-5 mb-8 sm:mb-10 md:mb-12">
                {steps.map((step, index) => {
                  const isCompleted = index < currentStep;
                  const isCurrent = index === currentStep;
                  const isPending = index > currentStep;

                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-4 sm:gap-5 p-3 sm:p-4 md:p-5 rounded-lg transition-all duration-300 ${
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
                <div className="text-center p-4 sm:p-5 md:p-6 bg-muted/50 rounded-lg">
                  <p className="text-sm sm:text-base text-muted-foreground">
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