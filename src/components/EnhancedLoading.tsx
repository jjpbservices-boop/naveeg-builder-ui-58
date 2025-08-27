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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Full-screen animation background */}
      <div className="fixed inset-0 w-full h-full">
        <HeroAnimation />
      </div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8">
        <div className="w-full max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl mx-auto">
          <Card className="bg-card/95 backdrop-blur-md border border-border/50 shadow-xl rounded-2xl sm:rounded-3xl">
            <CardContent className="p-8 sm:p-10 md:p-12 lg:p-16">
              <div className="text-center mb-10 sm:mb-12 md:mb-16">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6">
                  {title}
                </h1>
                <p className="text-muted-foreground text-xl sm:text-2xl md:text-3xl leading-relaxed">
                  {subtitle}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-10 sm:mb-12 md:mb-16">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm sm:text-base font-medium text-foreground">Progress</span>
                  <span className="text-sm sm:text-base text-muted-foreground font-semibold">{progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 sm:h-4">
                  <div 
                    className="bg-gradient-primary h-3 sm:h-4 rounded-full transition-all duration-500 ease-out shadow-sm"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Current Step Highlight */}
              <div className="mb-10 sm:mb-12 md:mb-16 p-6 sm:p-7 md:p-8 bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
                <div className="flex items-center gap-4 sm:gap-5">
                  <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 text-primary animate-spin flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-lg sm:text-xl md:text-2xl truncate">
                      {steps[currentStep]?.name}
                    </p>
                    <p className="text-base sm:text-lg text-muted-foreground mt-1">
                      {steps[currentStep]?.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Steps List */}
              <div className="space-y-4 sm:space-y-5 md:space-y-6 mb-10 sm:mb-12 md:mb-16">
                {steps.map((step, index) => {
                  const isCompleted = index < currentStep;
                  const isCurrent = index === currentStep;
                  const isPending = index > currentStep;

                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-5 sm:gap-6 p-4 sm:p-5 md:p-6 rounded-xl transition-all duration-300 ${
                        isCurrent ? 'bg-primary/5 border border-primary/20 shadow-sm' : 
                        isCompleted ? 'bg-muted/50' : 'opacity-60'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                        ) : isCurrent ? (
                          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary animate-spin" />
                        ) : (
                          <Circle className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`font-semibold text-base sm:text-lg truncate ${
                          isCurrent ? 'text-foreground' : 
                          isCompleted ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {step.name}
                        </p>
                        <p className="text-sm sm:text-base text-muted-foreground line-clamp-2 mt-1">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Encouragement Message */}
              {encouragementMessage && (
                <div className="text-center p-6 sm:p-7 md:p-8 bg-muted/50 rounded-xl">
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
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