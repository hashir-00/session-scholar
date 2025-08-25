import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  className,
  orientation = 'horizontal'
}) => {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div 
      className={cn(
        'flex',
        isHorizontal ? 'flex-row items-center' : 'flex-col items-start',
        className
      )}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isUpcoming = index > currentStep;

        return (
          <div
            key={step.id}
            className={cn(
              'flex items-center',
              !isHorizontal && 'w-full',
              isHorizontal && index < steps.length - 1 && 'flex-1'
            )}
          >
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex items-center justify-center rounded-full border-2 transition-all duration-300',
                  'h-10 w-10',
                  isCompleted && 'bg-primary border-primary text-primary-foreground',
                  isCurrent && 'bg-primary/10 border-primary text-primary',
                  isUpcoming && 'bg-muted border-muted-foreground/30 text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : step.icon ? (
                  <div className="h-5 w-5 flex items-center justify-center">
                    {step.icon}
                  </div>
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              
              {/* Step Labels */}
              <div className={cn(
                'mt-2 text-center',
                !isHorizontal && 'ml-4 mt-0 text-left self-start'
              )}>
                <div className={cn(
                  'text-sm font-medium transition-colors',
                  isCompleted && 'text-primary',
                  isCurrent && 'text-foreground',
                  isUpcoming && 'text-muted-foreground'
                )}>
                  {step.title}
                </div>
                {step.description && (
                  <div className={cn(
                    'text-xs transition-colors mt-1',
                    isCompleted && 'text-primary/70',
                    isCurrent && 'text-muted-foreground',
                    isUpcoming && 'text-muted-foreground/70'
                  )}>
                    {step.description}
                  </div>
                )}
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'transition-colors duration-300',
                  isHorizontal 
                    ? 'flex-1 h-0.5 mx-4' 
                    : 'w-0.5 h-8 ml-5 my-2',
                  isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
